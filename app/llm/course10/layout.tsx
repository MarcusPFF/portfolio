import type { Metadata } from 'next';
import Link from 'next/link';
import { Cormorant_Garamond } from 'next/font/google';
import Brand from './_components/brand';
import Sidebar from './_components/sidebar';
import { isAdmin } from './_lib/admin-auth';
import './engestofte.css';

const cormorant = Cormorant_Garamond({
  variable: '--font-engestofte-display',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Engestofte Gods — Bryllupskoordinator',
  description:
    'Internt admin-værktøj for bryllupskoordination på Engestofte Gods. Demo bygget af Marcus Forsberg.',
};

export default async function EngestofteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await isAdmin();
  return (
    <div className={`${cormorant.variable} engestofte-shell min-h-screen`}>
      <div className="flex flex-col md:flex-row min-h-screen">
        <Sidebar admin={admin} />
        <div className="flex-1 min-w-0 flex flex-col">
          <Brand />
          <main className="flex-1 px-6 md:px-10 py-8 md:py-12">
            <div className="max-w-6xl mx-auto">{children}</div>
          </main>
          <footer className="border-t border-[#dad3c4] py-6 px-6 md:px-10">
            <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs text-[#6b6358]">
              <p>
                Engestofte Gods · Demo bygget af{' '}
                <Link
                  href="/"
                  className="underline underline-offset-2 hover:text-[#2a2723]"
                >
                  Marcus Forsberg
                </Link>
              </p>
              <p>Mock-data · Ingen rigtig kommunikation til brudepar</p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
