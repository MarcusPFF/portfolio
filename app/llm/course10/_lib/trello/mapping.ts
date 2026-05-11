/**
 * ============================================================================
 * Engestofte Trello board-format — mapping fra Trello til Supabase
 * ============================================================================
 *
 * Strukturen vi parser:
 *
 *   BOARD (Engestofte)
 *   ├── LIST "Sofie & Mikkel"               ← liste-navn = brudepar
 *   │   ├── CARD "📋 Bryllup detaljer"      ← første kort = metadata (parses som desc)
 *   │   │   description:
 *   │   │     Bryllupsdato: 2026-04-25
 *   │   │     Antal kuverter: 120
 *   │   │     Pakke: grundpakke
 *   │   │     Lokation: den_gamle_lade
 *   │   │     Vielsestype: engestofte_kirke
 *   │   │     Koordinator: lise
 *   │   │     Status: afholdt
 *   │   │     Email: sofie@example.dk
 *   │   │     Tlf: +45 28 11 22 33
 *   │   │     Noter: Stort selskab, alt forløb planmæssigt.
 *   │   ├── CARD "Kontakt præst"            ← alle øvrige kort = opgaver
 *   │   │   due: 2026-02-25
 *   │   │   description: Optional ekstra noter
 *   │   ├── CARD "Bekræft menu med køkken"
 *   │   └── ...
 *   └── LIST "Anna & Lars"
 *       └── ...
 *
 * Regler:
 * - Metadata-kort kan have hvilken som helst titel der starter med "📋", eller
 *   matche regex'en METADATA_TITLE_RE nedenfor. Det første sådanne kort i
 *   listen bruges; resten ignoreres som om de er normale opgaver.
 * - Metadata-felter er case-insensitive. Linjer der ikke matcher "key: value"
 *   ignoreres uden fejl.
 * - Brudepar = liste-navn (trimmet). Hvis tomt → listen skippes.
 * - Bryllupsdato skal være YYYY-MM-DD og parsable som dato. Ellers → null.
 * - Enum-felter (pakke, lokation, vielsestype, koordinator, status) valideres
 *   mod tilladte værdier i types.ts; ugyldigt → null.
 * - Antal kuverter: integer 1-500 ellers null.
 * - Opgaver: Trello-kortets "due" → opgave.deadline (YYYY-MM-DD)
 *           "dueComplete" → opgave.status (done hvis true, ellers todo)
 *           "pos" → opgave.raekkefoelge (skaleret)
 *
 * Sync er additiv: hvis et kort/liste slettes i Trello, forbliver det i
 * Supabase. Det er bevidst valgt for at undgå utilsigtet datatab.
 *
 * ============================================================================
 */

import type {
  BryllupStatus,
  Koordinator,
  Lokation,
  OpgaveKategori,
  OpgaveStatus,
  Pakke,
  Vielsestype,
} from '../types';
import type { TrelloCard, TrelloListWithCards } from './client';

const METADATA_TITLE_RE = /^[📋\s]*(bryllup\s*detaljer|metadata|detaljer)\b/i;

const STATUS_VALUES: BryllupStatus[] = [
  'forespoergsel',
  'tilbud_sendt',
  'booket',
  'afholdt',
  'aflyst',
];
const PAKKE_VALUES: Pakke[] = ['grundpakke', 'festpakke'];
const LOKATION_VALUES: Lokation[] = ['den_gamle_lade', 'vaerkstedet'];
const VIELSESTYPE_VALUES: Vielsestype[] = [
  'engestofte_kirke',
  'maribo_domkirke',
  'park',
  'borgerlig',
  'ingen',
];
const KOORDINATOR_VALUES: Koordinator[] = ['johan', 'lise'];

/* ------------------------------------------------------------------------- */
/* Metadata parsing                                                          */
/* ------------------------------------------------------------------------- */

const METADATA_KEY_ALIAS: Record<string, string> = {
  bryllupsdato: 'bryllupsdato',
  dato: 'bryllupsdato',
  'antal kuverter': 'antal_kuverter',
  kuverter: 'antal_kuverter',
  pakke: 'pakke',
  lokation: 'lokation',
  vielsestype: 'vielsestype',
  vielse: 'vielsestype',
  koordinator: 'koordinator',
  status: 'status',
  email: 'kontakt_email',
  'kontakt email': 'kontakt_email',
  'kontakt-email': 'kontakt_email',
  tlf: 'kontakt_tlf',
  telefon: 'kontakt_tlf',
  'kontakt tlf': 'kontakt_tlf',
  noter: 'noter',
};

function parseMetadataLines(desc: string): Record<string, string> {
  const out: Record<string, string> = {};
  const lines = desc.split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const match = line.match(/^([^:]{1,40}):\s*(.+)$/);
    if (!match) continue;
    const rawKey = match[1].trim().toLowerCase();
    const value = match[2].trim();
    const normalizedKey = METADATA_KEY_ALIAS[rawKey];
    if (!normalizedKey) continue;
    if (!value) continue;
    out[normalizedKey] = value;
  }
  return out;
}

function pickEnum<T extends string>(value: string | undefined, allowed: T[]): T | null {
  if (!value) return null;
  const lower = value.toLowerCase().trim();
  return allowed.find((v) => v === lower) ?? null;
}

function parseDateYmd(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
  if (Number.isNaN(new Date(trimmed).getTime())) return null;
  return trimmed;
}

