'use client';

import { ViewTransition, useMemo, useState, type CSSProperties } from 'react';
import Link from 'next/link';
import { trips, pick, formatKm, formatDate } from '@/lib/trips';
import { UI } from '@/lib/tripsI18n';
import { useTripsLang } from './useTripsLang';
import TripsLangSwitcher from './TripsLangSwitcher';
import TripsGlobe from './TripsGlobe';

type SortKey = 'latest' | 'oldest' | 'longest';

const SORT_KEYS: SortKey[] = ['latest', 'oldest', 'longest'];

const pillBase =
  'rounded-full text-xs font-semibold tracking-wider transition-all min-h-11 active:scale-[0.97]';

const activePillStyle = {
  background: 'oklch(94% 0.022 82 / 0.12)',
  borderColor: 'var(--line-strong)',
};

export default function TripsListClient() {
  const [lang, setLang] = useTripsLang();
  const [sort, setSort] = useState<SortKey>('latest');
  const [showGlobe, setShowGlobe] = useState(false);

  const sortedTrips = useMemo(() => {
    const arr = [...trips];
    if (sort === 'latest') arr.sort((a, b) => b.dateSort.localeCompare(a.dateSort));
    if (sort === 'oldest') arr.sort((a, b) => a.dateSort.localeCompare(b.dateSort));
    if (sort === 'longest') arr.sort((a, b) => b.distanceKm - a.distanceKm);
    return arr;
  }, [sort]);

  const t = (key: keyof typeof UI) => pick(UI[key], lang);

  return (
    <section className="py-20 px-6 md:px-24">
      <div className="max-w-5xl mx-auto">
        <p className="reveal-top eyebrow mb-3 text-[color:var(--bone-mute)]">
          {t('adventurer')}
        </p>
        <h1
          className="reveal-top reveal-top-1 font-display text-4xl md:text-5xl mb-2 text-[color:var(--bone)]"
          style={{ letterSpacing: '-0.02em', fontWeight: 420 }}
        >
          {t('motorcycle_trips')}
        </h1>
        <p className="reveal-top reveal-top-2 font-light text-sm leading-relaxed max-w-xl mb-8 text-[color:var(--bone-dim)]">
          {t('intro')}
        </p>

        <div className="reveal-top reveal-top-2 mb-5">
          <button
            type="button"
            onClick={() => setShowGlobe((v) => !v)}
            aria-pressed={showGlobe}
            className={`inline-flex items-center gap-2 px-4 py-2 sm:min-h-9 ${pillBase} ${
              showGlobe
                ? 'border text-[color:var(--bone)]'
                : 'ink-pill text-[color:var(--bone-dim)] hover:text-[color:var(--bone)]'
            }`}
            style={showGlobe ? activePillStyle : undefined}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18" />
              <path d="M12 3a14 14 0 010 18" />
              <path d="M12 3a14 14 0 000 18" />
            </svg>
            {showGlobe ? t('hide_overview') : t('overview_on_maps')}
          </button>
        </div>

        {showGlobe && (
          <div className="reveal-top mb-8">
            <TripsGlobe trips={trips} lang={lang} hint={t('globe_hint')} />
          </div>
        )}

        <div className="reveal-top reveal-top-2 flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-8">
          <div className="flex flex-wrap gap-1.5">
            {SORT_KEYS.map((k) => {
              const active = sort === k;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setSort(k)}
                  aria-pressed={active}
                  className={`px-3.5 py-1.5 sm:min-h-8 ${pillBase} ${
                    active
                      ? 'border text-[color:var(--bone)]'
                      : 'ink-pill text-[color:var(--bone-dim)] hover:text-[color:var(--bone)]'
                  }`}
                  style={active ? activePillStyle : undefined}
                >
                  {t(`sort_${k}` as keyof typeof UI)}
                </button>
              );
            })}
          </div>
          <TripsLangSwitcher lang={lang} onChange={setLang} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedTrips.map((trip, idx) => (
            <Link
              key={trip.slug}
              href={`/trips/${trip.slug}`}
              transitionTypes={['nav-forward']}
              className={`block group reveal-top reveal-top-${Math.min(idx + 3, 6)}`}
            >
              <ViewTransition name={`trip-card-${trip.slug}`}>
                <article
                  className="ink-card relative h-full p-6 md:p-8 overflow-hidden transition-transform duration-500 group-hover:-translate-y-1"
                  style={
                    {
                      '--trip': trip.hexColor,
                      '--trip-soft': 'color-mix(in oklab, var(--trip) 58%, var(--bone))',
                      '--trip-wash': 'color-mix(in oklab, var(--trip) 18%, transparent)',
                    } as CSSProperties
                  }
                >
                  <div
                    className="absolute inset-0 opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: 'linear-gradient(135deg, var(--trip-wash), transparent 62%)' }}
                  />
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-baseline justify-between mb-2">
                      <p className="font-mono text-[10px] tracking-[0.12em] text-[color:var(--bone-mute)]">
                        {formatDate(trip.dateSort, lang)}
                      </p>
                      <p className="font-mono text-[11px] text-[color:var(--bone-mute)]">
                        {formatKm(trip.distanceKm, lang)}
                      </p>
                    </div>
                    <h2
                      className="font-display text-xl md:text-2xl mb-1.5 text-[color:var(--bone)]"
                      style={{ letterSpacing: '-0.01em' }}
                    >
                      {pick(trip.title, lang)}
                    </h2>
                    <p className="text-xs font-light mb-4 text-[color:var(--bone-dim)]">
                      {pick(trip.subtitle, lang)}
                    </p>
                    <p className="text-sm font-light leading-relaxed mb-5 flex-1 text-[color:var(--bone-dim)]">
                      {pick(trip.summary, lang)}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-[color:var(--bone-mute)]">{pick(trip.location, lang)}</span>
                        {trip.bike && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[color:var(--bone-mute)]">
                            <svg
                              className="w-3 h-3"
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
                      <span
                        className="inline-flex items-center gap-2 font-medium text-xs group-hover:gap-3 transition-all"
                        style={{ color: 'var(--trip-soft)' }}
                      >
                        {t('read_more')}
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
                        </svg>
                      </span>
                    </div>
                  </div>
                </article>
              </ViewTransition>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
