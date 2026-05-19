-- E.G. booking demo — sync direction
-- Skelner mellem download (Trello → Supabase) og upload (Supabase → Trello).
-- Eksisterende rækker bliver markeret som 'download' siden det var det eneste flow før.

alter table sync_log
  add column if not exists direction text not null default 'download';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'sync_log_direction_check') then
    alter table sync_log
      add constraint sync_log_direction_check
      check (direction in ('download', 'upload'));
  end if;
end $$;

create index if not exists sync_log_direction_idx on sync_log (direction, started_at desc);
