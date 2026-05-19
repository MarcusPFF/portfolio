'use server';

import { revalidatePath } from 'next/cache';
import { isRateLimited } from '@/lib/rate-limit';
import { isMutationRateLimited } from '../_lib/rate-limit';
import { isUuid } from '../_lib/validation';
import { clientIp } from '../_lib/request';
import { getSupabase } from '../_lib/supabase';
import { getAuditContext, logAudit } from '../_lib/audit';
import { suggestTasks, type SuggestedTask } from '../_lib/ai/suggest-tasks';
import {
  suggestTilkoeb,
  type SuggestedTilkoeb,
} from '../_lib/ai/suggest-tilkoeb';
import type {
  Bryllup,
  OpgaveKategori,
  Tilkoeb,
  TilkoebType,
} from '../_lib/types';

const KATEGORI_VALUES: OpgaveKategori[] = [
  'mad',
  'transport',
  'musik',
  'blomster',
  'praest',
  'betaling',
  'koordinering',
  'overnatning',
  'andet',
];

const TILKOEB_TYPE_VALUES: TilkoebType[] = [
  'bryllupskage',
  'sejlads_anemonen',
  'fotografering',
  'brudebuket',
  'blomsterdekorationer',
  'musik',
  'shuttlebus',
  'fyrvaerkeri',
  'andet',
];

export type SuggestResult =
  | { ok: true; tasks: SuggestedTask[] }
  | { ok: false; error: string };

export async function generateTaskSuggestions(
  bryllupId: string,
): Promise<SuggestResult> {
  if (!isUuid(bryllupId)) {
    return { ok: false, error: 'Ugyldigt bryllups-id.' };
  }
  const ip = await clientIp();
  if (isRateLimited(ip)) {
    return {
      ok: false,
      error: 'For mange forespørgsler. Vent et minut og prøv igen.',
    };
  }

  const supabase = getSupabase();
  const [{ data: bryllupData }, { data: tilkoebData }] = await Promise.all([
    supabase.from('bryllupper').select('*').eq('id', bryllupId).maybeSingle(),
    supabase.from('tilkoeb').select('*').eq('bryllup_id', bryllupId),
  ]);

  if (!bryllupData) {
    return { ok: false, error: 'Bryllup ikke fundet.' };
  }

  const startedAt = Date.now();
  try {
    const tasks = await suggestTasks(
      bryllupData as Bryllup,
      (tilkoebData ?? []) as Tilkoeb[],
    );
    const ctx = await getAuditContext();
    await logAudit({
      event: 'ai.generate_tasks',
      actor: ctx.actor,
      ip: ctx.ip,
      bryllupId,
      details: {
        count: tasks.length,
        duration_ms: Date.now() - startedAt,
      },
    });
    return { ok: true, tasks };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ukendt fejl';
    const stack = err instanceof Error ? err.stack : undefined;
    console.error('[eg ai] suggestTasks failed:', message);
    if (stack) console.error(stack);

    const ctx = await getAuditContext();
    await logAudit({
      event: 'ai.generate_failed',
      actor: ctx.actor,
      ip: ctx.ip,
      bryllupId,
      details: { kind: 'tasks', error: message.slice(0, 300) },
    });

    if (/api.?key|unauthorized|401|forbidden/i.test(message)) {
      return {
        ok: false,
        error: 'Groq API-nøglen blev afvist. Tjek ENGESTOFTE_GROQ_API_KEY i .env.local.',
      };
    }
    if (/quota|rate.?limit|429/i.test(message)) {
      return {
        ok: false,
        error: 'Groq-kvoten er opbrugt. Vent et minut og prøv igen.',
      };
    }
    if (/ENGESTOFTE_GROQ_API_KEY/.test(message)) {
      return { ok: false, error: message };
    }
    return {
      ok: false,
      error: 'Kunne ikke generere forslag. Prøv igen.',
    };
  }
}

export type ApproveResult = {
  ok: boolean;
  inserted: number;
  error?: string;
};

