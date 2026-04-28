'use client';

import { useState } from 'react';
import Link from 'next/link';
import { RUBRIC } from '@/app/llm/course-5/rubric';

type Criterion = {
  name: string;
  level: 'low' | 'mid' | 'high';
  comment: string;
};

type Assessment = {
  overallAssessment: string;
  criteria: Criterion[];
  dare_share_care: { dare: string; share: string; care: string };
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  dialogueQuestions: string[];
};

type Lang = 'en' | 'dk';

const MAX_CHARS = 15_000;

const LEVEL_STYLES: Record<Criterion['level'], string> = {
  low: 'bg-rose-400/15 text-rose-700 border-rose-400/40',
  mid: 'bg-amber-400/15 text-amber-700 border-amber-400/40',
  high: 'bg-emerald-400/15 text-emerald-700 border-emerald-400/40',
};

const T = {
  back: { en: 'Back to LLM Course', dk: 'Tilbage til LLM-kursus' },
  course: { en: 'Course 5 + 6', dk: 'Course 5 + 6' },
  title: {
    en: 'AI Internship Report Assessor',
    dk: 'AI-vurdering af praktikrapport',
  },
  intro: {
    en: 'A learning tool a teacher could use as a second pair of eyes when grading datamatiker internship reports ("praktikrapport"). Paste a report and get a structured, advisory assessment back from Llama 3.3 70B (via Groq). It grades against a rubric derived from EK\'s learning objectives, the report requirements, and the Dare-Share-Care core values. This is a guidance tool — not a final grade.',
    dk: 'Et læringsværktøj som en underviser kan bruge som et ekstra par øjne, når praktikrapporter fra datamatiker-uddannelsen skal bedømmes. Indsæt en rapport og få en struktureret, vejledende vurdering tilbage fra Llama 3.3 70B (via Groq). Den vurderer ud fra en rubric udledt af EK\'s læringsmål, krav til rapport og Dare-Share-Care-værdierne. Det er et vejledende værktøj — ikke en endelig bedømmelse.',
  },
  rubricToggle: {
    en: 'Show rubric',
    dk: 'Vis rubric',
  },
  rubricToggleClose: {
    en: 'Hide rubric',
    dk: 'Skjul rubric',
  },
  rubricHeading: {
    en: 'Rubric — five criteria the report is assessed against',
    dk: 'Rubric — fem kriterier rapporten vurderes på',
  },
  dareShareCare: {
    en: 'Dare, Share, Care',
    dk: 'Dare, Share, Care',
  },
  exampleLabel: {
    en: 'Load example:',
    dk: 'Indlæs eksempel:',
  },
  submissionLabel: { en: 'Internship report', dk: 'Praktikrapport' },
  placeholder: {
    en: 'Paste the full internship report here…',
    dk: 'Indsæt hele praktikrapporten her…',
  },
  charCount: {
    en: (n: number, max: number) =>
      `${n.toLocaleString('en-US')} / ${max.toLocaleString('en-US')} characters`,
    dk: (n: number, max: number) =>
      `${n.toLocaleString('da-DK')} / ${max.toLocaleString('da-DK')} tegn`,
  },
  assess: { en: 'Assess', dk: 'Vurder' },
  assessing: { en: 'Assessing…', dk: 'Vurderer…' },
  clear: { en: 'Clear', dk: 'Ryd' },
  overall: { en: 'Overall assessment', dk: 'Samlet vurdering' },
  criteria: { en: 'Criteria', dk: 'Kriterier' },
  strengths: { en: 'Strengths', dk: 'Styrker' },
  weaknesses: { en: 'Weaknesses', dk: 'Svagheder' },
  suggestions: { en: 'Suggestions', dk: 'Forslag' },
  dialogue: { en: 'Dialogue questions', dk: 'Dialog-spørgsmål' },
};

function pick<K extends keyof typeof T>(key: K, lang: Lang): (typeof T)[K] extends { en: infer V } ? V : never {
  return T[key][lang] as never;
}

type ExampleSubmissions = Record<'1' | '2' | '3', string>;

