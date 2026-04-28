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
    <>
      <GlassNav />

      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-[400px] h-[400px] bg-purple-300/20 rounded-full blur-3xl float-slow" />
        <div className="absolute top-[60%] right-[10%] w-[350px] h-[350px] bg-pink-300/20 rounded-full blur-3xl float-medium" />
        <div className="absolute top-[30%] right-[30%] w-[300px] h-[300px] bg-blue-300/15 rounded-full blur-3xl float-fast" />
        <div className="absolute bottom-[10%] left-[20%] w-[250px] h-[250px] bg-orange-200/15 rounded-full blur-3xl float-slow" />
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

          <footer className="py-12 mt-16 text-center text-slate-400 font-light text-sm">
            <p>© 2026 Marcus Forsberg</p>
          </footer>
        </main>
      </ViewTransition>

      <ChatWidgetLazy />
    </>
  );
}
