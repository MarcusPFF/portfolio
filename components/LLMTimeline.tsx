'use client';

import { useState } from 'react';
import Link from 'next/link';
import ScrollReveal from './ScrollReveal';
import { classes } from '../lib/data';


export default function LLMTimeline() {
  const [showAll, setShowAll] = useState(true);
  const INITIAL_ITEMS_COUNT = 3;

  const filteredItems = classes.filter(cls => !cls.hidden);
  const visibleItems = showAll ? filteredItems : filteredItems.slice(0, INITIAL_ITEMS_COUNT);

  return (
    <section className="py-28 px-6 md:px-24">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <p className="text-slate-400 font-medium tracking-[0.2em] uppercase text-sm mb-3">LLM Course</p>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-16 tracking-tight">
            Class Timeline
          </h2>
        </ScrollReveal>

        <div className="flex flex-col gap-10">
          {visibleItems.map((cls, idx) => {
            const CardWrapper = ({ children }: { children: React.ReactNode }) =>
              cls.link ? (
                <Link href={cls.link} transitionTypes={['nav-forward']} className="block">
                  {children}
                </Link>
              ) : (
                <div className="block">{children}</div>
              );
            return (
            <ScrollReveal key={idx} delay={idx * 100}>
              <CardWrapper>
                <div className={`glass-card-hover p-8 md:p-10 group overflow-hidden relative ${cls.link ? 'cursor-pointer' : ''}`}>
                  {/* Subtle gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${cls.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[1.25rem]`} />

                  <div className="relative z-10 flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                      <div className="flex items-baseline gap-3 mb-3">
                        <h3 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
                          {cls.title}
                        </h3>
                        <span className="text-slate-400 font-light text-lg hidden sm:inline">
                          — {cls.subtitle}
                        </span>
                      </div>
                      <p className="text-slate-500 font-light leading-relaxed max-w-2xl mb-5">
                        {cls.desc}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {cls.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1.5 glass-pill rounded-full text-sm text-slate-600 font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Arrow for linked items, check mark for completed timeline items */}
                    <div className="w-12 h-12 rounded-full bg-white/40 flex items-center justify-center group-hover:bg-slate-800 group-hover:text-white transition-all duration-300 shrink-0 self-start md:self-center">
                      <svg className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        {cls.link ? (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        )}
                      </svg>
                    </div>
                  </div>
                </div>
              </CardWrapper>
            </ScrollReveal>
            );
          })}
        </div>

        {filteredItems.length > INITIAL_ITEMS_COUNT && (
          <div className="mt-12 flex justify-center">
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-8 py-3 glass-pill rounded-full text-sm font-semibold text-slate-600 hover:text-slate-900 transition-all duration-300 flex items-center gap-2 group border border-slate-200/50"
            >
              <span>{showAll ? 'Show Fewer Weeks' : 'Show All Weeks'}</span>
              <svg
                className={`w-4 h-4 transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`}
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
