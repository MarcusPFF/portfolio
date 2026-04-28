'use client';

import Link from 'next/link';
import ScrollReveal from './ScrollReveal';
import { classes } from '../lib/data';


export default function LLMTimeline() {
  const visibleItems = classes.filter((cls) => !cls.hidden);

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
                <div className="relative">
                  <CardWrapper>
                    <div
                      className={`glass-card-hover p-8 md:p-10 group overflow-hidden relative ${cls.link ? 'cursor-pointer' : ''}`}
                    >
                      {/* Subtle gradient overlay on hover */}
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${cls.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[1.25rem]`}
                      />

                      {/* Indicator icon — absolutely pinned to the top-right corner. */}
                      <div className="absolute top-8 md:top-10 right-8 md:right-10 w-12 h-12 rounded-full bg-white/40 flex items-center justify-center group-hover:bg-slate-800 group-hover:text-white transition-all duration-300 z-10">
                        <svg
                          className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          {cls.link ? (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M7 17L17 7M17 7H7M17 7v10"
                            />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          )}
                        </svg>
                      </div>

                      {/* Right padding leaves room for the corner icon */}
                      <div className="relative z-10 pr-16">
                        <div className="flex items-baseline gap-3 mb-3">
                          <h3 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
                            {cls.title}
                          </h3>
                          <span className="text-slate-400 font-light text-lg hidden sm:inline">
                            — {cls.subtitle}
                          </span>
                        </div>
                        {cls.desc && (
                          <p className="text-slate-500 font-light leading-relaxed max-w-2xl mb-5">
                            {cls.desc}
                          </p>
                        )}
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
                        {/* Spacer so the absolutely-positioned Blog pill doesn't overlap tags */}
                        {cls.blogSlug && <div className="h-10" />}
                      </div>
                    </div>
                  </CardWrapper>

                  {/* Blog pill — pinned to bottom-right, sibling to CardWrapper to avoid nested <Link>s */}
                  {cls.blogSlug && (
                    <Link
                      href={`/llm/${cls.blogSlug}/blog`}
                      transitionTypes={['nav-forward']}
                      className="absolute bottom-6 right-6 md:bottom-8 md:right-8 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 glass-pill rounded-full text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200/50"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 006.5 22H20V2H6.5A2.5 2.5 0 004 4.5v15z"
                        />
                      </svg>
                      Blog
                    </Link>
                  )}
                </div>
              </ScrollReveal>
            );
          })}
        </div>

      </div>
    </section>
  );
}
