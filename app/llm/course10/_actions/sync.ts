'use server';

import { revalidatePath } from 'next/cache';
import { isAdmin } from '../_lib/admin-auth';
import { clientIp } from '../_lib/request';
import { isMutationRateLimited } from '../_lib/rate-limit';
import { getSupabase } from '../_lib/supabase';
import { logAudit } from '../_lib/audit';
import { syncFromTrello } from '../_lib/trello/sync';
import { uploadToTrello } from '../_lib/trello/upload';
import { fetchBoardListsWithCards, updateList } from '../_lib/trello/client';

export type SyncActionResult =
  | {
      ok: true;
      weddings: { created: number; updated: number };
      tasks: { created: number; updated: number };
      duration_ms: number;
      warnings: string[];
    }
  | { ok: false; error: string };

type Direction = 'download' | 'upload';

async function startLog(direction: Direction): Promise<string | null> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from('sync_log')
    .insert({ direction })
    .select('id')
    .single();
  return data?.id ?? null;
}

async function finishLog(
  logId: string | null,
  values: {
    success: boolean;
    weddings_created?: number;
    weddings_updated?: number;
    tasks_created?: number;
    tasks_updated?: number;
    duration_ms: number;
    error_message?: string | null;
  },
): Promise<void> {
  if (!logId) return;
  const supabase = getSupabase();
  await supabase
    .from('sync_log')
    .update({
      finished_at: new Date().toISOString(),
      ...values,
    })
    .eq('id', logId);
}

function mapTrelloError(message: string): string {
  if (/Trello-konfiguration mangler/.test(message)) {
    return message;
  }
  if (/401|403|invalid (key|token)/i.test(message)) {
    return 'Trello afviste credentials. Tjek ENGESTOFTE_TRELLO_API_KEY og ENGESTOFTE_TRELLO_TOKEN.';
  }
  if (/404/i.test(message)) {
    return 'Trello-boardet blev ikke fundet. Tjek ENGESTOFTE_TRELLO_BOARD_ID.';
  }
  if (/429/i.test(message)) {
    return 'Trello rate limit ramt. Vent et minut og prøv igen.';
  }
  return 'Sync fejlede. Tjek serverlog for detaljer.';
}

