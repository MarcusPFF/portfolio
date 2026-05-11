'use server';

import { revalidatePath } from 'next/cache';
import { getSupabase } from '../_lib/supabase';
import { isMutationRateLimited } from '../_lib/rate-limit';
import { isUuid } from '../_lib/validation';
import { clientIp } from '../_lib/request';
import { isAdmin } from '../_lib/admin-auth';
import { logAudit } from '../_lib/audit';
import type { BetalingStatus, BetalingType } from '../_lib/types';

const BETALING_TYPE_VALUES: BetalingType[] = [
  'depositum',
  'slutbetaling',
  'tilkoeb',
];

export type CreateBetalingResult =
  | { ok: true }
  | { ok: false; error: string };

function asInt(value: FormDataEntryValue | null, max: number): number | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0 || n > max) return null;
  return n;
}

function asDate(value: FormDataEntryValue | null): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
  if (Number.isNaN(new Date(trimmed).getTime())) return null;
  return trimmed;
}

export async function createBetaling(
  bryllupId: string,
  fd: FormData,
): Promise<CreateBetalingResult> {
  if (!isUuid(bryllupId)) {
    return { ok: false, error: 'Ugyldigt bryllups-id.' };
  }
  if (isMutationRateLimited(await clientIp())) {
    return { ok: false, error: 'For mange ændringer på kort tid. Vent et minut.' };
  }

  const typeRaw = fd.get('type');
  const type =
    typeof typeRaw === 'string'
      ? BETALING_TYPE_VALUES.find((t) => t === typeRaw) ?? null
      : null;
  if (!type) {
    return { ok: false, error: 'Vælg en betalingstype.' };
  }

  const beloeb = asInt(fd.get('beloeb'), 5_000_000);
  if (beloeb === null || beloeb <= 0) {
    return { ok: false, error: 'Beløb skal være et positivt heltal.' };
  }

  const forfald = asDate(fd.get('forfald'));
  const betaltDato = asDate(fd.get('betalt_dato'));
  const status: BetalingStatus = betaltDato ? 'betalt' : 'afventer';

  const supabase = getSupabase();
  const { data: bryllup } = await supabase
    .from('bryllupper')
    .select('id')
    .eq('id', bryllupId)
    .maybeSingle();
  if (!bryllup) {
    return { ok: false, error: 'Bryllup ikke fundet.' };
  }

  const { error } = await supabase.from('betalinger').insert({
    bryllup_id: bryllupId,
    type,
    beloeb,
    forfald,
    betalt_dato: betaltDato,
    status,
  });

  if (error) {
    console.error('[engestofte createBetaling]', error);
    return { ok: false, error: 'Kunne ikke registrere betaling. Prøv igen.' };
  }

  revalidatePath(`/llm/course10/bryllupper/${bryllupId}`);
  revalidatePath('/llm/course10/dashboard');
  return { ok: true };
}

/**
 * Toggle mellem afventer/forfalden og betalt.
 * Klik på en ubetalt betaling markerer den som betalt (med dagens dato).
 * Klik på en betalt sætter den tilbage til afventer (og nulstiller betalt_dato).
 * "forfalden" er en afledt tilstand fra forfald-datoen og toggles ikke direkte.
 */
export async function toggleBetalingStatus(
  betalingId: string,
  bryllupId: string,
): Promise<void> {
  if (!isUuid(betalingId) || !isUuid(bryllupId)) return;
  if (isMutationRateLimited(await clientIp())) return;

  const supabase = getSupabase();
  const { data: current, error } = await supabase
    .from('betalinger')
    .select('status')
    .eq('id', betalingId)
    .single();

  if (error || !current) return;
  const currentStatus = current.status as BetalingStatus;

  const update =
    currentStatus === 'betalt'
      ? { status: 'afventer' as const, betalt_dato: null }
      : {
          status: 'betalt' as const,
          betalt_dato: new Date().toISOString().slice(0, 10),
        };

  await supabase.from('betalinger').update(update).eq('id', betalingId);

  revalidatePath(`/llm/course10/bryllupper/${bryllupId}`);
  revalidatePath('/llm/course10/dashboard');
}

export async function deleteBetaling(
  betalingId: string,
  bryllupId: string,
): Promise<void> {
  if (!(await isAdmin())) return;
  if (!isUuid(betalingId) || !isUuid(bryllupId)) return;
  const ip = await clientIp();
  if (isMutationRateLimited(ip)) return;

  const supabase = getSupabase();
  const { data: betaling } = await supabase
    .from('betalinger')
    .select('type, beloeb')
    .eq('id', betalingId)
    .maybeSingle();

  const { error } = await supabase
    .from('betalinger')
    .delete()
    .eq('id', betalingId);
  if (error) {
    console.error('[engestofte deleteBetaling]', error);
    return;
  }

  await logAudit({
    event: 'admin.delete_betaling',
    actor: 'admin',
    ip,
    bryllupId,
    details: betaling
      ? { type: betaling.type, beloeb: betaling.beloeb }
      : { id: betalingId },
  });

  revalidatePath(`/llm/course10/bryllupper/${bryllupId}`);
  revalidatePath('/llm/course10/dashboard');
}
