/**
 * Demo seed-data. Speglet af _migrations/002_seed.sql.
 *
 * Bruges af admin-handlingen "Reset til seed" så koordinatorerne kan stille
 * demo'en tilbage til udgangspunktet uden at gå i Supabase SQL Editor.
 *
 * Hvis du ændrer her, opdater også 002_seed.sql så førstegangs-opsætning matcher.
 */

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

export type SeedBryllup = {
  slug: string;
  brudepar: string;
  bryllupsdato: string;
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

export type SeedOpgave = {
  bryllup_slug: string;
  titel: string;
  kategori: OpgaveKategori | null;
  deadline: string | null;
  status: OpgaveStatus;
  ansvarlig: string | null;
  raekkefoelge: number;
};

export type SeedTilkoeb = {
  bryllup_slug: string;
  type: TilkoebType;
  beskrivelse: string | null;
  pris: number | null;
  status: TilkoebStatus;
};

export type SeedBetaling = {
  bryllup_slug: string;
  type: BetalingType | null;
  beloeb: number;
  forfald: string | null;
  betalt_dato: string | null;
  status: BetalingStatus;
};

export type SeedOvernatning = {
  bryllup_slug: string;
  type: OvernatningType | null;
  antal_personer: number | null;
  fra_dato: string | null;
  til_dato: string | null;
  pris: number | null;
};

export const SEED_BRYLLUPPER: SeedBryllup[] = [
  {
    slug: 'sm',
    brudepar: 'Sofie & Mikkel',
    bryllupsdato: '2026-04-25',
    antal_kuverter: 120,
    pakke: 'grundpakke',
    lokation: 'den_gamle_lade',
    vielsestype: 'engestofte_kirke',
    koordinator: 'lise',
    status: 'afholdt',
    kontakt_email: 'sofie@example.dk',
    kontakt_tlf: '+45 28 11 22 33',
    noter: 'Stort selskab, alt forløb planmæssigt.',
  },
  {
    slug: 'al',
    brudepar: 'Anna & Lars',
    bryllupsdato: '2026-06-14',
    antal_kuverter: 85,
    pakke: 'festpakke',
    lokation: 'vaerkstedet',
    vielsestype: 'maribo_domkirke',
    koordinator: 'johan',
    status: 'booket',
    kontakt_email: 'anna.lars@example.dk',
    kontakt_tlf: '+45 24 55 66 77',
    noter: 'Sejlads med Anemonen tilkøbt. Mindre intim fest.',
  },
  {
    slug: 'mc',
    brudepar: 'Mette & Christian',
    bryllupsdato: '2026-07-19',
    antal_kuverter: 140,
    pakke: 'grundpakke',
    lokation: 'den_gamle_lade',
    vielsestype: 'engestofte_kirke',
    koordinator: 'lise',
    status: 'booket',
    kontakt_email: 'mette.c@example.dk',
    kontakt_tlf: '+45 29 88 99 00',
    noter: 'Højsæson. Live-band, fyrværkeri kl. 23.',
  },
  {
    slug: 'cf',
    brudepar: 'Camilla & Frederik',
    bryllupsdato: '2026-08-23',
    antal_kuverter: 180,
    pakke: 'grundpakke',
    lokation: 'den_gamle_lade',
    vielsestype: 'park',
    koordinator: 'johan',
    status: 'booket',
    kontakt_email: 'camilla.f@example.dk',
    kontakt_tlf: '+45 22 11 44 55',
    noter: 'Vielse i parken, ceremoni kl. 14.',
  },
  {
    slug: 'ej',
    brudepar: 'Emma & Jonas',
    bryllupsdato: '2026-09-12',
    antal_kuverter: 60,
    pakke: 'festpakke',
    lokation: 'vaerkstedet',
    vielsestype: 'borgerlig',
    koordinator: 'lise',
    status: 'tilbud_sendt',
    kontakt_email: 'emma.j@example.dk',
    kontakt_tlf: '+45 26 77 88 99',
    noter: 'Tilbud sendt 03/05. Afventer svar.',
  },
  {
    slug: 'ja',
    brudepar: 'Julie & Andreas',
    bryllupsdato: '2027-05-30',
    antal_kuverter: 100,
    pakke: null,
    lokation: null,
    vielsestype: null,
    koordinator: 'johan',
    status: 'forespoergsel',
    kontakt_email: 'julie.a@example.dk',
    kontakt_tlf: '+45 21 33 22 11',
    noter: 'Første henvendelse. Mangler afklaring på pakke og lokation.',
  },
  {
    slug: 'km',
    brudepar: 'Karoline & Magnus',
    bryllupsdato: '2026-06-28',
    antal_kuverter: 70,
    pakke: 'festpakke',
    lokation: 'vaerkstedet',
    vielsestype: 'borgerlig',
    koordinator: 'johan',
    status: 'aflyst',
    kontakt_email: 'karo.mag@example.dk',
    kontakt_tlf: '+45 25 11 33 44',
    noter: 'Aflyst pga sygdom. Forventer at flytte til 2027 — depositum overført.',
  },
  {
    slug: 'lo',
    brudepar: 'Liva & Oskar',
    bryllupsdato: '2025-10-04',
    antal_kuverter: 110,
    pakke: 'grundpakke',
    lokation: 'den_gamle_lade',
    vielsestype: 'engestofte_kirke',
    koordinator: 'lise',
    status: 'afholdt',
    kontakt_email: 'liva.oskar@example.dk',
    kontakt_tlf: '+45 23 44 55 66',
    noter: 'Efterårsbryllup. Stor succes, alle var begejstrede for menuen.',
  },
  {
    slug: 'ib',
    brudepar: 'Ida & Benjamin',
    bryllupsdato: '2026-02-14',
    antal_kuverter: 50,
    pakke: 'festpakke',
    lokation: 'vaerkstedet',
    vielsestype: 'ingen',
    koordinator: 'lise',
    status: 'booket',
    kontakt_email: 'ida.ben@example.dk',
    kontakt_tlf: '+45 28 99 11 22',
    noter: 'Valentinsbryllup. Intimt selskab uden vielse — parret blev gift før.',
  },
  {
    slug: 'nt',
    brudepar: 'Nynne & Theis',
    bryllupsdato: '2026-10-11',
    antal_kuverter: 130,
    pakke: 'grundpakke',
    lokation: 'den_gamle_lade',
    vielsestype: 'engestofte_kirke',
    koordinator: 'johan',
    status: 'booket',
    kontakt_email: 'nynne.theis@example.dk',
    kontakt_tlf: '+45 27 66 88 99',
    noter: 'Efterårsbryllup med fokus på lokale råvarer og høstmenu.',
  },
];

export const SEED_OPGAVER: SeedOpgave[] = [
  // Sofie & Mikkel — afholdt, alt færdigt
  { bryllup_slug: 'sm', titel: 'Kontakt præst i E.G. Kirke',  kategori: 'praest',       deadline: '2026-02-25', status: 'done', ansvarlig: 'Lise', raekkefoelge: 1 },
  { bryllup_slug: 'sm', titel: 'Bekræft menu med køkken',           kategori: 'mad',          deadline: '2026-03-25', status: 'done', ansvarlig: 'Lise', raekkefoelge: 2 },
  { bryllup_slug: 'sm', titel: 'Bestil bryllupskage',               kategori: 'andet',        deadline: '2026-04-04', status: 'done', ansvarlig: 'Lise', raekkefoelge: 3 },
  { bryllup_slug: 'sm', titel: 'Slutbetaling',                      kategori: 'betaling',     deadline: '2026-04-11', status: 'done', ansvarlig: 'Lise', raekkefoelge: 4 },
  { bryllup_slug: 'sm', titel: 'Endelig walkthrough med brudepar',  kategori: 'koordinering', deadline: '2026-04-18', status: 'done', ansvarlig: 'Lise', raekkefoelge: 5 },

  // Anna & Lars
  { bryllup_slug: 'al', titel: 'Kontakt præst i Maribo Domkirke', kategori: 'praest',     deadline: '2026-04-19', status: 'done',        ansvarlig: 'Johan', raekkefoelge: 1 },
  { bryllup_slug: 'al', titel: 'Bekræft sejlads med Anemonen',    kategori: 'transport',  deadline: '2026-05-17', status: 'done',        ansvarlig: 'Johan', raekkefoelge: 2 },
  { bryllup_slug: 'al', titel: 'Bekræft menu med køkken',         kategori: 'mad',        deadline: '2026-05-17', status: 'in_progress', ansvarlig: 'Johan', raekkefoelge: 3 },
  { bryllup_slug: 'al', titel: 'Bestil bryllupskage',             kategori: 'andet',      deadline: '2026-05-24', status: 'todo',        ansvarlig: 'Johan', raekkefoelge: 4 },
  { bryllup_slug: 'al', titel: 'Slutbetaling',                    kategori: 'betaling',   deadline: '2026-05-31', status: 'todo',        ansvarlig: 'Johan', raekkefoelge: 5 },

  // Mette & Christian
  { bryllup_slug: 'mc', titel: 'Kontakt præst i E.G. Kirke', kategori: 'praest',    deadline: '2026-05-24', status: 'done',        ansvarlig: 'Lise', raekkefoelge: 1 },
  { bryllup_slug: 'mc', titel: 'Bekræft live-band',                kategori: 'musik',     deadline: '2026-06-21', status: 'in_progress', ansvarlig: 'Lise', raekkefoelge: 2 },
  { bryllup_slug: 'mc', titel: 'Bekræft fyrværkeri (kl. 23)',      kategori: 'andet',     deadline: '2026-07-05', status: 'todo',        ansvarlig: 'Lise', raekkefoelge: 3 },
  { bryllup_slug: 'mc', titel: 'Bestil blomsterdekorationer',      kategori: 'blomster',  deadline: '2026-06-28', status: 'todo',        ansvarlig: 'Lise', raekkefoelge: 4 },
  { bryllup_slug: 'mc', titel: 'Slutbetaling',                     kategori: 'betaling',  deadline: '2026-07-05', status: 'todo',        ansvarlig: 'Lise', raekkefoelge: 5 },

  // Camilla & Frederik
  { bryllup_slug: 'cf', titel: 'Koordinér ceremoni i parken kl. 14', kategori: 'koordinering', deadline: '2026-07-26', status: 'in_progress', ansvarlig: 'Johan', raekkefoelge: 1 },
  { bryllup_slug: 'cf', titel: 'Bekræft menu (180 personer)',        kategori: 'mad',          deadline: '2026-07-19', status: 'todo',        ansvarlig: 'Johan', raekkefoelge: 2 },
  { bryllup_slug: 'cf', titel: 'Bestil shuttlebus fra Maribo',       kategori: 'transport',    deadline: '2026-08-02', status: 'todo',        ansvarlig: 'Johan', raekkefoelge: 3 },
  { bryllup_slug: 'cf', titel: 'Slutbetaling',                       kategori: 'betaling',     deadline: '2026-08-09', status: 'todo',        ansvarlig: 'Johan', raekkefoelge: 4 },

  // Emma & Jonas — tilbud_sendt
  { bryllup_slug: 'ej', titel: 'Følg op på tilbud',              kategori: 'koordinering', deadline: '2026-05-20', status: 'todo', ansvarlig: 'Lise', raekkefoelge: 1 },
  { bryllup_slug: 'ej', titel: 'Afklar tilkøb (kage, blomster)', kategori: 'koordinering', deadline: '2026-06-01', status: 'todo', ansvarlig: 'Lise', raekkefoelge: 2 },

  // Julie & Andreas — forespoergsel
  { bryllup_slug: 'ja', titel: 'Send pakke-info og prisliste',   kategori: 'koordinering', deadline: '2026-05-18', status: 'todo', ansvarlig: 'Johan', raekkefoelge: 1 },
  { bryllup_slug: 'ja', titel: 'Foreslå datoer for besigtigelse', kategori: 'koordinering', deadline: '2026-05-25', status: 'todo', ansvarlig: 'Johan', raekkefoelge: 2 },

  // Karoline & Magnus — aflyst, kun afslutningsopgaver
  { bryllup_slug: 'km', titel: 'Afklar depositum-håndtering med brudepar', kategori: 'koordinering', deadline: '2026-07-10', status: 'todo',        ansvarlig: 'Johan', raekkefoelge: 1 },
  { bryllup_slug: 'km', titel: 'Sæt ressourcer fri i kalenderen',          kategori: 'koordinering', deadline: '2026-06-29', status: 'done',        ansvarlig: 'Johan', raekkefoelge: 2 },

  // Liva & Oskar — afholdt 2025, alt færdigt
  { bryllup_slug: 'lo', titel: 'Kontakt præst i E.G. Kirke',  kategori: 'praest',       deadline: '2025-08-04', status: 'done', ansvarlig: 'Lise', raekkefoelge: 1 },
  { bryllup_slug: 'lo', titel: 'Bekræft efterårsmenu med køkken',    kategori: 'mad',          deadline: '2025-08-09', status: 'done', ansvarlig: 'Lise', raekkefoelge: 2 },
  { bryllup_slug: 'lo', titel: 'Bestil bryllupskage',                kategori: 'andet',        deadline: '2025-09-04', status: 'done', ansvarlig: 'Lise', raekkefoelge: 3 },
  { bryllup_slug: 'lo', titel: 'Slutbetaling',                       kategori: 'betaling',     deadline: '2025-09-20', status: 'done', ansvarlig: 'Lise', raekkefoelge: 4 },
  { bryllup_slug: 'lo', titel: 'Endelig walkthrough',                kategori: 'koordinering', deadline: '2025-09-27', status: 'done', ansvarlig: 'Lise', raekkefoelge: 5 },

  // Ida & Benjamin — booket, intimt valentinsbryllup
  { bryllup_slug: 'ib', titel: 'Bekræft menu (50 personer)',     kategori: 'mad',          deadline: '2026-01-17', status: 'in_progress', ansvarlig: 'Lise', raekkefoelge: 1 },
  { bryllup_slug: 'ib', titel: 'Bestil rosenblade til borde',    kategori: 'blomster',     deadline: '2026-02-07', status: 'todo',        ansvarlig: 'Lise', raekkefoelge: 2 },
  { bryllup_slug: 'ib', titel: 'Slutbetaling',                   kategori: 'betaling',     deadline: '2026-01-31', status: 'todo',        ansvarlig: 'Lise', raekkefoelge: 3 },
  { bryllup_slug: 'ib', titel: 'Walkthrough med Ida og Benjamin',kategori: 'koordinering', deadline: '2026-02-07', status: 'todo',        ansvarlig: 'Lise', raekkefoelge: 4 },

  // Nynne & Theis — booket, efterår
  { bryllup_slug: 'nt', titel: 'Kontakt præst i E.G. Kirke',  kategori: 'praest',    deadline: '2026-07-19', status: 'done',        ansvarlig: 'Johan', raekkefoelge: 1 },
  { bryllup_slug: 'nt', titel: 'Aftale efterårsmenu med køkken',    kategori: 'mad',       deadline: '2026-08-16', status: 'in_progress', ansvarlig: 'Johan', raekkefoelge: 2 },
  { bryllup_slug: 'nt', titel: 'Bestil bryllupskage',               kategori: 'andet',     deadline: '2026-09-13', status: 'todo',        ansvarlig: 'Johan', raekkefoelge: 3 },
  { bryllup_slug: 'nt', titel: 'Slutbetaling',                      kategori: 'betaling',  deadline: '2026-09-27', status: 'todo',        ansvarlig: 'Johan', raekkefoelge: 4 },
];

export const SEED_TILKOEB: SeedTilkoeb[] = [
  { bryllup_slug: 'sm', type: 'bryllupskage',  beskrivelse: 'Klassisk hindbær-vanilje, 120 personer', pris: 13320, status: 'leveret' },
  { bryllup_slug: 'sm', type: 'fotografering', beskrivelse: 'Hele dagen, 8 timer',                    pris: 18000, status: 'leveret' },

  { bryllup_slug: 'al', type: 'sejlads_anemonen', beskrivelse: 'Fra Maribo Domkirke til godset', pris: 8500, status: 'bekraeftet' },
  { bryllup_slug: 'al', type: 'bryllupskage',     beskrivelse: 'Citron-mazarin, 85 personer',    pris: 9435, status: 'forespurgt' },

  { bryllup_slug: 'mc', type: 'musik',                beskrivelse: 'Live-band 4 timer',        pris: 22000, status: 'bekraeftet' },
  { bryllup_slug: 'mc', type: 'fyrvaerkeri',          beskrivelse: 'Stort show, kl. 23',       pris: 15000, status: 'forespurgt' },
  { bryllup_slug: 'mc', type: 'blomsterdekorationer', beskrivelse: 'Bordpynt + brudebuket',    pris: 8400,  status: 'forespurgt' },

  { bryllup_slug: 'cf', type: 'shuttlebus',     beskrivelse: 'Shuttle fra Maribo, 2 afgange', pris: 6500,  status: 'forespurgt' },
  { bryllup_slug: 'cf', type: 'fotografering',  beskrivelse: 'Hele dagen + dronebilleder',    pris: 22000, status: 'bekraeftet' },

  { bryllup_slug: 'lo', type: 'bryllupskage',         beskrivelse: 'Karamel-æble, 110 personer',  pris: 12100, status: 'leveret' },
  { bryllup_slug: 'lo', type: 'fotografering',        beskrivelse: 'Hele dagen, 10 timer',         pris: 18000, status: 'leveret' },
  { bryllup_slug: 'lo', type: 'blomsterdekorationer', beskrivelse: 'Efterårsfarver, bordpynt',     pris: 7700,  status: 'leveret' },

  { bryllup_slug: 'ib', type: 'brudebuket',    beskrivelse: 'Røde roser', pris: 2200, status: 'bekraeftet' },
  { bryllup_slug: 'ib', type: 'fotografering', beskrivelse: 'Halv dag',   pris: 9500, status: 'forespurgt' },

  { bryllup_slug: 'nt', type: 'bryllupskage',  beskrivelse: 'Æbletærte-inspireret, 130 personer', pris: 14300, status: 'forespurgt' },
  { bryllup_slug: 'nt', type: 'fotografering', beskrivelse: 'Hele dagen + dronebilleder',         pris: 22000, status: 'bekraeftet' },
];

export const SEED_BETALINGER: SeedBetaling[] = [
  { bryllup_slug: 'sm', type: 'depositum',    beloeb: 42850,  forfald: '2026-02-14', betalt_dato: '2026-02-12', status: 'betalt' },
  { bryllup_slug: 'sm', type: 'slutbetaling', beloeb: 128550, forfald: '2026-04-11', betalt_dato: '2026-04-10', status: 'betalt' },

  { bryllup_slug: 'al', type: 'depositum',    beloeb: 20500, forfald: '2026-02-28', betalt_dato: '2026-02-26', status: 'betalt' },
  { bryllup_slug: 'al', type: 'slutbetaling', beloeb: 61625, forfald: '2026-05-31', betalt_dato: null,         status: 'afventer' },

  { bryllup_slug: 'mc', type: 'depositum',    beloeb: 49625,  forfald: '2026-03-19', betalt_dato: '2026-03-18', status: 'betalt' },
  { bryllup_slug: 'mc', type: 'slutbetaling', beloeb: 148875, forfald: '2026-07-05', betalt_dato: null,         status: 'afventer' },

  { bryllup_slug: 'cf', type: 'depositum',    beloeb: 62875,  forfald: '2026-04-09', betalt_dato: '2026-04-08', status: 'betalt' },
  { bryllup_slug: 'cf', type: 'slutbetaling', beloeb: 188625, forfald: '2026-08-09', betalt_dato: null,         status: 'afventer' },

  { bryllup_slug: 'km', type: 'depositum', beloeb: 17500, forfald: '2026-03-14', betalt_dato: '2026-03-12', status: 'betalt' },

  { bryllup_slug: 'lo', type: 'depositum',    beloeb: 39312,  forfald: '2025-07-21', betalt_dato: '2025-07-20', status: 'betalt' },
  { bryllup_slug: 'lo', type: 'slutbetaling', beloeb: 117938, forfald: '2025-09-20', betalt_dato: '2025-09-19', status: 'betalt' },

  { bryllup_slug: 'ib', type: 'depositum',    beloeb: 12000, forfald: '2025-12-29', betalt_dato: '2025-12-27', status: 'betalt' },
  { bryllup_slug: 'ib', type: 'slutbetaling', beloeb: 36000, forfald: '2026-01-31', betalt_dato: null,         status: 'afventer' },

  { bryllup_slug: 'nt', type: 'depositum',    beloeb: 46063,  forfald: '2026-06-12', betalt_dato: '2026-06-10', status: 'betalt' },
  { bryllup_slug: 'nt', type: 'slutbetaling', beloeb: 138187, forfald: '2026-09-27', betalt_dato: null,         status: 'afventer' },
];

export const SEED_OVERNATNINGER: SeedOvernatning[] = [
  { bryllup_slug: 'sm', type: 'hospitalet', antal_personer: 2, fra_dato: '2026-04-25', til_dato: '2026-04-26', pris: 0 },

  { bryllup_slug: 'al', type: 'hospitalet', antal_personer: 2, fra_dato: '2026-06-14', til_dato: '2026-06-15', pris: 0 },
  { bryllup_slug: 'al', type: 'glamping',   antal_personer: 8, fra_dato: '2026-06-14', til_dato: '2026-06-15', pris: 4800 },

  { bryllup_slug: 'mc', type: 'hospitalet', antal_personer: 2, fra_dato: '2026-07-19', til_dato: '2026-07-20', pris: 0 },
  { bryllup_slug: 'mc', type: 'grevindens_hus',  antal_personer: 6, fra_dato: '2026-07-19', til_dato: '2026-07-21', pris: 4400 },

  { bryllup_slug: 'cf', type: 'hospitalet', antal_personer: 2, fra_dato: '2026-08-23', til_dato: '2026-08-24', pris: 0 },

  { bryllup_slug: 'lo', type: 'hospitalet',      antal_personer: 2, fra_dato: '2025-10-04', til_dato: '2025-10-05', pris: 0 },
  { bryllup_slug: 'ib', type: 'hospitalet',      antal_personer: 2, fra_dato: '2026-02-14', til_dato: '2026-02-15', pris: 0 },
  { bryllup_slug: 'nt', type: 'hospitalet',      antal_personer: 2, fra_dato: '2026-10-11', til_dato: '2026-10-12', pris: 0 },
  { bryllup_slug: 'nt', type: 'skovloeberhuset', antal_personer: 4, fra_dato: '2026-10-11', til_dato: '2026-10-12', pris: 3500 },
];