type ApprovedTaskInput = {
  titel: string;
  kategori: string;
  dage_foer_bryllup: number;
  ansvarlig?: string | null;
};

function shiftDate(iso: string, daysBefore: number): string {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - daysBefore);
  return d.toISOString().slice(0, 10);
}

export async function approveSuggestedTasks(
  bryllupId: string,
  tasks: ApprovedTaskInput[],
): Promise<ApproveResult> {
  if (!isUuid(bryllupId)) {
    return { ok: false, inserted: 0, error: 'Ugyldigt bryllups-id.' };
  }
  if (isMutationRateLimited(await clientIp())) {
    return {
      ok: false,
      inserted: 0,
      error: 'For mange ændringer på kort tid. Vent et minut.',
    };
  }
  if (tasks.length === 0) {
    return { ok: true, inserted: 0 };
  }
  if (tasks.length > 20) {
    return { ok: false, inserted: 0, error: 'Maks 20 opgaver ad gangen.' };
  }

  const supabase = getSupabase();
  const { data: bryllup } = await supabase
    .from('bryllupper')
    .select('id, bryllupsdato')
    .eq('id', bryllupId)
    .maybeSingle();

  if (!bryllup) {
    return { ok: false, inserted: 0, error: 'Bryllup ikke fundet.' };
  }

  const { data: maxRows } = await supabase
    .from('opgaver')
    .select('raekkefoelge')
    .eq('bryllup_id', bryllupId)
    .order('raekkefoelge', { ascending: false })
    .limit(1);
  const startOrder = (maxRows?.[0]?.raekkefoelge ?? 0) + 1;

  const rows = tasks.flatMap((t, idx) => {
    const titel = String(t.titel ?? '').trim();
    if (!titel) return [];
    const kategori = KATEGORI_VALUES.find((k) => k === t.kategori) ?? 'andet';
    const dage = Number.isInteger(t.dage_foer_bryllup)
      ? Math.max(1, Math.min(730, t.dage_foer_bryllup))
      : 7;
    const deadline = shiftDate(bryllup.bryllupsdato, dage);
    return [
      {
        bryllup_id: bryllupId,
        titel: titel.slice(0, 120),
        kategori,
        deadline,
        status: 'todo' as const,
        ansvarlig: t.ansvarlig ?? null,
        raekkefoelge: startOrder + idx,
        ai_genereret: true,
      },
    ];
  });

  if (rows.length === 0) {
    return { ok: true, inserted: 0 };
  }

  const { error } = await supabase.from('opgaver').insert(rows);
  if (error) {
    return { ok: false, inserted: 0, error: error.message };
  }

  const ctx = await getAuditContext();
  await logAudit({
    event: 'ai.approve_tasks',
    actor: ctx.actor,
    ip: ctx.ip,
    bryllupId,
    details: { count: rows.length },
  });

  revalidatePath(`/llm/course10/bryllupper/${bryllupId}`);
  revalidatePath('/llm/course10/dashboard');
  return { ok: true, inserted: rows.length };
}

// ============================================================
// Tilkøbs-forslag (pitch-ideer til brudeparret)
// ============================================================

export type SuggestTilkoebResult =
  | { ok: true; tilkoeb: SuggestedTilkoeb[] }
  | { ok: false; error: string };

