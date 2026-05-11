import type {
  BetalingStatus,
  BetalingType,
  BryllupStatus,
  Koordinator,
  Lokation,
  OpgaveKategori,
  OpgaveStatus,
  OvernatningType,
  Pakke,
  TilkoebStatus,
  TilkoebType,
  Vielsestype,
} from './types';

export function formatDKK(amount: number | null | undefined): string {
  if (amount == null) return '—';
  return new Intl.NumberFormat('da-DK', {
    style: 'currency',
    currency: 'DKK',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(
  d: string | null | undefined,
  opts?: Intl.DateTimeFormatOptions,
): string {
  if (!d) return '—';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(
    'da-DK',
    opts ?? { day: '2-digit', month: 'long', year: 'numeric' },
  ).format(date);
}

export function formatDateShort(d: string | null | undefined): string {
  return formatDate(d, { day: '2-digit', month: 'short', year: 'numeric' });
}

export function daysUntil(d: string | null | undefined): number | null {
  if (!d) return null;
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return Math.round((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatDaysUntil(days: number | null): string {
  if (days == null) return '';
  if (days === 0) return 'I dag';
  if (days === 1) return 'I morgen';
  if (days === -1) return 'I går';
  if (days > 0) return `Om ${days} dage`;
  return `${Math.abs(days)} dage siden`;
}

export const STATUS_LABELS: Record<BryllupStatus, string> = {
  forespoergsel: 'Forespørgsel',
  tilbud_sendt: 'Tilbud sendt',
  booket: 'Booket',
  afholdt: 'Afholdt',
  aflyst: 'Aflyst',
};

export const PAKKE_LABELS: Record<Pakke, string> = {
  grundpakke: 'Grundpakke',
  festpakke: 'Festpakke',
};

export const LOKATION_LABELS: Record<Lokation, string> = {
  den_gamle_lade: 'Den Gamle Lade',
  vaerkstedet: 'Værkstedet',
};

export const VIELSESTYPE_LABELS: Record<Vielsestype, string> = {
  engestofte_kirke: 'Engestofte Kirke',
  maribo_domkirke: 'Maribo Domkirke',
  park: 'Parken',
  borgerlig: 'Borgerlig vielse',
  ingen: 'Ingen vielse',
};

export const KOORDINATOR_LABELS: Record<Koordinator, string> = {
  johan: 'Johan Jensen',
  lise: 'Lise Egeskov',
};

export const KATEGORI_LABELS: Record<OpgaveKategori, string> = {
  mad: 'Mad',
  transport: 'Transport',
  musik: 'Musik',
  blomster: 'Blomster',
  praest: 'Præst',
  betaling: 'Betaling',
  koordinering: 'Koordinering',
  overnatning: 'Overnatning',
  andet: 'Andet',
};

export const OPGAVE_STATUS_LABELS: Record<OpgaveStatus, string> = {
  todo: 'Ikke startet',
  in_progress: 'I gang',
  done: 'Færdig',
};

export const TILKOEB_LABELS: Record<TilkoebType, string> = {
  bryllupskage: 'Bryllupskage',
  sejlads_anemonen: 'Sejlads med Anemonen',
  fotografering: 'Fotografering',
  brudebuket: 'Brudebuket',
  blomsterdekorationer: 'Blomsterdekorationer',
  musik: 'Musik',
  shuttlebus: 'Shuttlebus',
  fyrvaerkeri: 'Fyrværkeri',
  andet: 'Andet',
};

export const TILKOEB_STATUS_LABELS: Record<TilkoebStatus, string> = {
  forespurgt: 'Forespurgt',
  bekraeftet: 'Bekræftet',
  leveret: 'Leveret',
};

export const BETALING_TYPE_LABELS: Record<BetalingType, string> = {
  depositum: 'Depositum',
  slutbetaling: 'Slutbetaling',
  tilkoeb: 'Tilkøb',
};

export const BETALING_STATUS_LABELS: Record<BetalingStatus, string> = {
  afventer: 'Afventer',
  forfalden: 'Forfalden',
  betalt: 'Betalt',
};

export const OVERNATNING_LABELS: Record<OvernatningType, string> = {
  hospitalet: 'Hospitalet',
  hushovmesterboligen: 'Hushovmesterboligen',
  fiskerhuset: 'Fiskerhuset',
  grevindens_hus: 'Grevindens hus',
  skovloeberhuset: 'Skovløberhuset',
  glamping: 'Glamping-telte',
};

export const OVERNATNING_PROPERTIES: Record<
  OvernatningType,
  { label: string; description: string; maxGuests?: number }
> = {
  hospitalet: {
    label: 'Hospitalet',
    description: 'Luksus cottage der til daglig fungerer som brudesuite. Velegnet til et par og evt. 2 børn.',
    maxGuests: 4,
  },
  hushovmesterboligen: {
    label: 'Hushovmesterboligen',
    description: 'Idyllisk stråtækt hus direkte op til godset. Tidligere bolig for ansatte, totalrenoveret i 2017.',
  },
  fiskerhuset: {
    label: 'Fiskerhuset',
    description: 'Hus på godset til bryllupsgæster.',
  },
  grevindens_hus: {
    label: 'Grevindens hus',
    description: '6 soveværelser, plads til 11 personer. Et af Engestoftes skønneste huse.',
    maxGuests: 11,
  },
  skovloeberhuset: {
    label: 'Skovløberhuset',
    description: 'Stråtækt bindingsværk i skovbrynet med stor indhegnet have, overdækket terrasse.',
  },
  glamping: {
    label: 'Glamping-telte',
    description: 'Luksus glamping-telte på godset.',
  },
};
