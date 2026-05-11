import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSupabase } from '../../_lib/supabase';
import type {
  Betaling,
  Bryllup,
  Opgave,
  Overnatning,
  Tilkoeb,
} from '../../_lib/types';
import { BryllupStatusBadge } from '../../_components/status-badge';
import AdminDeleteWeddingButton from '../../_components/admin-delete-wedding-button';
import OpgaverSection from '../../_components/opgaver-section';
import TilkoebSection from '../../_components/tilkoeb-section';
import BetalingerSection from '../../_components/betalinger-section';
import OvernatningerSection from '../../_components/overnatninger-section';
import { isAdmin } from '../../_lib/admin-auth';
import { isUuid } from '../../_lib/validation';
import {
  KOORDINATOR_LABELS,
  LOKATION_LABELS,
  PAKKE_LABELS,
  VIELSESTYPE_LABELS,
  daysUntil,
  formatDate,
  formatDaysUntil,
} from '../../_lib/formatting';

export const dynamic = 'force-dynamic';

async function loadBryllup(id: string) {
  const supabase = getSupabase();
  const [
    { data: bryllup },
    { data: opgaver },
    { data: tilkoeb },
    { data: betalinger },
    { data: overnatninger },
  ] = await Promise.all([
    supabase.from('bryllupper').select('*').eq('id', id).maybeSingle(),
    supabase
      .from('opgaver')
      .select('*')
      .eq('bryllup_id', id)
      .order('raekkefoelge', { ascending: true }),
    supabase.from('tilkoeb').select('*').eq('bryllup_id', id),
    supabase
      .from('betalinger')
      .select('*')
      .eq('bryllup_id', id)
      .order('forfald', { ascending: true, nullsFirst: false }),
    supabase
      .from('overnatninger')
      .select('*')
      .eq('bryllup_id', id)
      .order('fra_dato', { ascending: true, nullsFirst: false }),
  ]);

  if (!bryllup) return null;
  return {
    bryllup: bryllup as Bryllup,
    opgaver: (opgaver ?? []) as Opgave[],
    tilkoeb: (tilkoeb ?? []) as Tilkoeb[],
    betalinger: (betalinger ?? []) as Betaling[],
    overnatninger: (overnatninger ?? []) as Overnatning[],
  };
}

export default async function BryllupDetaljePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const [data, admin] = await Promise.all([loadBryllup(id), isAdmin()]);
  if (!data) notFound();
  const { bryllup, opgaver, tilkoeb, betalinger, overnatninger } = data;
  const days = daysUntil(bryllup.bryllupsdato);

  return (
    <div>
      <Link
        href="/llm/course10/bryllupper"
        className="inline-flex items-center gap-1 text-sm text-[#75695b] hover:text-[#2a2723] mb-6"
      >
        ← Tilbage til alle bryllupper
      </Link>

      <header className="mb-10 pb-8 border-b border-[#dad3c4]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-medium tracking-[0.22em] uppercase text-[#75695b] mb-2">
              Bryllup
            </p>
            <h2 className="display text-4xl md:text-5xl text-[#2a2723] leading-tight">
              {bryllup.brudepar}
            </h2>
            <p className="text-[#6b6358] mt-2 text-base">
              {formatDate(bryllup.bryllupsdato)}
              {days != null ? (
                <span className="text-[#75695b]"> · {formatDaysUntil(days)}</span>
              ) : null}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <BryllupStatusBadge status={bryllup.status} />
            <Link
              href={`/llm/course10/bryllupper/${bryllup.id}/rediger`}
              className="px-3 py-1.5 text-xs border border-[#dad3c4] rounded-md hover:border-[#3d4a3a] text-[#2a2723] transition-colors"
            >
              Rediger
            </Link>
            {admin ? (
              <AdminDeleteWeddingButton
                id={bryllup.id}
                brudepar={bryllup.brudepar}
              />
            ) : null}
          </div>
        </div>
      </header>

      <Section title="Detaljer">
        <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <KeyVal label="Pakke" value={bryllup.pakke ? PAKKE_LABELS[bryllup.pakke] : '—'} />
          <KeyVal
            label="Lokation"
            value={bryllup.lokation ? LOKATION_LABELS[bryllup.lokation] : '—'}
          />
          <KeyVal
            label="Vielse"
            value={
              bryllup.vielsestype
                ? VIELSESTYPE_LABELS[bryllup.vielsestype]
                : '—'
            }
          />
          <KeyVal
            label="Antal kuverter"
            value={bryllup.antal_kuverter?.toString() ?? '—'}
          />
          <KeyVal
            label="Koordinator"
            value={
              bryllup.koordinator
                ? KOORDINATOR_LABELS[bryllup.koordinator]
                : '—'
            }
          />
          <KeyVal label="Kontakt-email" value={bryllup.kontakt_email ?? '—'} />
          <KeyVal label="Kontakt-tlf" value={bryllup.kontakt_tlf ?? '—'} />
        </dl>
        {bryllup.noter ? (
          <div className="mt-6 pt-6 border-t border-[#efe8d8]">
            <p className="text-[10px] font-medium tracking-[0.18em] uppercase text-[#75695b] mb-2">
              Noter
            </p>
            <p className="text-sm text-[#2a2723] whitespace-pre-line">
              {bryllup.noter}
            </p>
          </div>
        ) : null}
      </Section>

      <OpgaverSection
        opgaver={opgaver}
        bryllupId={bryllup.id}
        bryllupsdato={bryllup.bryllupsdato}
        admin={admin}
      />

      <TilkoebSection
        tilkoeb={tilkoeb}
        bryllupId={bryllup.id}
        admin={admin}
      />

      <BetalingerSection
        betalinger={betalinger}
        bryllupId={bryllup.id}
        admin={admin}
      />

      <OvernatningerSection
        overnatninger={overnatninger}
        bryllupId={bryllup.id}
        admin={admin}
      />
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <div className="flex items-baseline justify-between mb-4">
        <h3 className="display text-2xl text-[#2a2723]">{title}</h3>
      </div>
      <div className="bg-[#fffdf8] border border-[#dad3c4] rounded-lg px-5 py-4">
        {children}
      </div>
    </section>
  );
}

function KeyVal({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-[#efe8d8] pb-2 last:border-b-0">
      <dt className="text-[#75695b]">{label}</dt>
      <dd className="text-[#2a2723] text-right">{value}</dd>
    </div>
  );
}
