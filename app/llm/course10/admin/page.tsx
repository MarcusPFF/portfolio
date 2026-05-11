import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isAdmin } from '../_lib/admin-auth';
import { logoutAdmin } from '../_actions/admin';
import { getSupabase } from '../_lib/supabase';
import SectionHeading from '../_components/section-heading';
import AdminResetButton from '../_components/admin-reset-button';
import AdminDeleteAllButton from '../_components/admin-delete-all-button';
import AdminResetTrelloButton from '../_components/admin-reset-trello-button';
import SyncButton from '../_components/sync-button';

export const dynamic = 'force-dynamic';

async function getLastSyncTimestamps(): Promise<{
  download: string | null;
  upload: string | null;
}> {
  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from('sync_log')
      .select('finished_at, started_at, success, direction')
      .eq('success', true)
      .order('finished_at', { ascending: false, nullsFirst: false })
      .limit(20);
    const rows = data ?? [];
    const download = rows.find((r) => r.direction === 'download');
    const upload = rows.find((r) => r.direction === 'upload');
    return {
      download: download?.finished_at ?? download?.started_at ?? null,
      upload: upload?.finished_at ?? upload?.started_at ?? null,
    };
  } catch {
    return { download: null, upload: null };
  }
}

export default async function AdminPage() {
  if (!(await isAdmin())) {
    redirect('/llm/course10/admin/login');
  }

  const lastSyncedAt = await getLastSyncTimestamps();

  return (
    <div>
      <SectionHeading
        eyebrow="Admin"
        title="Demo-kontrol"
        description="Handlinger der ikke er tilgængelige for almindelige besøgende."
        action={
          <form action={logoutAdmin}>
            <button
              type="submit"
              className="px-4 py-2 text-sm border border-[#dad3c4] rounded-md hover:border-[#3d4a3a] text-[#2a2723] transition-colors"
            >
              Log ud
            </button>
          </form>
        }
      />

      <div className="space-y-8">
        <Card
          title="Reset til seed"
          description="Slet alt eksisterende data og indsæt 10 mock-bryllupper med forskellige statusser (forespørgsel, tilbud sendt, booket, afholdt, aflyst). Bruges efter en demo eller når besøgende har rodet i dataen."
        >
          <AdminResetButton />
        </Card>

        <Card
          title="Fjern alle bryllupper"
          description="Slet ALLE bryllupper fra Supabase uden at indsætte noget bagefter. Kaskaderer til opgaver, tilkøb, betalinger og overnatninger. Bruges når du vil demonstrere at appen henter data fra Trello (klik denne, dernæst 'Hent fra Trello')."
        >
          <AdminDeleteAllButton />
        </Card>

        <Card
          title="Trello-sync"
          description="To-vejs synkronisering med Trello-boardet. 'Hent' trækker lister og kort fra Trello til Supabase. 'Upload' sender Supabase-data tilbage til Trello — kan overskrive manuelle ændringer. 'Reset Trello' arkiverer alle lister på boardet (også standardlister som 'To Do/Doing/Done'). Alle tre er idempotente; bryllupper matches på trello_list_id, opgaver på trello_card_id."
        >
          <div className="space-y-5">
            <SyncButton variant="download" lastSyncedAt={lastSyncedAt.download} />
            <SyncButton variant="upload" lastSyncedAt={lastSyncedAt.upload} />
            <div className="pt-3 border-t border-[#dad3c4]">
              <AdminResetTrelloButton />
            </div>
          </div>
        </Card>

        <Card
          title="Slet enkelt bryllup"
          description="Slet-knappen findes på selve bryllupsdetalje-siden når du er logget ind som admin."
        >
          <Link
            href="/llm/course10/bryllupper"
            className="text-sm text-[#3d4a3a] hover:underline underline-offset-4"
          >
            Gå til alle bryllupper →
          </Link>
        </Card>

        <Card
          title="Audit log"
          description="Seneste 100 hændelser: admin-handlinger, bryllups-ændringer, AI-kald, fejlede login-forsøg."
        >
          <Link
            href="/llm/course10/admin/log"
            className="inline-flex items-center px-4 py-2 bg-[#3d4a3a] text-[#f0ede2] rounded-md text-sm font-medium hover:bg-[#2e3a2c] transition-colors"
          >
            Åbn audit log →
          </Link>
        </Card>
      </div>
    </div>
  );
}

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-[#fffdf8] border border-[#dad3c4] rounded-lg p-6">
      <h3 className="display text-xl text-[#2a2723] mb-2">{title}</h3>
      <p className="text-sm text-[#6b6358] mb-4 max-w-prose">{description}</p>
      {children}
    </section>
  );
}
