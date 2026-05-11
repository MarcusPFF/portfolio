import { getSupabase } from './supabase';
import { isAdmin } from './admin-auth';
import { clientIp } from './request';

export type AuditEvent =
  | 'admin.login_success'
  | 'admin.login_failure'
  | 'admin.logout'
  | 'admin.reset_to_seed'
  | 'admin.delete_wedding'
  | 'admin.delete_opgave'
  | 'admin.delete_tilkoeb'
  | 'admin.delete_betaling'
  | 'admin.delete_overnatning'
  | 'admin.sync_download'
  | 'admin.sync_upload'
  | 'admin.sync_failed'
  | 'admin.reset_trello_board'
  | 'admin.delete_all_weddings'
  | 'wedding.create'
  | 'wedding.update'
  | 'ai.generate_tasks'
  | 'ai.generate_tilkoeb'
  | 'ai.approve_tasks'
  | 'ai.approve_tilkoeb'
  | 'ai.generate_failed';

export type AuditActor = 'admin' | 'public' | 'anon' | 'system';

export type AuditContext = {
  actor: AuditActor;
  ip: string;
};

export async function getAuditContext(): Promise<AuditContext> {
  const ip = await clientIp();
  const actor: AuditActor = (await isAdmin()) ? 'admin' : 'public';
  return { actor, ip };
}

export async function logAudit(args: {
  event: AuditEvent;
  actor: AuditActor;
  ip?: string;
  bryllupId?: string | null;
  details?: Record<string, unknown>;
}): Promise<void> {
  try {
    const supabase = getSupabase();
    await supabase.from('audit_log').insert({
      event: args.event,
      actor: args.actor,
      ip: args.ip ?? null,
      bryllup_id: args.bryllupId ?? null,
      details: args.details ?? null,
    });
  } catch (err) {
    // Audit log må aldrig blokere selve operationen.
    const message = err instanceof Error ? err.message : 'ukendt';
    console.error('[engestofte audit] log failed:', message);
  }
}
