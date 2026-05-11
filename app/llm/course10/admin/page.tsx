import Link from 'next/link';
import { redirect } from 'next/navigation';
import { isAdmin } from '../_lib/admin-auth';
import { logoutAdmin } from '../_actions/admin';
import SectionHeading from '../_components/section-heading';
import AdminResetButton from '../_components/admin-reset-button';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  if (!(await isAdmin())) {
    redirect('/llm/course10/admin/login');
  }

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
          description="Slet alle bryllupper, opgaver, tilkøb, betalinger og overnatninger, og indsæt de 6 oprindelige demo-bryllupper igen. Brug det når besøgende har rodet for meget i demo-dataen."
        >
          <AdminResetButton />
        </Card>

        <Card
          title="Trello-sync"
          description="Ikke implementeret endnu. Kommer i Phase 5 når Engestofte sender mock-board skabelonen."
        >
          <button
            type="button"
            disabled
            className="px-4 py-2 border border-[#dad3c4] text-[#a89b87] rounded-md text-sm font-medium cursor-not-allowed"
          >
            Sync fra Trello
          </button>
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
