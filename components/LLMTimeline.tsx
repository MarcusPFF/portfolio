'use client';

import Link from 'next/link';
import ScrollReveal from './ScrollReveal';
import { classes } from '../lib/data';

export default function LLMTimeline() {
  const visibleItems = classes.filter((cls) => !cls.hidden);

  return (
    <section className="py-20 px-6 md:px-24">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal>
          <p className="eyebrow mb-3 text-[color:var(--bone-mute)]">LLM Course</p>
          <h2
            className="font-display text-3xl md:text-4xl mb-2 text-[color:var(--bone)]"
            style={{ letterSpacing: '-0.02em', fontWeight: 420 }}
          >
            Class Timeline
          </h2>
          <p className="font-light text-sm mb-10 text-[color:var(--bone-dim)]">
            More coming as the course progresses
          </p>
        </ScrollReveal>

        <ScrollReveal>
          <div className="ink-card overflow-hidden">
            <ul>
              {visibleItems.map((cls, idx) => {
                const primaryHref = cls.blogSlug ? `/llm/${cls.blogSlug}/blog` : null;
                const showAppPill = !!cls.link;

                const rowContent = (
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-mono tabular-nums shrink-0 w-7 text-center text-[color:var(--accent)]">
                      {String(idx + 1).padStart(2, '0')}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-1.5">
                        <h3 className="text-base md:text-lg font-semibold tracking-tight text-[color:var(--bone)]">
                          {cls.title}
                        </h3>
                        <span className="font-light text-sm hidden sm:inline truncate text-[color:var(--bone-mute)]">
                          — {cls.subtitle}
                        </span>
                      </div>
                      <p className="text-[10px] font-mono tracking-[0.1em] truncate text-[color:var(--bone-mute)]">
                        {cls.tags.join(' · ')}
                      </p>
                    </div>

                    {showAppPill && (
                      // "Open app" pill is rendered as an absolute sibling below; reserve space here.
                      <span className="w-20 md:w-24 shrink-0" aria-hidden="true" />
                    )}
                  </div>
                );

                return (
                  <li
                    key={idx}
                    className={`relative ${idx > 0 ? 'border-t border-[color:var(--line)]' : ''}`}
                  >
                    {primaryHref ? (
                      <Link
                        href={primaryHref}
                        transitionTypes={['nav-forward']}
                        className="group block px-5 md:px-7 py-5 transition-colors hover:bg-[oklch(94%_0.022_82_/_0.04)]"
                      >
                        {rowContent}
                      </Link>
                    ) : (
                      <div className="px-5 md:px-7 py-5">{rowContent}</div>
                    )}

                    {showAppPill && cls.link && (
                      <Link
                        href={cls.link}
                        transitionTypes={['nav-forward']}
                        className="ink-pill absolute top-1/2 -translate-y-1/2 right-5 md:right-7 z-10 inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-semibold text-[color:var(--bone-dim)] hover:text-[color:var(--bone)]"
                      >
                        Open app
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
                        </svg>
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
