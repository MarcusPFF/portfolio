-- E.G. booking demo — Trello sync IDs
-- Stable external references der bruges som upsert-nøgler ved sync.
-- Idempotent: kan re-køres uden problemer.

alter table bryllupper
  add column if not exists trello_list_id text;

alter table opgaver
  add column if not exists trello_card_id text;

-- Unique constraints så upsert virker korrekt. NULL er ikke "unique"-checked
-- i Postgres, så eksisterende rækker uden trello-id forbliver gyldige.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'bryllupper_trello_list_id_key'
  ) then
    alter table bryllupper add constraint bryllupper_trello_list_id_key unique (trello_list_id);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'opgaver_trello_card_id_key'
  ) then
    alter table opgaver add constraint opgaver_trello_card_id_key unique (trello_card_id);
  end if;
end $$;

create index if not exists bryllupper_trello_list_id_idx on bryllupper (trello_list_id);
create index if not exists opgaver_trello_card_id_idx on opgaver (trello_card_id);
