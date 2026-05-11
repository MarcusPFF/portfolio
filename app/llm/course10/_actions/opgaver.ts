'use server';

import { revalidatePath } from 'next/cache';
import { getSupabase } from '../_lib/supabase';
import { isMutationRateLimited } from '../_lib/rate-limit';
import { isUuid } from '../_lib/validation';
import { clientIp } from '../_lib/request';
import { isAdmin } from '../_lib/admin-auth';
import { logAudit } from '../_lib/audit';
import type { OpgaveStatus } from '../_lib/types';

const CYCLE: Record<OpgaveStatus, OpgaveStatus> = {
  todo: 'in_progress',
  in_progress: 'done',
  done: 'todo',
};

export async function cycleOpgaveStatus(
  opgaveId: string,
  bryllupId: string,
): Promise<void> {
  if (!isUuid(opgaveId) || !isUuid(bryllupId)) return;
  if (isMutationRateLimited(await clientIp())) return;

  const supabase = getSupabase();
  const { data: current, error: readError } = await supabase
    .from('opgaver')
    .select('status')
    .eq('id', opgaveId)
    .single();

  if (readError || !current) return;
  const next = CYCLE[current.status as OpgaveStatus];

  await supabase.from('opgaver').update({ status: next }).eq('id', opgaveId);

  revalidatePath(`/llm/course10/bryllupper/${bryllupId}`);
  revalidatePath('/llm/course10/dashboard');
}

export async function deleteOpgave(
  opgaveId: string,
  bryllupId: string,
): Promise<void> {
  if (!(await isAdmin())) return;
  if (!isUuid(opgaveId) || !isUuid(bryllupId)) return;
  const ip = await clientIp();
  if (isMutationRateLimited(ip)) return;

  const supabase = getSupabase();
  const { data: opgave } = await supabase
    .from('opgaver')
    .select('titel')
    .eq('id', opgaveId)
    .maybeSingle();

  const { error } = await supabase.from('opgaver').delete().eq('id', opgaveId);
  if (error) {
    console.error('[engestofte deleteOpgave]', error);
    return;
  }

  await logAudit({
    event: 'admin.delete_opgave',
    actor: 'admin',
    ip,
    bryllupId,
    details: opgave ? { titel: opgave.titel } : { id: opgaveId },
  });

  revalidatePath(`/llm/course10/bryllupper/${bryllupId}`);
  revalidatePath('/llm/course10/dashboard');
}
