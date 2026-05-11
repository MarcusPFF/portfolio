export type Koordinator = 'johan' | 'lise';
export type BryllupStatus =
  | 'forespoergsel'
  | 'tilbud_sendt'
  | 'booket'
  | 'afholdt'
  | 'aflyst';
export type Pakke = 'grundpakke' | 'festpakke';
export type Lokation = 'den_gamle_lade' | 'vaerkstedet';
export type Vielsestype =
  | 'engestofte_kirke'
  | 'maribo_domkirke'
  | 'park'
  | 'borgerlig'
  | 'ingen';

export type OpgaveKategori =
  | 'mad'
  | 'transport'
  | 'musik'
  | 'blomster'
  | 'praest'
  | 'betaling'
  | 'koordinering'
  | 'overnatning'
  | 'andet';
export type OpgaveStatus = 'todo' | 'in_progress' | 'done';

export type TilkoebType =
  | 'bryllupskage'
  | 'sejlads_anemonen'
  | 'fotografering'
  | 'brudebuket'
  | 'blomsterdekorationer'
  | 'musik'
  | 'shuttlebus'
  | 'fyrvaerkeri'
  | 'andet';
export type TilkoebStatus = 'forespurgt' | 'bekraeftet' | 'leveret';

export type BetalingType = 'depositum' | 'slutbetaling' | 'tilkoeb';
export type BetalingStatus = 'afventer' | 'forfalden' | 'betalt';

export type OvernatningType =
  | 'hospitalet'
  | 'hushovmesterboligen'
  | 'fiskerhuset'
  | 'grevindens_hus'
  | 'skovloeberhuset'
  | 'glamping';

export type Bryllup = {
  id: string;
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
  trello_list_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Opgave = {
  id: string;
  bryllup_id: string;
  titel: string;
  beskrivelse: string | null;
  kategori: OpgaveKategori | null;
  deadline: string | null;
  status: OpgaveStatus;
  ansvarlig: string | null;
  raekkefoelge: number;
  ai_genereret: boolean;
  trello_card_id: string | null;
  created_at: string;
};

export type SyncDirection = 'download' | 'upload';

export type SyncLogEntry = {
  id: string;
  started_at: string;
  finished_at: string | null;
  success: boolean | null;
  direction: SyncDirection;
  weddings_created: number;
  weddings_updated: number;
  tasks_created: number;
  tasks_updated: number;
  duration_ms: number | null;
  error_message: string | null;
};

export type Tilkoeb = {
  id: string;
  bryllup_id: string;
  type: TilkoebType;
  beskrivelse: string | null;
  pris: number | null;
  status: TilkoebStatus;
};

export type Betaling = {
  id: string;
  bryllup_id: string;
  type: BetalingType | null;
  beloeb: number;
  forfald: string | null;
  betalt_dato: string | null;
  status: BetalingStatus;
};

export type Overnatning = {
  id: string;
  bryllup_id: string;
  type: OvernatningType | null;
  antal_personer: number | null;
  fra_dato: string | null;
  til_dato: string | null;
  pris: number | null;
};
