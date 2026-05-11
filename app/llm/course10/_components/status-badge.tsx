import type {
  BetalingStatus,
  BryllupStatus,
  OpgaveStatus,
  TilkoebStatus,
} from '../_lib/types';
import {
  BETALING_STATUS_LABELS,
  OPGAVE_STATUS_LABELS,
  STATUS_LABELS,
  TILKOEB_STATUS_LABELS,
} from '../_lib/formatting';

type Tone = 'neutral' | 'amber' | 'green' | 'muted' | 'burgundy';

const TONE_CLASSES: Record<Tone, string> = {
  neutral: 'bg-[#efe8d8] text-[#6b6358] border-[#dad3c4]',
  amber: 'bg-[#f1e3c0] text-[#7a5a1e] border-[#d9c189]',
  green: 'bg-[#3d4a3a] text-[#f0ede2] border-transparent',
  muted: 'bg-[#e9e3d4] text-[#a89b87] border-[#dad3c4]',
  burgundy: 'bg-[#e9d4cd] text-[#7a3327] border-[#c89a8e]',
};

const BRYLLUP_TONE: Record<BryllupStatus, Tone> = {
  forespoergsel: 'neutral',
  tilbud_sendt: 'amber',
  booket: 'green',
  afholdt: 'muted',
  aflyst: 'burgundy',
};

const OPGAVE_TONE: Record<OpgaveStatus, Tone> = {
  todo: 'neutral',
  in_progress: 'amber',
  done: 'green',
};

const TILKOEB_TONE: Record<TilkoebStatus, Tone> = {
  forespurgt: 'neutral',
  bekraeftet: 'amber',
  leveret: 'green',
};

const BETALING_TONE: Record<BetalingStatus, Tone> = {
  afventer: 'neutral',
  forfalden: 'burgundy',
  betalt: 'green',
};

function Badge({ tone, label }: { tone: Tone; label: string }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-medium rounded-full border ${TONE_CLASSES[tone]}`}
    >
      {label}
    </span>
  );
}

export function BryllupStatusBadge({ status }: { status: BryllupStatus }) {
  return <Badge tone={BRYLLUP_TONE[status]} label={STATUS_LABELS[status]} />;
}

export function OpgaveStatusBadge({ status }: { status: OpgaveStatus }) {
  return <Badge tone={OPGAVE_TONE[status]} label={OPGAVE_STATUS_LABELS[status]} />;
}

export function TilkoebStatusBadge({ status }: { status: TilkoebStatus }) {
  return (
    <Badge tone={TILKOEB_TONE[status]} label={TILKOEB_STATUS_LABELS[status]} />
  );
}

export function BetalingStatusBadge({ status }: { status: BetalingStatus }) {
  return (
    <Badge tone={BETALING_TONE[status]} label={BETALING_STATUS_LABELS[status]} />
  );
}
