# E.G. · Booking demo

Pitch-demo for E.G. (Course 10). Internt admin-værktøj til
bryllupskoordination. Bygget som sub-app inden i portfoliet, fuldstændig
indeholdt i denne mappe.

- Live: <https://marcuspff.com/llm/course10>
- Database: deles med portfoliets eksisterende Supabase-projekt
- Tabeller: `bryllupper`, `opgaver`, `tilkoeb`, `betalinger`, `overnatninger`

## Konventioner

- **Domæne på dansk:** tabel- og kolonnenavne samt UI-strenge.
- **Kode på engelsk:** TypeScript-types, variabler, komponenter.
- **Server Components by default.** Klient kun til interaktivitet.
- **Alle Supabase-kald server-side** med service role key. Klienten taler aldrig
  direkte med Supabase.

## Env vars

Tilføj til `.env.local` (genbruger eksisterende Supabase-credentials):

```
ENGESTOFTE_GROQ_API_KEY=...        # Phase 4 (AI-forslag)
ENGESTOFTE_ADMIN_PASSWORD=exam2026 # Phase 3 (admin-gate)
ENGESTOFTE_TRELLO_API_KEY=...      # Phase 5 (Trello-sync)
ENGESTOFTE_TRELLO_TOKEN=...        # Phase 5
ENGESTOFTE_TRELLO_BOARD_ID=...     # Phase 5
```

`NEXT_PUBLIC_SUPABASE_URL` og `SUPABASE_SERVICE_ROLE_KEY` deles med resten
af portfoliet og er allerede sat.

## Mappestruktur

```
app/llm/course10/
  layout.tsx                      E.G.-shell (cream + serif)
  page.tsx                        Redirect til /dashboard
  eg.css                          Scoped baggrunds-overrides
  dashboard/
  kalender/
  bryllupper/
    page.tsx                      Liste med filtre
    [id]/page.tsx                 Detalje
  _components/                    UI (private, ikke-routable)
  _lib/                           Supabase, types, formatering (private)
  _migrations/                    SQL til Supabase
```

Mapper med underscore er Next.js private folders → opt-out af routing.

## Database setup

SQL ligger i `_migrations/`. Kør i Supabase SQL Editor:

1. `001_initial.sql` — skema, RLS, triggers.
2. `002_seed.sql` — 6 mock-bryllupper med opgaver, tilkøb, betalinger, overnatninger.
3. `003_audit_log.sql` — audit_log tabel + indexes.
4. `004_overnatninger_properties.sql` — navngivne ejendomme (Hospitalet, Hushovmesterboligen, m.fl.).
5. `005_overnatninger_fiskerhuset.sql` — tilføj Fiskerhuset.
6. `006_trello_ids.sql` — trello_list_id på bryllupper, trello_card_id på opgaver (upsert-nøgler).
7. `007_sync_log.sql` — sync_log tabel til Trello-sync historik.

Begge er idempotente. Seed truncater tabellerne først, så du kan re-run for at
nulstille demo-data.

## Sletning af demoen

Når pitchet er forbi:

1. Slet hele mappen `app/llm/course10/`.
2. Slet Course 10-kortet i `lib/data.ts`.
3. Slet course-blog filen `content/course-blogs/course10.md`.
4. Fjern `ENGESTOFTE_*`-blokken fra `.env.local`.
5. Drop tabellerne i Supabase:

```sql
drop table if exists sync_log;
drop table if exists audit_log;
drop table if exists overnatninger;
drop table if exists betalinger;
drop table if exists tilkoeb;
drop table if exists opgaver;
drop table if exists bryllupper;
drop function if exists set_updated_at();
```

Ingen andre dele af portfoliet rører E.G.-koden, så det er den eneste
oprydning der kræves.

## Faser

- **Phase 1** ✓ Foundation: layout, dashboard, kalender, bryllupsliste, detalje.
- **Phase 2** ✓ Opret/rediger bryllup. Form-validation.
- **Phase 3** ✓ Admin-gate (password `exam2026`). Reset til seed.
- **Phase 4** ✓ AI-opgaveforslag og AI-tilkøbsforslag via Groq Llama 3.3 70B.
- **Phase 5** ✓ Trello-sync. Refactor af mapping når E.G. sender deres egen skabelon.

## Trello board-format

Mapping-detaljer i `_lib/trello/mapping.ts`. Kort version:

- **Hver liste** på boardet = ét bryllup. Liste-navn = brudepar.
- **Første kort med titel "📋 Bryllup detaljer"** indeholder metadata i sin description:
  ```
  Bryllupsdato: 2026-06-14
  Antal kuverter: 85
  Pakke: festpakke
  Lokation: vaerkstedet
  Vielsestype: maribo_domkirke
  Koordinator: johan
  Status: booket
  Email: anna.lars@example.dk
  Tlf: +45 24 55 66 77
  Noter: Frihjul med Anemonen
  ```
- **Alle øvrige kort** = opgaver. Kort-navn = titel, kort-due = deadline,
  dueComplete = status (done/todo), kort-desc = beskrivelse.

Sync er idempotent (upsert på `trello_list_id`/`trello_card_id`) og additiv —
slettede kort/lister forbliver i Supabase for at undgå datatab.
