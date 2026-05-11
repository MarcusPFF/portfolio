'use server';

import { revalidatePath } from 'next/cache';
import { getSupabase } from '../_lib/supabase';
import { isMutationRateLimited } from '../_lib/rate-limit';
import { isUuid } from '../_lib/validation';
import { clientIp } from '../_lib/request';
import { isAdmin } from '../_lib/admin-auth';
import { logAudit } from '../_lib/audit';
import type { OvernatningType } from '../_lib/types';

const TYPE_VALUES: OvernatningType[] = [
  'hospitalet',
  'hushovmesterboligen',
  'fiskerhuset',
  'grevindens_hus',
  'skovloeberhuset',
  'glamping',
];

export type CreateOvernatningResult =
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

export async function createOvernatning(
  bryllupId: string,
  fd: FormData,
): Promise<CreateOvernatningResult> {
  if (!isUuid(bryllupId)) {
    return { ok: false, error: 'Ugyldigt bryllups-id.' };
  }
  if (isMutationRateLimited(await clientIp())) {
    return { ok: false, error: 'For mange ændringer på kort tid. Vent et minut.' };
  }

  const typeRaw = fd.get('type');
  const type =
    typeof typeRaw === 'string'
      ? TYPE_VALUES.find((t) => t === typeRaw) ?? null
      : null;
  if (!type) {
    return { ok: false, error: 'Vælg en ejendom.' };
  }

  const antalPersoner = asInt(fd.get('antal_personer'), 50);
  const fraDato = asDate(fd.get('fra_dato'));
  const tilDato = asDate(fd.get('til_dato'));
  const pris = asInt(fd.get('pris'), 200_000);

  if (fraDato && tilDato && new Date(tilDato) < new Date(fraDato)) {
    return { ok: false, error: 'Slutdato skal være efter startdato.' };
  }

  const supabase = getSupabase();
  const { data: bryllup } = await supabase
    .from('bryllupper')
    .select('id')
    .eq('id', bryllupId)
    .maybeSingle();
  if (!bryllup) {
    return { ok: false, error: 'Bryllup ikke fundet.' };
  }

  const { error } = await supabase.from('overnatninger').insert({
    bryllup_id: bryllupId,
    type,
    antal_personer: antalPersoner,
    fra_dato: fraDato,
    til_dato: tilDato,
    pris,
  });

  if (error) {
    console.error('[engestofte createOvernatning]', error);
    return { ok: false, error: 'Kunne ikke tilføje overnatning. Prøv igen.' };
  }

  revalidatePath(`/llm/course10/bryllupper/${bryllupId}`);
  return { ok: true };
}

export async function deleteOvernatning(
  overnatningId: string,
  bryllupId: string,
): Promise<void> {
  if (!(await isAdmin())) return;
  if (!isUuid(overnatningId) || !isUuid(bryllupId)) return;
  const ip = await clientIp();
  if (isMutationRateLimited(ip)) return;

  const supabase = getSupabase();
  const { data: overnatning } = await supabase
    .from('overnatninger')
    .select('type, antal_personer, fra_dato, til_dato')
    .eq('id', overnatningId)
    .maybeSingle();

  const { error } = await supabase
    .from('overnatninger')
    .delete()
    .eq('id', overnatningId);
  if (error) {
    console.error('[engestofte deleteOvernatning]', error);
    return;
  }

  await logAudit({
    event: 'admin.delete_overnatning',
    actor: 'admin',
    ip,
    bryllupId,
    details: overnatning
      ? {
          type: overnatning.type,
          antal_personer: overnatning.antal_personer,
          fra_dato: overnatning.fra_dato,
          til_dato: overnatning.til_dato,
        }
      : { id: overnatningId },
  });

  revalidatePath(`/llm/course10/bryllupper/${bryllupId}`);
}