function parseInteger(
  value: string | undefined,
  min: number,
  max: number,
): number | null {
  if (!value) return null;
  const n = Number(value.trim());
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < min || n > max) {
    return null;
  }
  return n;
}

/* ------------------------------------------------------------------------- */
/* Wedding from list + metadata card                                          */
/* ------------------------------------------------------------------------- */

export type WeddingUpsertPayload = {
  trello_list_id: string;
  brudepar: string;
  bryllupsdato: string | null;
  antal_kuverter: number | null;
  pakke: Pakke | null;
  lokation: Lokation | null;
  vielsestype: Vielsestype | null;
  koordinator: Koordinator | null;
  status: BryllupStatus;
  kontakt_email: string | null;
  kontakt_tlf: string | null;
  noter: string | null;
};

export type ListParseResult = {
  wedding: WeddingUpsertPayload | null;
  metadataCardId: string | null;
  warnings: string[];
};

export function parseListAsWedding(
  list: TrelloListWithCards,
): ListParseResult {
  const warnings: string[] = [];
  const brudepar = list.name.trim();
  if (!brudepar) {
    warnings.push(`Liste ${list.id} har intet navn — skippet`);
    return { wedding: null, metadataCardId: null, warnings };
  }

  const metadataCard = list.cards.find((c) => METADATA_TITLE_RE.test(c.name));
  const meta = metadataCard ? parseMetadataLines(metadataCard.desc) : {};

  const bryllupsdato = parseDateYmd(meta.bryllupsdato);
  // Kun advar hvis metadata-kortet findes men har en ugyldig dato.
  // Manglende metadata-kort håndteres af sync med én konsolideret besked.
  if (metadataCard && !bryllupsdato) {
    warnings.push(
      `Liste "${brudepar}": metadata-kort fundet, men "Bryllupsdato" mangler eller har forkert format (skal være YYYY-MM-DD).`,
    );
  }

  const status = pickEnum(meta.status, STATUS_VALUES) ?? 'forespoergsel';

  return {
    wedding: {
      trello_list_id: list.id,
      brudepar,
      bryllupsdato,
      antal_kuverter: parseInteger(meta.antal_kuverter, 1, 500),
      pakke: pickEnum(meta.pakke, PAKKE_VALUES),
      lokation: pickEnum(meta.lokation, LOKATION_VALUES),
      vielsestype: pickEnum(meta.vielsestype, VIELSESTYPE_VALUES),
      koordinator: pickEnum(meta.koordinator, KOORDINATOR_VALUES),
      status,
      kontakt_email: meta.kontakt_email ?? null,
      kontakt_tlf: meta.kontakt_tlf ?? null,
      noter: meta.noter ?? null,
    },
    metadataCardId: metadataCard?.id ?? null,
    warnings,
  };
}

/* ------------------------------------------------------------------------- */
/* Opgaver from cards                                                         */
/* ------------------------------------------------------------------------- */

const KATEGORI_HINTS: { match: RegExp; kategori: OpgaveKategori }[] = [
  { match: /menu|mad|køkken|koekken|catering/i, kategori: 'mad' },
  { match: /sejlads|bus|transport|shuttle|anemonen/i, kategori: 'transport' },
  { match: /præst|kirke|vielse/i, kategori: 'praest' },
  { match: /band|musik|dj/i, kategori: 'musik' },
  { match: /blomst|bouquet|brudebuket/i, kategori: 'blomster' },
  { match: /betaling|depositum|slutbetaling|faktura/i, kategori: 'betaling' },
  { match: /overnatning|hus|cottage|brudesuite/i, kategori: 'overnatning' },
  { match: /walkthrough|koordin|gennemgang/i, kategori: 'koordinering' },
];

function inferKategori(title: string): OpgaveKategori {
  for (const hint of KATEGORI_HINTS) {
    if (hint.match.test(title)) return hint.kategori;
  }
  return 'andet';
}

export type OpgaveUpsertPayload = {
  trello_card_id: string;
  bryllup_id: string;
  titel: string;
  beskrivelse: string | null;
  kategori: OpgaveKategori;
  deadline: string | null;
  status: OpgaveStatus;
  raekkefoelge: number;
};

export function parseCardAsOpgave(
  card: TrelloCard,
  bryllup_id: string,
  fallbackOrder: number,
): OpgaveUpsertPayload {
  const titel = card.name.trim().slice(0, 120);
  const beskrivelse = card.desc.trim() ? card.desc.trim().slice(0, 1000) : null;
  const deadline = card.due ? card.due.slice(0, 10) : null;
  const status: OpgaveStatus = card.dueComplete ? 'done' : 'todo';
  const kategori = inferKategori(titel);
  // Trello pos er en float (16384, 32768, ...). Vi normaliserer til int.
  const raekkefoelge = Number.isFinite(card.pos)
    ? Math.round(card.pos / 1000) || fallbackOrder
    : fallbackOrder;

  return {
    trello_card_id: card.id,
    bryllup_id,
    titel,
    beskrivelse,
    kategori,
    deadline,
    status,
    raekkefoelge,
  };
}

/**
 * Filtrér kort i en liste til "opgave-kort" (alt der ikke er metadata-kortet).
 */
export function filterOpgaveCards(
  list: TrelloListWithCards,
  metadataCardId: string | null,
): TrelloCard[] {
  return list.cards.filter(
    (c) => !c.closed && c.id !== metadataCardId,
  );
}
