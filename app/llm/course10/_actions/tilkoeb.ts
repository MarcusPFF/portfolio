'use server';

import { revalidatePath } from 'next/cache';
import { getSupabase } from '../_lib/supabase';
import { isMutationRateLimited } from '../_lib/rate-limit';
import { isUuid } from '../_lib/validation';
import { clientIp } from '../_lib/request';
import { isAdmin } from '../_lib/admin-auth';
import { logAudit } from '../_lib/audit';
import type { TilkoebStatus } from '../_lib/types';

const CYCLE: Record<TilkoebStatus, TilkoebStatus> = {
  forespurgt: 'bekraeftet',
  bekraeftet: 'leveret',
  leveret: 'forespurgt',
};

export async function cycleTilkoebStatus(
  tilkoebId: string,
  bryllupId: string,
): Promise<void> {
  if (!isUuid(tilkoebId) || !isUuid(bryllupId)) return;
  if (isMutationRateLimited(await clientIp())) return;

  const supabase = getSupabase();
  const { data: current, error } = await supabase
    .from('tilkoeb')
    .select('status')
    .eq('id', tilkoebId)
    .single();

  if (error || !current) return;
  const next = CYCLE[current.status as TilkoebStatus];

  await supabase.from('tilkoeb').update({ status: next }).eq('id', tilkoebId);

  revalidatePath(`/llm/course10/bryllupper/${bryllupId}`);
}

export async function deleteTilkoeb(
  tilkoebId: string,
  bryllupId: string,
): Promise<void> {
  if (!(await isAdmin())) return;
  if (!isUuid(tilkoebId) || !isUuid(bryllupId)) return;
  const ip = await clientIp();
  if (isMutationRateLimited(ip)) return;

  const supabase = getSupabase();
  const { data: tilkoeb } = await supabase
    .from('tilkoeb')
    .select('type, beskrivelse')
    .eq('id', tilkoebId)
    .maybeSingle();

  const { error } = await supabase
    .from('tilkoeb')
    .delete()
    .eq('id', tilkoebId);
  if (error) {
    console.error('[eg deleteTilkoeb]', error);
    return;
  }

  await logAudit({
    event: 'admin.delete_tilkoeb',
    actor: 'admin',
    ip,
    bryllupId,
    details: tilkoeb
      ? { type: tilkoeb.type, beskrivelse: tilkoeb.beskrivelse }
      : { id: tilkoebId },
  });

  revalidatePath(`/llm/course10/bryllupper/${bryllupId}`);
}