export default function Course5Assessor({
  exampleSubmissions,
}: {
  exampleSubmissions?: ExampleSubmissions;
}) {
  const [lang, setLang] = useState<Lang>('dk');
  const [submissionText, setSubmissionText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Assessment | null>(null);
  const [rubricOpen, setRubricOpen] = useState(false);

  async function handleAssess() {
    if (!submissionText.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/llm/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionText, lang }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? `Request failed (${res.status}).`);
        return;
      }
      setResult(data as Assessment);
    } catch {
      setError(lang === 'dk' ? 'Netværksfejl. Prøv igen.' : 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setSubmissionText('');
    setResult(null);
    setError(null);
  }

  return (
    <section className="py-28 px-6 md:px-24">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/llm"
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
            {pick('back', lang) as string}
          </Link>

          <div role="group" aria-label="Language" className="glass-pill inline-flex p-1 rounded-full gap-1">
            {(['dk', 'en'] as Lang[]).map((code) => {
              const active = lang === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLang(code)}
                  aria-pressed={active}
                  className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wider transition-colors ${
                    active ? 'bg-slate-800 text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {code.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>

        <header className="mb-8">
          <p className="text-slate-400 font-medium tracking-[0.2em] uppercase text-sm mb-3">
            {pick('course', lang) as string}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4 tracking-tight">
            {pick('title', lang) as string}
          </h1>
          <p className="text-slate-500 font-light leading-relaxed max-w-2xl">
            {pick('intro', lang) as string}
          </p>
        </header>

        <div className="mb-6">
          <button
            type="button"
            onClick={() => setRubricOpen((v) => !v)}
            aria-expanded={rubricOpen}
            className="inline-flex items-center gap-2 px-4 py-2 glass-pill rounded-full text-sm font-semibold text-slate-700 hover:text-slate-900 border border-slate-200/50"
          >
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${rubricOpen ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            {rubricOpen ? (pick('rubricToggleClose', lang) as string) : (pick('rubricToggle', lang) as string)}
          </button>

          {rubricOpen && (
            <div className="glass-card p-6 md:p-8 mt-4">
              <h2 className="text-sm font-semibold tracking-[0.2em] uppercase text-slate-400 mb-4">
                {pick('rubricHeading', lang) as string}
              </h2>
              <ol className="flex flex-col gap-5 list-decimal list-inside">
                {RUBRIC.map((c) => (
                  <li key={c.id} className="text-slate-800 font-semibold">
                    {c.name}
                    <p className="font-light text-slate-600 mt-1 mb-2 ml-5">{c.description}</p>
                    <ul className="ml-5 flex flex-col gap-1 text-xs">
                      <li className="text-rose-700/90">
                        <span className="font-bold uppercase tracking-wider">low</span>{' '}
                        <span className="font-light text-slate-600">{c.levels.low}</span>
                      </li>
                      <li className="text-amber-700/90">
                        <span className="font-bold uppercase tracking-wider">mid</span>{' '}
                        <span className="font-light text-slate-600">{c.levels.mid}</span>
                      </li>
                      <li className="text-emerald-700/90">
                        <span className="font-bold uppercase tracking-wider">high</span>{' '}
                        <span className="font-light text-slate-600">{c.levels.high}</span>
                      </li>
                    </ul>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        <div className="glass-card p-6 md:p-8 mb-6">
          {exampleSubmissions && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-slate-500 mr-1">
                {pick('exampleLabel', lang) as string}
              </span>
              {(['1', '2', '3'] as const).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() =>
                    setSubmissionText(exampleSubmissions[n].slice(0, MAX_CHARS))
                  }
                  disabled={loading}
                  className="px-3 py-1.5 glass-pill rounded-full text-xs font-semibold text-slate-700 hover:text-slate-900 border border-slate-200/50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Student {n}
                </button>
              ))}
            </div>
          )}

          <label htmlFor="submission" className="block text-sm font-semibold text-slate-700 mb-3">
            {pick('submissionLabel', lang) as string}
          </label>
          <textarea
            id="submission"
            value={submissionText}
            onChange={(e) => setSubmissionText(e.target.value.slice(0, MAX_CHARS))}
            placeholder={pick('placeholder', lang) as string}
            rows={10}
            disabled={loading}
            maxLength={MAX_CHARS}
            className="w-full px-4 py-3 rounded-xl border border-white/60 bg-white/40 text-slate-800 placeholder-slate-400 font-light leading-relaxed focus:outline-none focus:ring-2 focus:ring-slate-400/50 focus:border-slate-400/50 resize-y min-h-40 disabled:opacity-60"
          />
          <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
            <span>
              {(pick('charCount', lang) as (n: number, max: number) => string)(
                submissionText.length,
                MAX_CHARS,
              )}
            </span>
          </div>

          <div className="flex flex-wrap gap-3 mt-5">
            <button
              type="button"
              onClick={handleAssess}
              disabled={loading || !submissionText.trim()}
              className={`px-6 py-3 rounded-full text-sm font-semibold border min-h-11 transition-all duration-300 ${
                loading || !submissionText.trim()
                  ? 'glass-pill text-slate-400 border-slate-200/50 cursor-not-allowed'
                  : 'bg-slate-800 text-white border-slate-800 hover:bg-slate-900'
              }`}
            >
              {loading ? (pick('assessing', lang) as string) : (pick('assess', lang) as string)}
            </button>
            {(result || error) && !loading && (
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 glass-pill rounded-full text-sm font-semibold text-slate-700 hover:text-slate-900 border border-slate-200/50 min-h-11"
              >
                {pick('clear', lang) as string}
              </button>
            )}
          </div>

          {/* Indeterminate loading bar — visible only while assessing */}
          {loading && (
            <div
              className="mt-5 h-1 w-full bg-slate-200/60 rounded-full overflow-hidden"
              role="progressbar"
              aria-label={pick('assessing', lang) as string}
            >
              <div
                className="h-full w-1/4 rounded-full bg-gradient-to-r from-slate-400 via-slate-700 to-slate-400"
                style={{ animation: 'indeterminateBar 1.4s ease-in-out infinite' }}
              />
            </div>
          )}
        </div>

        {error && (
          <div className="glass-card p-5 md:p-6 mb-6 border border-rose-400/40 bg-rose-50/50">
            <p className="text-rose-700 font-medium text-sm">{error}</p>
          </div>
        )}

        {result && (
          <div className="flex flex-col gap-6">
            <section className="glass-card p-6 md:p-8">
              <h2 className="text-sm font-semibold tracking-[0.2em] uppercase text-slate-400 mb-3">
                {pick('overall', lang) as string}
              </h2>
              <p className="text-slate-700 font-light leading-relaxed">
                {result.overallAssessment}
              </p>
            </section>

            <section className="glass-card p-6 md:p-8">
              <h2 className="text-sm font-semibold tracking-[0.2em] uppercase text-slate-400 mb-4">
                {pick('criteria', lang) as string}
              </h2>
              <div className="flex flex-col gap-3">
                {result.criteria.map((c, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row sm:items-start gap-3 p-4 rounded-xl bg-white/30 border border-white/50"
                  >
                    <div className="flex items-center gap-3 sm:w-64 sm:shrink-0">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${LEVEL_STYLES[c.level]}`}
                      >
                        {c.level}
                      </span>
                      <span className="text-slate-800 font-semibold text-sm">{c.name}</span>
                    </div>
                    <p className="text-slate-600 text-sm font-light leading-relaxed flex-1">
                      {c.comment}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {result.dare_share_care && (
              <section className="glass-card p-6 md:p-8">
                <h2 className="text-sm font-semibold tracking-[0.2em] uppercase text-slate-400 mb-4">
                  {pick('dareShareCare', lang) as string}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(['dare', 'share', 'care'] as const).map((key) => (
                    <div
                      key={key}
                      className="p-4 rounded-xl bg-white/30 border border-white/50"
                    >
                      <p className="text-xs font-bold tracking-[0.2em] uppercase text-slate-500 mb-2">
                        {key}
                      </p>
                      <p className="text-slate-700 text-sm font-light leading-relaxed">
                        {result.dare_share_care[key]}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ListCard title={pick('strengths', lang) as string} items={result.strengths} accent="emerald" />
              <ListCard title={pick('weaknesses', lang) as string} items={result.weaknesses} accent="rose" />
            </div>

            <ListCard title={pick('suggestions', lang) as string} items={result.suggestions} accent="slate" />

            <section className="glass-card p-6 md:p-8">
              <h2 className="text-sm font-semibold tracking-[0.2em] uppercase text-slate-400 mb-4">
                {pick('dialogue', lang) as string}
              </h2>
              <ol className="flex flex-col gap-3 list-decimal list-inside text-slate-700 font-light leading-relaxed">
                {result.dialogueQuestions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ol>
            </section>
          </div>
        )}
      </div>
    </section>
  );
}

function ListCard({
  title,
  items,
  accent,
}: {
  title: string;
  items: string[];
  accent: 'emerald' | 'rose' | 'slate';
}) {
  const dot =
    accent === 'emerald' ? 'bg-emerald-500' : accent === 'rose' ? 'bg-rose-500' : 'bg-slate-500';
  return (
    <section className="glass-card p-6 md:p-8">
      <h2 className="text-sm font-semibold tracking-[0.2em] uppercase text-slate-400 mb-4">
        {title}
      </h2>
      <ul className="flex flex-col gap-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-slate-700">
            <span className={`mt-2 inline-block w-1.5 h-1.5 rounded-full ${dot} shrink-0`} />
            <span className="font-light leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
