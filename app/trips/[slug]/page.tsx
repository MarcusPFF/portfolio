import { ViewTransition } from 'react';
import { notFound } from 'next/navigation';
import GlassNav from '@/components/GlassNav';
import ChatWidgetLazy from '@/components/ChatWidgetLazy';
import TripDetailClient from '@/components/TripDetailClient';
import { trips, getTripBySlug } from '@/lib/trips';

export function generateStaticParams() {
  return trips.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const trip = getTripBySlug(slug);
  if (!trip) return { title: 'Trip not found | Marcus Forsberg' };
  return {
    title: `${trip.title.en} | Marcus Forsberg`,
    description: trip.summary.en,
  };
}

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const trip = getTripBySlug(slug);
  if (!trip) notFound();

  return (
    <div className="theme-night">
      <GlassNav night />

      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div
          className="absolute top-[10%] -left-[6%] w-[520px] h-[520px] rounded-full blur-3xl float-slow"
          style={{ background: 'oklch(48% 0.008 280 / 0.22)' }}
        />
        <div
          className="absolute bottom-[4%] -right-[6%] w-[460px] h-[460px] rounded-full blur-3xl float-medium"
          style={{ background: 'oklch(42% 0.12 280 / 0.16)' }}
        />
      </div>

      <ViewTransition
        enter={{
          'nav-forward': 'nav-forward',
          'nav-back': 'nav-back',
          quick: 'quick',
          default: 'none',
        }}
        exit={{
          'nav-forward': 'nav-forward',
          'nav-back': 'nav-back',
          quick: 'quick',
          default: 'none',
        }}
        default="none"
      >
        <main className="relative z-10 pt-24 pb-12">
          <TripDetailClient trip={trip} allTrips={trips} />

          <footer className="py-12 mt-16 text-center font-mono text-[11px] text-[color:var(--bone-mute)]">
            <p>© 2026 Marcus Forsberg</p>
          </footer>
        </main>
      </ViewTransition>

      <ChatWidgetLazy />
    </div>
  );
}
