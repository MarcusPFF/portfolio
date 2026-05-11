-- Engestofte Gods booking demo — audit log
-- Kør i Supabase SQL Editor. Idempotent.

create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event text not null,
  actor text not null check (actor in ('admin', 'public', 'anon', 'system')),
  ip text,
  bryllup_id uuid references bryllupper(id) on delete set null,
  details jsonb
);

create index if not exists audit_log_created_at_idx on audit_log (created_at desc);
create index if not exists audit_log_event_idx       on audit_log (event);
create index if not exists audit_log_bryllup_id_idx  on audit_log (bryllup_id);

alter table audit_log enable row level security;

-- Ingen anon adgang: kun service-role (server-side actions) kan læse/skrive
-- Admin UI henter via Server Component der bruger service-role klienten.
drop policy if exists "anon read audit_log" on audit_log;
