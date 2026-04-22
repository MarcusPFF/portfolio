'use client';

import { ViewTransition } from 'react';
import Link from 'next/link';
import { pick, formatKm, formatDate, type Trip } from '@/lib/trips';
import { UI } from '@/lib/tripsI18n';
import { useTripsLang } from './useTripsLang';
import TripsLangSwitcher from './TripsLangSwitcher';

function groupByYear(list: Trip[]): [string, Trip[]][] {
  const groups = new Map<string, Trip[]>();
  for (const t of list) {
    const y = t.dateSort.slice(0, 4);
    if (!groups.has(y)) groups.set(y, []);
    groups.get(y)!.push(t);
  }
  return Array.from(groups.entries()).sort((a, b) => b[0].localeCompare(a[0]));
}

export default function TripDetailClient({ trip, allTrips }: { trip: Trip; allTrips: Trip[] }) {
  const [lang, setLang] = useTripsLang();
  const t = (key: keyof typeof UI) => pick(UI[key], lang);
  const grouped = groupByYear(allTrips);

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-10">
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/trips"
          transitionTypes={['nav-back']}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          {t('back_to_trips')}
        </Link>
        <TripsLangSwitcher lang={lang} onChange={setLang} />
      </div>

      <div className="flex flex-col md:flex-row gap-10 md:gap-14">
        {/* Sidebar — anchored, does not animate during navigation */}
        <aside
          style={{ viewTransitionName: 'trips-sidebar' }}
          className="md:w-56 md:shrink-0"
        >
          <div className="md:sticky md:top-24">
            <p className="text-slate-400 font-semibold tracking-[0.2em] uppercase text-xs mb-5">
              {t('all_trips')}
            </p>
            <nav>
              <div className="flex flex-col gap-6">
                {grouped.map(([year, list]) => (
                  <div key={year}>
                    <p className="text-slate-400 font-bold text-xs tracking-wider mb-2">{year}</p>
                    <ul className="flex flex-col gap-3 border-l border-slate-300/50 pl-3">
                      {list.map((item) => {
                        const isActive = item.slug === trip.slug;
                        return (
                          <li key={item.slug}>
                            {isActive ? (
                              <span
                                aria-current="page"
                                className="text-slate-900 font-semibold text-sm flex items-center gap-2"
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                                {pick(item.title, lang)}
                              </span>
                            ) : (
                              <Link
                                href={`/trips/${item.slug}`}
                                transitionTypes={['quick']}
                                className="text-slate-600 hover:text-slate-900 font-medium transition-colors text-sm"
                              >
                                {pick(item.title, lang)}
                              </Link>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <article className="flex-1 min-w-0 max-w-3xl">
          <ViewTransition name={`trip-card-${trip.slug}`}>
            <header
              className={`glass-card p-8 md:p-12 overflow-hidden relative bg-gradient-to-br ${trip.color}`}
            >
              <p className="text-slate-500 font-medium tracking-widest uppercase text-xs mb-3">
                {formatDate(trip.dateSort, lang)} · {pick(trip.location, lang)}
              </p>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tight mb-3">
                {pick(trip.title, lang)}
              </h1>
              <p className="text-slate-600 font-light text-lg mb-6">
                {pick(trip.subtitle, lang)}
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1.5 glass-pill rounded-full text-xs text-slate-700 font-medium">
                  {formatKm(trip.distanceKm, lang)}
                </span>
                <span className="px-3 py-1.5 glass-pill rounded-full text-xs text-slate-700 font-medium">
                  {pick(trip.duration, lang)}
                </span>
                {trip.bike && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 glass-pill rounded-full text-xs text-slate-700 font-medium">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <circle cx="5.5" cy="17.5" r="3.5" />
                      <circle cx="18.5" cy="17.5" r="3.5" />
                      <path d="M15 17.5h-5l-4-6h5l3-4h3l2 4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {trip.bike}
                  </span>
                )}
              </div>
            </header>
          </ViewTransition>

          <section className="mt-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight mb-5">
              {t('highlights')}
            </h2>
            <ul className="space-y-2">
              {pick(trip.highlights, lang).map((h, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-700">
                  <span className="mt-2 inline-block w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                  <span className="font-light leading-relaxed">{h}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight mb-5">
              {t('the_trip')}
            </h2>
            <div className="flex flex-col gap-5 text-slate-700 font-light leading-relaxed">
              {pick(trip.story, lang).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight mb-5">
              {t('pictures')}
            </h2>
            {trip.images && trip.images.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {trip.images.map((src, i) => (
                  // User-supplied trip photos can be any dimensions and may live
                  // outside /public — keep a plain <img> rather than next/image
                  // so no domain allow-list configuration is required per photo.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={src}
                    alt={`${pick(trip.title, lang)} — ${i + 1}`}
                    className="w-full h-64 object-cover rounded-[1.25rem] glass-card"
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-[1.25rem] border-2 border-dashed border-slate-300/70 bg-white/20 p-10 text-center text-slate-400 text-sm font-medium">
                {t('pictures_coming_soon')}
              </div>
            )}
          </section>
        </article>
      </div>
    </div>
  );
}
