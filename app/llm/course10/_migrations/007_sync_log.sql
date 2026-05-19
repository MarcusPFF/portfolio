-- E.G. booking demo — Trello sync log
-- Hver sync skriver én række (success eller fejl). Bruges af SyncButton til at
-- vise "sidst synkroniseret" og af admin til at undersøge fejlede sync-forsøg.

create table if not exists sync_log (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  success boolean,
  weddings_created int default 0,
  weddings_updated int default 0,
  tasks_created int default 0,
  tasks_updated int default 0,
  duration_ms int,
  error_message text
);

create index if not exists sync_log_started_at_idx on sync_log (started_at desc);

alter table sync_log enable row level security;

-- Ingen anon-policy: kun service role (server-side) skriver/læser.
drop policy if exists "anon read sync_log" on sync_log;
