'use client';

import { ViewTransition, type CSSProperties, type ReactNode } from 'react';
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

// Section heading: Fraunces serif, sentence-case, with a small trip-colored marker dot.
function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2
      className="font-display text-xl md:text-2xl mb-4 text-[color:var(--bone)] flex items-center gap-2.5"
      style={{ letterSpacing: '-0.01em' }}
    >
      <span
        aria-hidden="true"
        className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: 'var(--trip-soft)' }}
      />
      {children}
    </h2>
  );
}

export default function TripDetailClient({ trip, allTrips }: { trip: Trip; allTrips: Trip[] }) {
  const [lang, setLang] = useTripsLang();
  const t = (key: keyof typeof UI) => pick(UI[key], lang);
  const grouped = groupByYear(allTrips);

  const storyParas = pick(trip.story, lang);
  const storyIsPlaceholder =
    storyParas.length <= 1 && /placeholder|platzhalter/i.test(storyParas[0] ?? '');

  return (
    <div
      className="max-w-5xl mx-auto px-6 md:px-10"
      style={
        {
          '--trip': trip.hexColor,
          '--trip-soft': 'color-mix(in oklab, var(--trip) 58%, var(--bone))',
          '--trip-wash': 'color-mix(in oklab, var(--trip) 18%, transparent)',
          '--trip-line': 'color-mix(in oklab, var(--trip) 40%, var(--line-strong))',
        } as CSSProperties
      }
    >
      <div className="flex items-center justify-between mb-7">
        <Link
          href="/trips"
          transitionTypes={['nav-back']}
          className="inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-80 text-[var(--trip-soft)]"
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

      <div className="flex flex-col md:flex-row gap-8 md:gap-12">
        {/* Sidebar — anchored, does not animate during navigation */}
        <aside
          style={{ viewTransitionName: 'trips-sidebar' }}
          className="md:w-48 md:shrink-0"
        >
          <div className="md:sticky md:top-20">
            <p className="eyebrow mb-4 text-[color:var(--bone-mute)]">
              {t('all_trips')}
            </p>
            <nav>
              <div className="flex flex-col gap-6">
                {grouped.map(([year, list]) => (
                  <div key={year}>
                    <p className="font-mono text-[11px] tracking-wider mb-2 text-[color:var(--bone-mute)]">
                      {year}
                    </p>
                    <ul className="flex flex-col gap-3 border-l border-[color:var(--line)] pl-3">
                      {list.map((item) => {
                        const isActive = item.slug === trip.slug;
                        return (
                          <li key={item.slug}>
                            {isActive ? (
                              <span
                                aria-current="page"
                                className="font-semibold text-sm flex items-center gap-2 text-[color:var(--bone)]"
                              >
                                <span
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{ background: 'var(--trip-soft)' }}
                                />
                                {pick(item.title, lang)}
                              </span>
                            ) : (
                              <Link
                                href={`/trips/${item.slug}`}
                                transitionTypes={['quick']}
                                className="font-medium transition-colors text-sm text-[color:var(--bone-dim)] hover:text-[color:var(--bone)]"
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
        <article className="flex-1 min-w-0 max-w-2xl">
          <ViewTransition name={`trip-card-${trip.slug}`}>
            <header className="ink-card relative overflow-hidden p-6 md:p-10">
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(135deg, var(--trip-wash), transparent 65%)' }}
              />
              <div className="relative z-10">
                <p className="font-mono text-[10px] tracking-[0.12em] mb-2 text-[color:var(--bone-mute)]">
                  {formatDate(trip.dateSort, lang)} · {pick(trip.location, lang)}
                </p>
                <h1
                  className="font-display text-3xl md:text-4xl mb-2 text-[color:var(--bone)]"
                  style={{ letterSpacing: '-0.02em', fontWeight: 420 }}
                >
                  {pick(trip.title, lang)}
                  <span style={{ color: 'var(--trip-soft)' }}>.</span>
                </h1>
                <p className="font-light text-base mb-5 text-[color:var(--bone-dim)]">
                  {pick(trip.subtitle, lang)}
                </p>
                <div className="flex flex-wrap gap-3">
                  {[formatKm(trip.distanceKm, lang), pick(trip.duration, lang)].map((label) => (
                    <span
                      key={label}
                      className="px-3 py-1.5 rounded-full text-xs font-medium border text-[color:var(--bone-dim)]"
                      style={{ background: 'var(--trip-wash)', borderColor: 'var(--trip-line)' }}
                    >
                      {label}
                    </span>
                  ))}
                  {trip.bike && (
                    <span
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border text-[color:var(--bone-dim)]"
                      style={{ background: 'var(--trip-wash)', borderColor: 'var(--trip-line)' }}
                    >
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
              </div>
            </header>
          </ViewTransition>

          <section className="mt-10">
            <SectionHeading>{t('highlights')}</SectionHeading>
            <ul className="space-y-1.5">
              {pick(trip.highlights, lang).map((h, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-[color:var(--bone-dim)]">
                  <span
                    className="mt-1.5 inline-block w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: 'var(--trip-soft)' }}
                  />
                  <span className="font-light leading-relaxed">{h}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10">
            <SectionHeading>{t('the_trip')}</SectionHeading>
            <div className="flex flex-col gap-4">
              {storyParas.map((p, i) => (
                <p
                  key={i}
                  className={
                    storyIsPlaceholder
                      ? 'text-sm font-light italic leading-relaxed text-[color:var(--bone-mute)]'
                      : 'text-sm font-light leading-relaxed text-[color:var(--bone-dim)]'
                  }
                >
                  {p}
                </p>
              ))}
            </div>
          </section>

          <section className="mt-10">
            <SectionHeading>{t('pictures')}</SectionHeading>
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
                    className="w-full h-64 object-cover rounded-[1.25rem] border border-[color:var(--line)]"
                  />
                ))}
              </div>
            ) : (
              <div
                className="rounded-[1.25rem] border-2 border-dashed p-10 text-center text-sm font-medium text-[color:var(--bone-mute)]"
                style={{ borderColor: 'var(--line-strong)', background: 'var(--trip-wash)' }}
              >
                {t('pictures_coming_soon')}
              </div>
            )}
          </section>
        </article>
      </div>
    </div>
  );
}