export async function generateTilkoebSuggestions(
  bryllupId: string,
): Promise<SuggestTilkoebResult> {
  if (!isUuid(bryllupId)) {
    return { ok: false, error: 'Ugyldigt bryllups-id.' };
  }
  const ip = await clientIp();
  if (isRateLimited(ip)) {
    return {
      ok: false,
      error: 'For mange forespørgsler. Vent et minut og prøv igen.',
    };
  }

  const supabase = getSupabase();
  const [{ data: bryllupData }, { data: tilkoebData }] = await Promise.all([
    supabase.from('bryllupper').select('*').eq('id', bryllupId).maybeSingle(),
    supabase.from('tilkoeb').select('*').eq('bryllup_id', bryllupId),
  ]);

  if (!bryllupData) {
    return { ok: false, error: 'Bryllup ikke fundet.' };
  }

  const startedAt = Date.now();
  try {
    const tilkoeb = await suggestTilkoeb(
      bryllupData as Bryllup,
      (tilkoebData ?? []) as Tilkoeb[],
    );
    const ctx = await getAuditContext();
    await logAudit({
      event: 'ai.generate_tilkoeb',
      actor: ctx.actor,
      ip: ctx.ip,
      bryllupId,
      details: {
        count: tilkoeb.length,
        duration_ms: Date.now() - startedAt,
      },
    });
    return { ok: true, tilkoeb };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Ukendt fejl';
    const stack = err instanceof Error ? err.stack : undefined;
    console.error('[eg ai] suggestTilkoeb failed:', message);
    if (stack) console.error(stack);

    const ctx = await getAuditContext();
    await logAudit({
      event: 'ai.generate_failed',
      actor: ctx.actor,
      ip: ctx.ip,
      bryllupId,
      details: { kind: 'tilkoeb', error: message.slice(0, 300) },
    });

    if (/api.?key|unauthorized|401|forbidden/i.test(message)) {
      return {
        ok: false,
        error:
          'Groq API-nøglen blev afvist. Tjek ENGESTOFTE_GROQ_API_KEY i .env.local.',
      };
    }
    if (/quota|rate.?limit|429/i.test(message)) {
      return {
        ok: false,
        error: 'Groq-kvoten er opbrugt. Vent et minut og prøv igen.',
      };
    }
    if (/ENGESTOFTE_GROQ_API_KEY/.test(message)) {
      return { ok: false, error: message };
    }
    return {
      ok: false,
      error: 'Kunne ikke generere tilkøbsforslag. Prøv igen.',
    };
  }
}

type ApprovedTilkoebInput = {
  type: string;
  beskrivelse: string;
  pris: number;
};

export async function approveSuggestedTilkoeb(
  bryllupId: string,
  items: ApprovedTilkoebInput[],
): Promise<ApproveResult> {
  if (!isUuid(bryllupId)) {
    return { ok: false, inserted: 0, error: 'Ugyldigt bryllups-id.' };
  }
  if (isMutationRateLimited(await clientIp())) {
    return {
      ok: false,
      inserted: 0,
      error: 'For mange ændringer på kort tid. Vent et minut.',
    };
  }
  if (items.length === 0) {
    return { ok: true, inserted: 0 };
  }
  if (items.length > 12) {
    return { ok: false, inserted: 0, error: 'Maks 12 tilkøb ad gangen.' };
  }

  const supabase = getSupabase();
  const { data: bryllup } = await supabase
    .from('bryllupper')
    .select('id')
    .eq('id', bryllupId)
    .maybeSingle();
  if (!bryllup) {
    return { ok: false, inserted: 0, error: 'Bryllup ikke fundet.' };
  }

  const rows = items.flatMap((t) => {
    const type = TILKOEB_TYPE_VALUES.find((v) => v === t.type);
    if (!type) return [];
    const beskrivelse = String(t.beskrivelse ?? '').trim().slice(0, 200);
    if (!beskrivelse) return [];
    const prisRaw = Number(t.pris);
    const pris =
      Number.isFinite(prisRaw) && prisRaw >= 0 && prisRaw <= 500_000
        ? Math.round(prisRaw)
        : null;
    return [
      {
        bryllup_id: bryllupId,
        type,
        beskrivelse,
        pris,
        status: 'forespurgt' as const,
      },
    ];
  });

  if (rows.length === 0) {
    return { ok: true, inserted: 0 };
  }

  const { error } = await supabase.from('tilkoeb').insert(rows);
  if (error) {
    return { ok: false, inserted: 0, error: error.message };
  }

  const ctx = await getAuditContext();
  await logAudit({
    event: 'ai.approve_tilkoeb',
    actor: ctx.actor,
    ip: ctx.ip,
    bryllupId,
    details: { count: rows.length },
  });

  revalidatePath(`/llm/course10/bryllupper/${bryllupId}`);
  return { ok: true, inserted: rows.length };
}