export async function syncFromTrelloAction(): Promise<SyncActionResult> {
  if (!(await isAdmin())) {
    return { ok: false, error: 'Ikke autoriseret.' };
  }
  if (isMutationRateLimited(await clientIp())) {
    return {
      ok: false,
      error: 'For mange sync-forsøg. Vent et minut og prøv igen.',
    };
  }

  const startedAt = Date.now();
  const ip = await clientIp();
  const logId = await startLog('download');

  try {
    const result = await syncFromTrello();
    await finishLog(logId, {
      success: true,
      weddings_created: result.weddings_created,
      weddings_updated: result.weddings_updated,
      tasks_created: result.tasks_created,
      tasks_updated: result.tasks_updated,
      duration_ms: result.duration_ms,
      error_message:
        result.warnings.length > 0
          ? result.warnings.slice(0, 5).join(' | ').slice(0, 500)
          : null,
    });
    await logAudit({
      event: 'admin.sync_download',
      actor: 'admin',
      ip,
      details: {
        weddings_created: result.weddings_created,
        weddings_updated: result.weddings_updated,
        tasks_created: result.tasks_created,
        tasks_updated: result.tasks_updated,
        duration_ms: result.duration_ms,
        warnings: result.warnings.length,
      },
    });
    revalidatePath('/llm/course10', 'layout');
    return {
      ok: true,
      weddings: {
        created: result.weddings_created,
        updated: result.weddings_updated,
      },
      tasks: {
        created: result.tasks_created,
        updated: result.tasks_updated,
      },
      duration_ms: result.duration_ms,
      warnings: result.warnings,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ukendt fejl';
    console.error('[engestofte trello sync download]', message);
    await finishLog(logId, {
      success: false,
      duration_ms: Date.now() - startedAt,
      error_message: message.slice(0, 500),
    });
    await logAudit({
      event: 'admin.sync_failed',
      actor: 'admin',
      ip,
      details: { direction: 'download', error: message.slice(0, 300) },
    });
    return { ok: false, error: mapTrelloError(message) };
  }
}

export async function uploadToTrelloAction(): Promise<SyncActionResult> {
  if (!(await isAdmin())) {
    return { ok: false, error: 'Ikke autoriseret.' };
  }
  if (isMutationRateLimited(await clientIp())) {
    return {
      ok: false,
      error: 'For mange sync-forsøg. Vent et minut og prøv igen.',
    };
  }

  const startedAt = Date.now();
  const ip = await clientIp();
  const logId = await startLog('upload');

  try {
    const result = await uploadToTrello();
    await finishLog(logId, {
      success: true,
      weddings_created: result.weddings_created,
      weddings_updated: result.weddings_updated,
      tasks_created: result.tasks_created,
      tasks_updated: result.tasks_updated,
      duration_ms: result.duration_ms,
      error_message:
        result.warnings.length > 0
          ? result.warnings.slice(0, 5).join(' | ').slice(0, 500)
          : null,
    });
    await logAudit({
      event: 'admin.sync_upload',
      actor: 'admin',
      ip,
      details: {
        weddings_created: result.weddings_created,
        weddings_updated: result.weddings_updated,
        tasks_created: result.tasks_created,
        tasks_updated: result.tasks_updated,
        duration_ms: result.duration_ms,
        warnings: result.warnings.length,
      },
    });
    revalidatePath('/llm/course10', 'layout');
    return {
      ok: true,
      weddings: {
        created: result.weddings_created,
        updated: result.weddings_updated,
      },
      tasks: {
        created: result.tasks_created,
        updated: result.tasks_updated,
      },
      duration_ms: result.duration_ms,
      warnings: result.warnings,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ukendt fejl';
    console.error('[engestofte trello sync upload]', message);
    await finishLog(logId, {
      success: false,
      duration_ms: Date.now() - startedAt,
      error_message: message.slice(0, 500),
    });
    await logAudit({
      event: 'admin.sync_failed',
      actor: 'admin',
      ip,
      details: { direction: 'upload', error: message.slice(0, 300) },
    });
    return { ok: false, error: mapTrelloError(message) };
  }
}

export type ResetTrelloResult =
  | { ok: true; lists_archived: number }
  | { ok: false; error: string };

export async function resetTrelloBoardAction(): Promise<ResetTrelloResult> {
  if (!(await isAdmin())) {
    return { ok: false, error: 'Ikke autoriseret.' };
  }
  if (isMutationRateLimited(await clientIp())) {
    return {
      ok: false,
      error: 'For mange handlinger på kort tid. Vent et minut og prøv igen.',
    };
  }

  const ip = await clientIp();
  const supabase = getSupabase();

  try {
    const lists = await fetchBoardListsWithCards();
    let archived = 0;
    for (const list of lists) {
      if (list.closed) continue;
      await updateList(list.id, { closed: true });
      archived += 1;
    }

    // Clear stale Trello-IDs på Supabase-rækker så næste upload opretter friske lister
    await supabase
      .from('bryllupper')
      .update({ trello_list_id: null })
      .not('trello_list_id', 'is', null);
    await supabase
      .from('opgaver')
      .update({ trello_card_id: null })
      .not('trello_card_id', 'is', null);

    await logAudit({
      event: 'admin.reset_trello_board',
      actor: 'admin',
      ip,
      details: { lists_archived: archived },
    });
    revalidatePath('/llm/course10', 'layout');
    return { ok: true, lists_archived: archived };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ukendt fejl';
    console.error('[engestofte trello reset]', message);
    return { ok: false, error: mapTrelloError(message) };
  }
}
