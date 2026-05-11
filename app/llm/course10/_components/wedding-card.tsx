import Link from 'next/link';
import type { Bryllup } from '../_lib/types';
import {
  KOORDINATOR_LABELS,
  LOKATION_LABELS,
  PAKKE_LABELS,
  daysUntil,
  formatDaysUntil,
  formatDate,
} from '../_lib/formatting';
import { BryllupStatusBadge } from './status-badge';

export default function WeddingCard({ bryllup }: { bryllup: Bryllup }) {
  const days = daysUntil(bryllup.bryllupsdato);
  const isPast = days != null && days < 0;
  return (
    <Link
      href={`/llm/course10/bryllupper/${bryllup.id}`}
      className="block bg-[#fffdf8] border border-[#dad3c4] rounded-lg p-5 hover:border-[#3d4a3a] hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="display text-xl text-[#2a2723] leading-tight truncate">
            {bryllup.brudepar}
          </h3>
          <p className="text-[11px] uppercase tracking-[0.15em] text-[#75695b] mt-1">
            {formatDate(bryllup.bryllupsdato)}
          </p>
        </div>
        <BryllupStatusBadge status={bryllup.status} />
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs mt-4 pt-4 border-t border-[#efe8d8]">
        <Row
          label="Pakke"
          value={bryllup.pakke ? PAKKE_LABELS[bryllup.pakke] : '—'}
        />
        <Row
          label="Lokation"
          value={bryllup.lokation ? LOKATION_LABELS[bryllup.lokation] : '—'}
        />
        <Row label="Kuverter" value={bryllup.antal_kuverter?.toString() ?? '—'} />
        <Row
          label="Koordinator"
          value={
            bryllup.koordinator ? KOORDINATOR_LABELS[bryllup.koordinator] : '—'
          }
        />
      </dl>

      {days != null && (
        <p
          className={`text-[11px] mt-4 ${
            isPast ? 'text-[#a89b87]' : 'text-[#3d4a3a] font-medium'
          }`}
        >
          {formatDaysUntil(days)}
        </p>
      )}
    </Link>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-[#75695b]">{label}</dt>
      <dd className="text-[#2a2723] text-right truncate">{value}</dd>
    </>
  );
}
