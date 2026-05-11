import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isAdmin } from '../../_lib/admin-auth';
import { getSupabase } from '../../_lib/supabase';
import type { AuditActor, AuditEvent } from '../../_lib/audit';
import SectionHeading from '../../_components/section-heading';

export const dynamic = 'force-dynamic';

type AuditRow = {
  id: string;
  created_at: string;
  event: AuditEvent;
  actor: AuditActor;
  ip: string | null;
  bryllup_id: string | null;
  details: Record<string, unknown> | null;
};

type SearchParams = { event?: string };

const FILTERS: { value: string; label: string }[] = [
  { value: '', label: 'Alle' },
  { value: 'admin.', label: 'Admin' },
  { value: 'wedding.', label: 'Bryllup' },
  { value: 'ai.', label: 'AI' },
  { value: 'ai.generate_failed', label: 'AI-fejl' },
  { value: 'admin.sync_', label: 'Trello-sync' },
];

const EVENT_LABELS: Record<AuditEvent, string> = {
  'admin.login_success': 'Login OK',
  'admin.login_failure': 'Login fejlede',
  'admin.logout': 'Log ud',
  'admin.reset_to_seed': 'Reset til seed',
  'admin.delete_wedding': 'Slet bryllup',
  'admin.delete_opgave': 'Slet opgave',
  'admin.delete_tilkoeb': 'Slet tilkøb',
  'admin.delete_betaling': 'Slet betaling',
  'admin.delete_overnatning': 'Slet overnatning',
  'admin.sync_download': 'Hent fra Trello',
  'admin.sync_upload': 'Upload til Trello',
  'admin.sync_failed': 'Sync fejlede',
  'admin.reset_trello_board': 'Reset Trello board',
  'admin.delete_all_weddings': 'Slet alle bryllupper',
  'wedding.create': 'Nyt bryllup',
  'wedding.update': 'Opdater bryllup',
  'ai.generate_tasks': 'AI: opgaver',
  'ai.generate_tilkoeb': 'AI: tilkøb',
  'ai.approve_tasks': 'Godkend AI-opgaver',
  'ai.approve_tilkoeb': 'Godkend AI-tilkøb',
  'ai.generate_failed': 'AI fejlede',
};

const ACTOR_LABELS: Record<AuditActor, string> = {
  admin: 'Admin',
  public: 'Besøgende',
  anon: 'Ikke logget ind',
  system: 'System',
};

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('da-DK', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(d);
}

function detailsSummary(details: Record<string, unknown> | null): string {
  if (!details) return '';
  const entries = Object.entries(details);
  if (entries.length === 0) return '';
  return entries
    .map(([k, v]) => {
      if (v === null || v === undefined) return `${k}=—`;
      if (typeof v === 'object') return `${k}=${JSON.stringify(v)}`;
      return `${k}=${String(v)}`;
    })
    .join(' · ');
}

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  if (!(await isAdmin())) {
    redirect('/llm/course10/admin/login');
  }

  const params = await searchParams;
  const eventFilter = params.event?.trim() || '';

  const supabase = getSupabase();
  let query = supabase
    .from('audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (eventFilter) {
    if (eventFilter.endsWith('.') || eventFilter.endsWith('_')) {
      // Prefix-filter: alle 'admin.*' eller 'admin.sync_*' osv.
      query = query.like('event', `${eventFilter}%`);
    } else {
      query = query.eq('event', eventFilter);
    }
  }

  const { data } = await query;
  const rows = (data ?? []) as AuditRow[];

  return (
    <div>
      <SectionHeading
        eyebrow="Admin"
        title="Audit log"
        description="Seneste 100 hændelser. Admin-handlinger, bryllups-ændringer og AI-kald."
        action={
          <Link
            href="/llm/course10/admin"
            className="px-4 py-2 text-sm border border-[#dad3c4] rounded-md hover:border-[#3d4a3a] text-[#2a2723] transition-colors"
          >
            ← Tilbage
          </Link>
        }
      />

      <div className="flex flex-wrap items-center gap-2 mb-5 text-xs">
        <span className="text-[#75695b] mr-1">Filter:</span>
        {FILTERS.map((f) => {
          const active = eventFilter === f.value;
          const href = f.value
            ? `/llm/course10/admin/log?event=${encodeURIComponent(f.value)}`
            : '/llm/course10/admin/log';
          return (
            <Link
              key={f.value}
              href={href}
              className={`px-3 py-1 rounded-full border transition-colors ${
                active
                  ? 'bg-[#3d4a3a] text-[#f7f3ec] border-transparent'
                  : 'bg-transparent text-[#2a2723] border-[#dad3c4] hover:border-[#3d4a3a]'
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      <div className="bg-[#fffdf8] border border-[#dad3c4] rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#efe8d8]/60 text-[11px] uppercase tracking-[0.12em] text-[#75695b]">
            <tr>
              <Th>Tidspunkt</Th>
              <Th>Event</Th>
              <Th>Aktør</Th>
              <Th>IP</Th>
              <Th>Bryllup</Th>
              <Th>Detaljer</Th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-[#75695b]"
                >
                  Ingen hændelser matchede filteret.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-t border-[#efe8d8] align-top"
                >
                  <Td className="text-[#75695b] tabular-nums whitespace-nowrap">
                    {formatTimestamp(r.created_at)}
                  </Td>
                  <Td>
                    <span className="text-[#2a2723]">
                      {EVENT_LABELS[r.event] ?? r.event}
                    </span>
                  </Td>
                  <Td className="text-[#2a2723]">
                    {ACTOR_LABELS[r.actor] ?? r.actor}
                  </Td>
                  <Td className="text-[#75695b] font-mono text-[11px]">
                    {r.ip ?? '—'}
                  </Td>
                  <Td>
                    {r.bryllup_id ? (
                      <Link
                        href={`/llm/course10/bryllupper/${r.bryllup_id}`}
                        className="text-[#3d4a3a] hover:underline underline-offset-2 text-xs"
                      >
                        Åbn
                      </Link>
                    ) : (
                      <span className="text-[#a89b87]">—</span>
                    )}
                  </Td>
                  <Td className="text-[11px] text-[#75695b] max-w-xs break-all">
                    {detailsSummary(r.details) || '—'}
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-[#75695b] mt-3">
        Viser {rows.length} hændelser.
      </p>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th scope="col" className="px-4 py-3 text-left font-medium">
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
