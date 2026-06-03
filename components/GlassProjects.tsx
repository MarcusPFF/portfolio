'use client';

import { useState } from 'react';
import ScrollReveal from './ScrollReveal';
import { projects } from '../lib/data';


export default function GlassProjects({
  repoCount,
}: {
  repoCount?: number | null;
}) {
  const [showAll, setShowAll] = useState(false);
  const INITIAL_PROJECTS_COUNT = 4;

  const filteredProjects = projects.filter((p) => !p.hidden);

  return (
    <section
      id="projects"
      className="container-grid"
      style={{ paddingTop: 'var(--section-py)', paddingBottom: 'var(--section-py)' }}
    >
      <ScrollReveal>
        <div className="flex items-baseline justify-between mb-10">
          <h2
            className="font-display text-4xl md:text-5xl"
            style={{
              color: 'var(--bone)',
              fontWeight: 350,
              fontVariationSettings: '"opsz" 144, "SOFT" 100',
              letterSpacing: '-0.02em',
            }}
          >
            Projects
          </h2>
          <span
            className="font-mono text-[11px] tabular-nums"
            style={{ color: 'var(--bone-dim)' }}
            aria-label={`${filteredProjects.length} projects`}
          >
            {String(filteredProjects.length).padStart(2, '0')}
          </span>
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <ul style={{ borderTop: '1px solid var(--line)' }}>
          {filteredProjects.map((proj, idx) => {
            const isExtra = idx >= INITIAL_PROJECTS_COUNT;
            const collapsed = isExtra && !showAll;
            const isComingSoon = !proj.link;
            // The catch-all card shows the live repo count when available.
            const subtitle =
              proj.pinLast && repoCount != null
                ? `${repoCount} repositories`
                : proj.subtitle;

            // Shared row body. The subtitle and arrow sit together on the right;
            // only real links animate the arrow and navigate on click.
            const row = (
              <div className="flex items-center gap-4 pr-1.5">
                <span
                  className="font-mono text-[11px] tabular-nums shrink-0 w-8 text-left"
                  style={{ color: 'var(--accent)' }}
                >
                  {String(idx + 1).padStart(2, '0')}
                </span>

                <div className="flex-1 min-w-0">
                  <h3
                    className="font-display text-lg md:text-xl truncate mb-1"
                    style={{
                      color: 'var(--bone)',
                      fontWeight: 400,
                      fontVariationSettings: '"opsz" 36, "SOFT" 100',
                      letterSpacing: '-0.015em',
                    }}
                  >
                    {proj.title}
                  </h3>
                  <p
                    className="font-body font-light text-sm leading-snug truncate mb-1.5"
                    style={{ color: 'var(--bone-dim)' }}
                  >
                    {proj.desc}
                  </p>
                  <p
                    className="font-mono text-[10px] tabular-nums truncate"
                    style={{ color: 'var(--bone-mute)' }}
                  >
                    {proj.tags.join(' · ')}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className="font-body text-[11px] font-normal whitespace-nowrap"
                    style={{ color: 'var(--bone-mute)' }}
                  >
                    {subtitle}
                  </span>
                  <svg
                    className="w-4 h-4 group-hover:translate-x-1 transition-all shrink-0"
                    style={{ color: 'var(--bone-mute)' }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </div>
              </div>
            );

            return (
              <li
                key={idx}
                className="grid"
                style={{
                  gridTemplateRows: collapsed ? '0fr' : '1fr',
                  opacity: collapsed ? 0 : 1,
                  transition:
                    'grid-template-rows 450ms cubic-bezier(0.22, 1, 0.36, 1), opacity 350ms ease-out',
                }}
              >
                <div className="overflow-hidden" inert={collapsed}>
                  {isComingSoon ? (
                    <div
                      style={{ borderBottom: '1px solid var(--line)' }}
                      className="block py-5"
                    >
                      {row}
                    </div>
                  ) : (
                    <a
                      href={proj.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ borderBottom: '1px solid var(--line)' }}
                      className="group block py-5 transition-colors hover:bg-[oklch(94%_0.022_82_/_0.03)]"
                    >
                      {row}
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </ScrollReveal>

      {filteredProjects.length > INITIAL_PROJECTS_COUNT && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setShowAll(!showAll)}
            style={{ color: 'var(--bone-dim)' }}
            className="ink-pill px-5 py-2 min-h-11 sm:min-h-9 rounded-full text-xs font-semibold hover:[color:var(--bone)] active:scale-[0.97] transition-all duration-300 flex items-center gap-2 group"
          >
            <span>
              {showAll
                ? 'Show fewer'
                : `Show all ${filteredProjects.length} projects`}
            </span>
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}
    </section>
  );
}
