import Link from 'next/link';
import { getSupabase } from '../_lib/supabase';
import type { Bryllup } from '../_lib/types';
import SectionHeading from '../_components/section-heading';

export const dynamic = 'force-dynamic';

type SearchParams = { m?: string };

function parseMonth(raw: string | undefined): { year: number; month: number } {
  if (raw) {
    const match = raw.match(/^(\d{4})-(\d{2})$/);
    if (match) {
      const year = Number(match[1]);
      const month = Number(match[2]);
      if (year >= 2020 && year <= 2035 && month >= 1 && month <= 12) {
        return { year, month };
      }
    }
  }
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

function formatMonthParam(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

function shiftMonth(
  year: number,
  month: number,
  delta: number,
): { year: number; month: number } {
  let m = month + delta;
  let y = year;
  while (m < 1) {
    m += 12;
    y -= 1;
  }
  while (m > 12) {
    m -= 12;
    y += 1;
  }
  return { year: y, month: m };
}

const DANISH_MONTHS = [
  'januar',
  'februar',
  'marts',
  'april',
  'maj',
  'juni',
  'juli',
  'august',
  'september',
  'oktober',
  'november',
  'december',
];

const STATUS_COLORS: Record<string, string> = {
  forespoergsel: 'bg-[#efe8d8] text-[#6b6358] border-[#dad3c4]',
  tilbud_sendt: 'bg-[#f1e3c0] text-[#7a5a1e] border-[#d9c189]',
  booket: 'bg-[#3d4a3a] text-[#f0ede2] border-transparent',
  afholdt: 'bg-[#e9e3d4] text-[#a89b87] border-[#dad3c4]',
  aflyst: 'bg-[#e9d4cd] text-[#7a3327] border-[#c89a8e]',
};

async function loadMonth(year: number, month: number) {
  const supabase = getSupabase();
  const firstOfMonth = `${formatMonthParam(year, month)}-01`;
  const next = shiftMonth(year, month, 1);
  const firstOfNext = `${formatMonthParam(next.year, next.month)}-01`;
  const { data } = await supabase
    .from('bryllupper')
    .select('*')
    .gte('bryllupsdato', firstOfMonth)
    .lt('bryllupsdato', firstOfNext)
    .order('bryllupsdato', { ascending: true });
  return (data ?? []) as Bryllup[];
}

export default async function KalenderPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { year, month } = parseMonth(params.m);
  const bryllupper = await loadMonth(year, month);

  const prev = shiftMonth(year, month, -1);
  const next = shiftMonth(year, month, 1);

  const firstDay = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  // Danish week starts Monday. JS getDay: 0=Sun..6=Sat → convert to 0=Mon..6=Sun.
  const leadingBlanks = (firstDay.getDay() + 6) % 7;

  // Group weddings by day
  const byDay = new Map<number, Bryllup[]>();
  bryllupper.forEach((b) => {
    const day = new Date(b.bryllupsdato).getDate();
    const list = byDay.get(day) ?? [];
    list.push(b);
    byDay.set(day, list);
  });

  const cells: ({ day: number; weddings: Bryllup[] } | null)[] = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, weddings: byDay.get(d) ?? [] });
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const today = new Date();
  const todayMatches =
    today.getFullYear() === year && today.getMonth() + 1 === month;
  const todayDate = today.getDate();

  return (
    <div>
      <SectionHeading
        eyebrow="Oversigt"
        title={`${DANISH_MONTHS[month - 1].charAt(0).toUpperCase() + DANISH_MONTHS[month - 1].slice(1)} ${year}`}
        action={
          <div className="flex gap-2 text-sm">
            <Link
              href={`/llm/course10/kalender?m=${formatMonthParam(prev.year, prev.month)}`}
              className="px-3 py-1.5 border border-[#dad3c4] rounded-md hover:border-[#3d4a3a] text-[#2a2723]"
            >
              ← {DANISH_MONTHS[prev.month - 1]}
            </Link>
            <Link
              href="/llm/course10/kalender"
              className="px-3 py-1.5 border border-[#dad3c4] rounded-md hover:border-[#3d4a3a] text-[#2a2723]"
            >
              I dag
            </Link>
            <Link
              href={`/llm/course10/kalender?m=${formatMonthParam(next.year, next.month)}`}
              className="px-3 py-1.5 border border-[#dad3c4] rounded-md hover:border-[#3d4a3a] text-[#2a2723]"
            >
              {DANISH_MONTHS[next.month - 1]} →
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-7 gap-px bg-[#dad3c4] border border-[#dad3c4] rounded-lg overflow-hidden text-xs">
        {['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'Lør', 'Søn'].map((d) => (
          <div
            key={d}
            className="bg-[#efe8d8]/70 px-2 py-2 font-medium tracking-wider text-[#75695b] text-[11px] uppercase"
          >
            {d}
          </div>
        ))}
        {cells.map((cell, i) => (
          <div
            key={i}
            className="bg-[#fffdf8] min-h-24 md:min-h-28 px-2 py-1.5 flex flex-col gap-1"
          >
            {cell ? (
              <>
                <span
                  className={`text-[11px] font-medium ${
                    todayMatches && cell.day === todayDate
                      ? 'text-[#3d4a3a]'
                      : 'text-[#75695b]'
                  }`}
                >
                  {cell.day}
                </span>
                {cell.weddings.map((w) => (
                  <Link
                    key={w.id}
                    href={`/llm/course10/bryllupper/${w.id}`}
                    className={`block text-[10px] md:text-[11px] truncate px-1.5 py-0.5 rounded border ${STATUS_COLORS[w.status] ?? STATUS_COLORS['forespoergsel']}`}
                    title={w.brudepar}
                  >
                    {w.brudepar}
                  </Link>
                ))}
              </>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
