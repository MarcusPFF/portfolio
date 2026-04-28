'use client';

import { useState } from 'react';
import ScrollReveal from './ScrollReveal';
import { projects } from '../lib/data';


export default function GlassProjects() {
  const [showAll, setShowAll] = useState(false);
  const INITIAL_PROJECTS_COUNT = 4;

  const filteredProjects = projects.filter((p) => !p.hidden);
  const visibleProjects = showAll
    ? filteredProjects
    : filteredProjects.slice(0, INITIAL_PROJECTS_COUNT);

  return (
    <section id="projects" className="pt-6 pb-20 px-6 md:px-24">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal>
          <p className="text-slate-400 font-medium tracking-[0.2em] uppercase text-xs mb-3">
            Portfolio
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2 tracking-tight">
            Selected Projects
          </h2>
          <p className="text-slate-500 font-light text-sm mb-10">More coming soon</p>
        </ScrollReveal>

        <ScrollReveal>
          <div className="glass-card overflow-hidden">
            <ul>
              {visibleProjects.map((proj, idx) => (
                <li
                  key={idx}
                  className={idx > 0 ? 'border-t border-white/40' : ''}
                >
                  <a
                    href={proj.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block px-5 md:px-7 py-5 hover:bg-white/30 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-slate-400 font-mono tabular-nums shrink-0 w-7 text-center">
                        {String(idx + 1).padStart(2, '0')}
                      </span>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-3 mb-0.5">
                          <h3 className="text-base md:text-lg font-bold text-slate-800 tracking-tight truncate">
                            {proj.title}
                          </h3>
                          <span className="text-slate-400 font-medium text-[10px] uppercase tracking-[0.15em] shrink-0 hidden sm:inline">
                            {proj.subtitle}
                          </span>
                        </div>
                        <p className="text-slate-500 font-light text-sm leading-snug line-clamp-1 mb-1.5">
                          {proj.desc}
                        </p>
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.15em] truncate">
                          {proj.tags.join(' · ')}
                        </p>
                      </div>

                      <svg
                        className="w-4 h-4 text-slate-400 group-hover:text-slate-800 group-hover:translate-x-1 transition-all shrink-0"
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
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </ScrollReveal>

        {filteredProjects.length > INITIAL_PROJECTS_COUNT && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-5 py-2 min-h-11 sm:min-h-9 glass-pill rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 transition-all duration-300 flex items-center gap-2 group border border-slate-200/50"
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
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
