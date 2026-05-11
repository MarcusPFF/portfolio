import Link from 'next/link';
import { getSupabase } from '../_lib/supabase';
import type { Bryllup, BryllupStatus, Koordinator } from '../_lib/types';
import SectionHeading from '../_components/section-heading';
import { BryllupStatusBadge } from '../_components/status-badge';
import {
  KOORDINATOR_LABELS,
  PAKKE_LABELS,
  STATUS_LABELS,
  formatDateShort,
} from '../_lib/formatting';

export const dynamic = 'force-dynamic';

type SearchParams = {
  status?: string;
  koordinator?: string;
};

const ALL_STATUSES: BryllupStatus[] = [
  'forespoergsel',
  'tilbud_sendt',
  'booket',
  'afholdt',
  'aflyst',
];

const ALL_KOORDINATORS: Koordinator[] = ['johan', 'lise'];

function parseStatus(raw: string | undefined): BryllupStatus | null {
  return ALL_STATUSES.find((s) => s === raw) ?? null;
}

function parseKoordinator(raw: string | undefined): Koordinator | null {
  return ALL_KOORDINATORS.find((k) => k === raw) ?? null;
}

async function loadBryllupper(filters: {
  status: BryllupStatus | null;
  koordinator: Koordinator | null;
}) {
  const supabase = getSupabase();
  let query = supabase
    .from('bryllupper')
    .select('*')
    .order('bryllupsdato', { ascending: true });

  if (filters.status) query = query.eq('status', filters.status);
  if (filters.koordinator) query = query.eq('koordinator', filters.koordinator);

  const { data } = await query;
  return (data ?? []) as Bryllup[];
}

export default async function BryllupperListePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const status = parseStatus(params.status);
  const koordinator = parseKoordinator(params.koordinator);
  const bryllupper = await loadBryllupper({ status, koordinator });

  return (
    <div>
      <SectionHeading
        eyebrow="Alle bryllupper"
        title="Bryllupper"
        description="Sorteret efter dato. Brug filtrene til at indsnævre listen."
        action={
          <Link
            href="/llm/course10/bryllupper/nyt"
            className="inline-flex items-center px-4 py-2 bg-[#3d4a3a] text-[#f0ede2] rounded-md text-sm font-medium hover:bg-[#2e3a2c] transition-colors"
          >
            Nyt bryllup
          </Link>
        }
      />

      <FilterBar activeStatus={status} activeKoordinator={koordinator} />

      <div className="bg-[#fffdf8] border border-[#dad3c4] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#efe8d8]/60 text-[11px] uppercase tracking-[0.12em] text-[#75695b]">
            <tr>
              <Th>Brudepar</Th>
              <Th>Dato</Th>
              <Th>Status</Th>
              <Th>Koordinator</Th>
              <Th>Pakke</Th>
              <Th className="text-right">Kuverter</Th>
            </tr>
          </thead>
          <tbody>
            {bryllupper.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-[#75695b]"
                >
                  Ingen bryllupper matchede filteret.
                </td>
              </tr>
            ) : (
              bryllupper.map((b) => (
                <tr
                  key={b.id}
                  className="border-t border-[#efe8d8] hover:bg-[#efe8d8]/40 transition-colors"
                >
                  <Td>
                    <Link
                      href={`/llm/course10/bryllupper/${b.id}`}
                      className="display text-base text-[#2a2723] hover:text-[#3d4a3a]"
                    >
                      {b.brudepar}
                    </Link>
                  </Td>
                  <Td className="text-[#2a2723]">
                    {formatDateShort(b.bryllupsdato)}
                  </Td>
                  <Td>
                    <BryllupStatusBadge status={b.status} />
                  </Td>
                  <Td className="text-[#2a2723]">
                    {b.koordinator ? KOORDINATOR_LABELS[b.koordinator] : '—'}
                  </Td>
                  <Td className="text-[#2a2723]">
                    {b.pakke ? PAKKE_LABELS[b.pakke] : '—'}
                  </Td>
                  <Td className="text-right text-[#2a2723]">
                    {b.antal_kuverter ?? '—'}
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-[#75695b] mt-3">
        {bryllupper.length} bryllup{bryllupper.length === 1 ? '' : 'per'} vist.
      </p>
    </div>
  );
}

function Th({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={`px-4 py-3 text-left font-medium ${className}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}

function FilterBar({
  activeStatus,
  activeKoordinator,
}: {
  activeStatus: BryllupStatus | null;
  activeKoordinator: Koordinator | null;
}) {
  const hasFilters = activeStatus !== null || activeKoordinator !== null;
  return (
    <div className="flex flex-wrap items-center gap-2 mb-5 text-xs">
      <span className="text-[#75695b] mr-1">Status:</span>
      <FilterPill
        href="/llm/course10/bryllupper"
        label="Alle"
        active={activeStatus === null}
        carry={{ koordinator: activeKoordinator ?? undefined }}
      />
      {ALL_STATUSES.map((s) => (
        <FilterPill
          key={s}
          href="/llm/course10/bryllupper"
          label={STATUS_LABELS[s]}
          active={activeStatus === s}
          carry={{
            status: s,
            koordinator: activeKoordinator ?? undefined,
          }}
        />
      ))}
      <span className="text-[#75695b] ml-3 mr-1">Koordinator:</span>
      <FilterPill
        href="/llm/course10/bryllupper"
        label="Alle"
        active={activeKoordinator === null}
        carry={{ status: activeStatus ?? undefined }}
      />
      {ALL_KOORDINATORS.map((k) => (
        <FilterPill
          key={k}
          href="/llm/course10/bryllupper"
          label={KOORDINATOR_LABELS[k]}
          active={activeKoordinator === k}
          carry={{
            koordinator: k,
            status: activeStatus ?? undefined,
          }}
        />
      ))}
      {hasFilters ? (
        <Link
          href="/llm/course10/bryllupper"
          className="ml-3 text-[#75695b] hover:text-[#2a2723] underline underline-offset-2"
        >
          Ryd filtre
        </Link>
      ) : null}
    </div>
  );
}

function FilterPill({
  href,
  label,
  active,
  carry,
}: {
  href: string;
  label: string;
  active: boolean;
  carry: { status?: string; koordinator?: string };
}) {
  const sp = new URLSearchParams();
  if (carry.status) sp.set('status', carry.status);
  if (carry.koordinator) sp.set('koordinator', carry.koordinator);
  const qs = sp.toString();
  const fullHref = qs ? `${href}?${qs}` : href;
  return (
    <Link
      href={fullHref}
      className={`px-3 py-1 rounded-full border transition-colors ${
        active
          ? 'bg-[#3d4a3a] text-[#f7f3ec] border-transparent'
          : 'bg-transparent text-[#2a2723] border-[#dad3c4] hover:border-[#3d4a3a]'
      }`}
    >
      {label}
    </Link>
  );
}
