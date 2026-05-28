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
  low: 'bg-[oklch(70%_0.18_25_/_0.15)] text-[oklch(82%_0.14_25)] border-[oklch(70%_0.18_25_/_0.4)]',
  mid: 'bg-[oklch(80%_0.13_75_/_0.15)] text-[oklch(86%_0.11_75)] border-[oklch(80%_0.13_75_/_0.4)]',
  high: 'bg-[oklch(72%_0.15_150_/_0.15)] text-[oklch(84%_0.12_150)] border-[oklch(72%_0.15_150_/_0.4)]',
};

const LEVEL_TEXT: Record<Criterion['level'], string> = {
  low: 'oklch(80% 0.14 25)',
  mid: 'oklch(85% 0.12 75)',
  high: 'oklch(82% 0.13 150)',
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
            className="inline-flex items-center gap-2 text-sm font-medium transition-colors text-[color:var(--bone-dim)] hover:text-[color:var(--bone)]"
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

          <div
            role="group"
            aria-label="Language"
            className="inline-flex p-1 rounded-full gap-1 border border-[color:var(--line)]"
            style={{ background: 'oklch(94% 0.022 82 / 0.05)' }}
          >
            {(['dk', 'en'] as Lang[]).map((code) => {
              const active = lang === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLang(code)}
                  aria-pressed={active}
                  className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wider transition-colors ${
                    active ? 'text-[color:var(--bone)]' : 'text-[color:var(--bone-mute)] hover:text-[color:var(--bone)]'
                  }`}
                  style={active ? { background: 'oklch(94% 0.022 82 / 0.14)' } : undefined}
                >
                  {code.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>

        <header className="mb-8">
          <p className="font-mono text-xs tracking-[0.2em] uppercase mb-3 text-[color:var(--bone-mute)]">
            {pick('course', lang) as string}
          </p>
          <h1
            className="font-display text-4xl md:text-5xl mb-4 text-[color:var(--bone)]"
            style={{ letterSpacing: '-0.02em', fontWeight: 420 }}
          >
            {pick('title', lang) as string}
          </h1>
          <p className="font-light leading-relaxed max-w-2xl text-[color:var(--bone-dim)]">
            {pick('intro', lang) as string}
          </p>
        </header>

        <div className="mb-6">
          <button
            type="button"
            onClick={() => setRubricOpen((v) => !v)}
            aria-expanded={rubricOpen}
            className="ink-pill inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-[color:var(--bone-dim)] hover:text-[color:var(--bone)]"
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
            <div className="ink-card p-6 md:p-8 mt-4">
              <h2 className="font-mono text-sm tracking-[0.2em] uppercase mb-4 text-[color:var(--bone-mute)]">
                {pick('rubricHeading', lang) as string}
              </h2>
              <ol className="flex flex-col gap-5 list-decimal list-inside text-[color:var(--bone)] font-semibold">
                {RUBRIC.map((c) => (
                  <li key={c.id}>
                    {c.name}
                    <p className="font-light mt-1 mb-2 ml-5 text-[color:var(--bone-dim)]">{c.description}</p>
                    <ul className="ml-5 flex flex-col gap-1 text-xs">
                      <li style={{ color: LEVEL_TEXT.low }}>
                        <span className="font-bold uppercase tracking-wider">low</span>{' '}
                        <span className="font-light text-[color:var(--bone-dim)]">{c.levels.low}</span>
                      </li>
                      <li style={{ color: LEVEL_TEXT.mid }}>
                        <span className="font-bold uppercase tracking-wider">mid</span>{' '}
                        <span className="font-light text-[color:var(--bone-dim)]">{c.levels.mid}</span>
                      </li>
                      <li style={{ color: LEVEL_TEXT.high }}>
                        <span className="font-bold uppercase tracking-wider">high</span>{' '}
                        <span className="font-light text-[color:var(--bone-dim)]">{c.levels.high}</span>
                      </li>
                    </ul>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        <div className="ink-card p-6 md:p-8 mb-6">
          {exampleSubmissions && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium mr-1 text-[color:var(--bone-dim)]">
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
                  className="ink-pill px-3 py-1.5 rounded-full text-xs font-semibold text-[color:var(--bone-dim)] hover:text-[color:var(--bone)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Student {n}
                </button>
              ))}
            </div>
          )}

          <label htmlFor="submission" className="block text-sm font-semibold mb-3 text-[color:var(--bone-dim)]">
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
            className="w-full px-4 py-3 rounded-xl border font-light leading-relaxed focus:outline-none resize-y min-h-40 disabled:opacity-60 text-[color:var(--bone)] placeholder:[color:var(--bone-mute)] border-[color:var(--line-strong)] focus:border-[color:var(--ember)]"
            style={{ background: 'oklch(94% 0.022 82 / 0.04)' }}
          />
          <div className="flex items-center justify-between mt-3 font-mono text-xs text-[color:var(--bone-mute)]">
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
                  ? 'ink-pill text-[color:var(--bone-mute)] cursor-not-allowed'
                  : 'border-transparent text-[oklch(15%_0.02_40)] hover:brightness-110'
              }`}
              style={loading || !submissionText.trim() ? undefined : { background: 'var(--ember)' }}
            >
              {loading ? (pick('assessing', lang) as string) : (pick('assess', lang) as string)}
            </button>
            {(result || error) && !loading && (
              <button
                type="button"
                onClick={handleReset}
                className="ink-pill px-6 py-3 rounded-full text-sm font-semibold min-h-11 text-[color:var(--bone-dim)] hover:text-[color:var(--bone)]"
              >
                {pick('clear', lang) as string}
              </button>
            )}
          </div>

          {/* Indeterminate loading bar — visible only while assessing */}
          {loading && (
            <div
              className="mt-5 h-1 w-full rounded-full overflow-hidden"
              style={{ background: 'oklch(94% 0.022 82 / 0.08)' }}
              role="progressbar"
              aria-label={pick('assessing', lang) as string}
            >
              <div
                className="h-full w-1/4 rounded-full"
                style={{ background: 'var(--ember)', animation: 'indeterminateBar 1.4s ease-in-out infinite' }}
              />
            </div>
          )}
        </div>

        {error && (
          <div
            className="ink-card p-5 md:p-6 mb-6"
            style={{ borderColor: 'oklch(70% 0.18 25 / 0.45)', background: 'oklch(70% 0.18 25 / 0.10)' }}
          >
            <p className="font-medium text-sm" style={{ color: 'oklch(82% 0.14 25)' }}>{error}</p>
          </div>
        )}

        {result && (
          <div className="flex flex-col gap-6">
            <section className="ink-card p-6 md:p-8">
              <h2 className="font-mono text-sm tracking-[0.2em] uppercase mb-3 text-[color:var(--bone-mute)]">
                {pick('overall', lang) as string}
              </h2>
              <p className="font-light leading-relaxed text-[color:var(--bone-dim)]">
                {result.overallAssessment}
              </p>
            </section>

            <section className="ink-card p-6 md:p-8">
              <h2 className="font-mono text-sm tracking-[0.2em] uppercase mb-4 text-[color:var(--bone-mute)]">
                {pick('criteria', lang) as string}
              </h2>
              <div className="flex flex-col gap-3">
                {result.criteria.map((c, i) => (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row sm:items-start gap-3 p-4 rounded-xl border border-[color:var(--line)]"
                    style={{ background: 'oklch(94% 0.022 82 / 0.04)' }}
                  >
                    <div className="flex items-center gap-3 sm:w-64 sm:shrink-0">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${LEVEL_STYLES[c.level]}`}
                      >
                        {c.level}
                      </span>
                      <span className="font-semibold text-sm text-[color:var(--bone)]">{c.name}</span>
                    </div>
                    <p className="text-sm font-light leading-relaxed flex-1 text-[color:var(--bone-dim)]">
                      {c.comment}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {result.dare_share_care && (
              <section className="ink-card p-6 md:p-8">
                <h2 className="font-mono text-sm tracking-[0.2em] uppercase mb-4 text-[color:var(--bone-mute)]">
                  {pick('dareShareCare', lang) as string}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(['dare', 'share', 'care'] as const).map((key) => (
                    <div
                      key={key}
                      className="p-4 rounded-xl border border-[color:var(--line)]"
                      style={{ background: 'oklch(94% 0.022 82 / 0.04)' }}
                    >
                      <p className="font-mono text-xs font-bold tracking-[0.2em] uppercase mb-2 text-[color:var(--bone-mute)]">
                        {key}
                      </p>
                      <p className="text-sm font-light leading-relaxed text-[color:var(--bone-dim)]">
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

            <ListCard title={pick('suggestions', lang) as string} items={result.suggestions} accent="ember" />

            <section className="ink-card p-6 md:p-8">
              <h2 className="font-mono text-sm tracking-[0.2em] uppercase mb-4 text-[color:var(--bone-mute)]">
                {pick('dialogue', lang) as string}
              </h2>
              <ol className="flex flex-col gap-3 list-decimal list-inside font-light leading-relaxed text-[color:var(--bone-dim)]">
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
  accent: 'emerald' | 'rose' | 'ember';
}) {
  const dot =
    accent === 'emerald' ? 'oklch(72% 0.15 150)' : accent === 'rose' ? 'oklch(70% 0.18 25)' : 'var(--ember)';
  return (
    <section className="ink-card p-6 md:p-8">
      <h2 className="font-mono text-sm tracking-[0.2em] uppercase mb-4 text-[color:var(--bone-mute)]">
        {title}
      </h2>
      <ul className="flex flex-col gap-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3 text-[color:var(--bone-dim)]">
            <span className="mt-2 inline-block w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dot }} />
            <span className="font-light leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
