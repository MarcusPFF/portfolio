-- E.G. booking demo — schema
-- Kør i Supabase SQL Editor. Idempotent.

create table if not exists bryllupper (
  id uuid primary key default gen_random_uuid(),
  brudepar text not null,
  bryllupsdato date not null,
  antal_kuverter int,
  pakke text check (pakke in ('grundpakke', 'festpakke')),
  lokation text check (lokation in ('den_gamle_lade', 'vaerkstedet')),
  vielsestype text check (vielsestype in (
    'engestofte_kirke', 'maribo_domkirke', 'park', 'borgerlig', 'ingen'
  )),
  koordinator text check (koordinator in ('johan', 'lise')),
  status text not null default 'forespoergsel' check (status in (
    'forespoergsel', 'tilbud_sendt', 'booket', 'afholdt', 'aflyst'
  )),
  kontakt_email text,
  kontakt_tlf text,
  noter text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists opgaver (
  id uuid primary key default gen_random_uuid(),
  bryllup_id uuid not null references bryllupper(id) on delete cascade,
  titel text not null,
  beskrivelse text,
  kategori text check (kategori in (
    'mad', 'transport', 'musik', 'blomster', 'praest',
    'betaling', 'koordinering', 'overnatning', 'andet'
  )),
  deadline date,
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  ansvarlig text,
  raekkefoelge int not null default 0,
  ai_genereret boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists tilkoeb (
  id uuid primary key default gen_random_uuid(),
  bryllup_id uuid not null references bryllupper(id) on delete cascade,
  type text not null check (type in (
    'bryllupskage', 'sejlads_anemonen', 'fotografering', 'brudebuket',
    'blomsterdekorationer', 'musik', 'shuttlebus', 'fyrvaerkeri', 'andet'
  )),
  beskrivelse text,
  pris int,
  status text not null default 'forespurgt' check (status in (
    'forespurgt', 'bekraeftet', 'leveret'
  ))
);

create table if not exists betalinger (
  id uuid primary key default gen_random_uuid(),
  bryllup_id uuid not null references bryllupper(id) on delete cascade,
  type text check (type in ('depositum', 'slutbetaling', 'tilkoeb')),
  beloeb int not null,
  forfald date,
  betalt_dato date,
  status text not null default 'afventer' check (status in (
    'afventer', 'forfalden', 'betalt'
  ))
);

create table if not exists overnatninger (
  id uuid primary key default gen_random_uuid(),
  bryllup_id uuid not null references bryllupper(id) on delete cascade,
  type text check (type in ('brudesuite', 'sommerhus', 'glamping')),
  antal_personer int,
  fra_dato date,
  til_dato date,
  pris int
);

create or replace function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end; $$ language plpgsql;

drop trigger if exists bryllupper_updated_at on bryllupper;
create trigger bryllupper_updated_at
  before update on bryllupper
  for each row execute function set_updated_at();

alter table bryllupper enable row level security;
alter table opgaver enable row level security;
alter table tilkoeb enable row level security;
alter table betalinger enable row level security;
alter table overnatninger enable row level security;

drop policy if exists "anon read bryllupper" on bryllupper;
drop policy if exists "anon read opgaver" on opgaver;
drop policy if exists "anon read tilkoeb" on tilkoeb;
drop policy if exists "anon read betalinger" on betalinger;
drop policy if exists "anon read overnatninger" on overnatninger;

create policy "anon read bryllupper" on bryllupper for select to anon using (true);
create policy "anon read opgaver"     on opgaver     for select to anon using (true);
create policy "anon read tilkoeb"     on tilkoeb     for select to anon using (true);
create policy "anon read betalinger"  on betalinger  for select to anon using (true);
create policy "anon read overnatninger" on overnatninger for select to anon using (true);
