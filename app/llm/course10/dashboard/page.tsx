import Link from 'next/link';
import { getSupabase } from '../_lib/supabase';
import type { Betaling, Bryllup } from '../_lib/types';
import SectionHeading from '../_components/section-heading';
import WeddingCard from '../_components/wedding-card';
import { formatDKK } from '../_lib/formatting';

export const dynamic = 'force-dynamic';

async function loadDashboardData() {
  const supabase = getSupabase();
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: upcoming }, { data: all }, { data: payments }] = await Promise.all([
    supabase
      .from('bryllupper')
      .select('*')
      .gte('bryllupsdato', today)
      .neq('status', 'aflyst')
      .order('bryllupsdato', { ascending: true })
      .limit(6),
    supabase.from('bryllupper').select('id, status, bryllupsdato'),
    supabase.from('betalinger').select('id, status, beloeb, forfald'),
  ]);

  return {
    upcoming: (upcoming ?? []) as Bryllup[],
    all: (all ?? []) as Pick<Bryllup, 'id' | 'status' | 'bryllupsdato'>[],
    payments: (payments ?? []) as Pick<Betaling, 'id' | 'status' | 'beloeb' | 'forfald'>[],
  };
}

export default async function DashboardPage() {
  const { upcoming, all, payments } = await loadDashboardData();

  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const thisMonthCount = all.filter((w) => {
    const d = new Date(w.bryllupsdato);
    return d >= startOfMonth && d <= endOfMonth;
  }).length;

  const tilbudSendtCount = all.filter((w) => w.status === 'tilbud_sendt').length;
  const forespoergselCount = all.filter((w) => w.status === 'forespoergsel').length;

  const todayIso = today.toISOString().slice(0, 10);
  const overduePayments = payments.filter(
    (p) =>
      p.status === 'afventer' &&
      p.forfald !== null &&
      p.forfald < todayIso,
  );
  const overdueAmount = overduePayments.reduce((sum, p) => sum + p.beloeb, 0);

  return (
    <div>
      <SectionHeading
        eyebrow="Oversigt"
        title="Velkommen tilbage"
        description="Kommende bryllupper, status på tilbud og betalinger der venter."
        action={
          <Link
            href="/llm/course10/bryllupper/nyt"
            className="inline-flex items-center px-4 py-2 bg-[#3d4a3a] text-[#f0ede2] rounded-md text-sm font-medium hover:bg-[#2e3a2c] transition-colors"
          >
            Nyt bryllup
          </Link>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-12">
        <Stat label="Denne måned" value={thisMonthCount.toString()} />
        <Stat
          label="Forespørgsler"
          value={forespoergselCount.toString()}
          tone={forespoergselCount > 0 ? 'amber' : 'neutral'}
        />
        <Stat
          label="Tilbud ude"
          value={tilbudSendtCount.toString()}
          tone={tilbudSendtCount > 0 ? 'amber' : 'neutral'}
        />
        <Stat
          label="Forfaldne betalinger"
          value={overduePayments.length === 0 ? '0' : formatDKK(overdueAmount)}
          tone={overduePayments.length > 0 ? 'burgundy' : 'neutral'}
        />
      </div>

      <div className="flex items-baseline justify-between mb-5">
        <h3 className="display text-2xl text-[#2a2723]">Kommende bryllupper</h3>
        <Link
          href="/llm/course10/bryllupper"
          className="text-sm text-[#3d4a3a] hover:underline underline-offset-4"
        >
          Se alle →
        </Link>
      </div>

      {upcoming.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {upcoming.map((bryllup) => (
            <WeddingCard key={bryllup.id} bryllup={bryllup} />
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  tone?: 'neutral' | 'amber' | 'burgundy';
}) {
  const valueColor =
    tone === 'amber'
      ? 'text-[#7a5a1e]'
      : tone === 'burgundy'
        ? 'text-[#7a3327]'
        : 'text-[#2a2723]';
  return (
    <div className="bg-[#fffdf8] border border-[#dad3c4] rounded-lg px-4 py-4">
      <p className="text-[10px] font-medium tracking-[0.18em] uppercase text-[#75695b]">
        {label}
      </p>
      <p className={`display text-2xl md:text-3xl mt-2 ${valueColor}`}>{value}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="bg-[#fffdf8] border border-dashed border-[#dad3c4] rounded-lg px-6 py-12 text-center">
      <p className="text-[#75695b] text-sm">
        Ingen kommende bryllupper. Tilføj et nyt under{' '}
        <Link href="/llm/course10/bryllupper" className="underline underline-offset-2">
          Bryllupper
        </Link>
        .
      </p>
    </div>
  );
}
