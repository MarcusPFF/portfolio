'use client';

import { useMemo, useState, type CSSProperties } from 'react';
import { course3Quiz, totalQuestions } from '../lib/course3Data';

type Answers = Record<string, string>;

export default function Course3Quiz() {
  const [answers, setAnswers] = useState<Answers>({});
  const [submitted, setSubmitted] = useState(false);

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === totalQuestions;

  const score = useMemo(() => {
    if (!submitted) return 0;
    let correct = 0;
    for (const section of course3Quiz) {
      for (const question of section.questions) {
        const picked = answers[question.id];
        const option = question.options.find((o) => o.id === picked);
        if (option?.correct) correct += 1;
      }
    }
    return correct;
  }, [answers, submitted]);

  function selectAnswer(questionId: string, optionId: string) {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }

  function handleSubmit() {
    if (!allAnswered) return;
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleReset() {
    setAnswers({});
    setSubmitted(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const progressPct = Math.round((answeredCount / totalQuestions) * 100);

  const submitBtnClass = (enabled: boolean) =>
    `rounded-full text-sm font-semibold border min-h-11 transition-all duration-300 ${
      enabled
        ? 'border-transparent text-[oklch(15%_0.02_40)] hover:brightness-110'
        : 'ink-pill text-[color:var(--bone-mute)] cursor-not-allowed'
    }`;

  return (
    <section className="py-28 px-6 md:px-24">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10">
          <p className="eyebrow mb-3 text-[color:var(--bone-mute)]">Course 4</p>
          <h1
            className="font-display text-4xl md:text-5xl mb-4 text-[color:var(--bone)]"
            style={{ letterSpacing: '-0.02em', fontWeight: 420 }}
          >
            Meditations-quiz
          </h1>
          <p className="font-light leading-relaxed max-w-2xl text-[color:var(--bone-dim)]">
            5 sektioner, 29 spørgsmål. Vælg ét svar per spørgsmål. Når alle er besvaret, kan du tjekke
            dine svar.
          </p>
        </header>

        {/* Sticky status / score card */}
        <div className="sticky top-20 z-20 mb-10">
          <div className="ink-card p-5 md:p-6">
            {submitted ? (
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="font-mono tracking-widest uppercase text-[10px] mb-1 text-[color:var(--bone-mute)]">
                    Din score
                  </p>
                  <p className="font-display text-2xl md:text-3xl text-[color:var(--bone)]">
                    {score} / {totalQuestions} rigtige
                  </p>
                </div>
                <button
                  onClick={handleReset}
                  className="ink-pill px-6 py-3 rounded-full text-sm font-semibold min-h-11 text-[color:var(--bone-dim)] hover:text-[color:var(--bone)]"
                >
                  Prøv igen
                </button>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-baseline justify-between mb-2">
                    <p className="text-sm font-medium text-[color:var(--bone-dim)]">
                      {answeredCount} af {totalQuestions} besvaret
                    </p>
                    <p className="font-mono text-xs text-[color:var(--bone-mute)]">{progressPct}%</p>
                  </div>
                  <div className="h-2 w-full rounded-full overflow-hidden border border-[color:var(--line)]" style={{ background: 'oklch(94% 0.022 82 / 0.06)' }}>
                    <div
                      className="h-full transition-all duration-500"
                      style={{ width: `${progressPct}%`, background: 'var(--ember)' }}
                    />
                  </div>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={!allAnswered}
                  className={`px-6 py-3 ${submitBtnClass(allAnswered)}`}
                  style={allAnswered ? { background: 'var(--ember)' } : undefined}
                >
                  Tjek svar
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-14">
          {course3Quiz.map((section) => (
            <div key={section.id}>
              <div className="mb-6">
                <p className="font-mono tracking-widest uppercase text-xs mb-2 text-[color:var(--bone-mute)]">
                  Sektion {section.number}
                </p>
                <h2
                  className="font-display text-2xl md:text-3xl text-[color:var(--bone)]"
                  style={{ letterSpacing: '-0.01em' }}
                >
                  {section.title}
                </h2>
                <div className="mt-4 h-px bg-gradient-to-r from-[color:var(--line-strong)] to-transparent" />
              </div>

              <div className="flex flex-col gap-6">
                {section.questions.map((question) => {
                  const picked = answers[question.id];
                  const pickedOption = question.options.find((o) => o.id === picked);
                  const isCorrect = submitted && pickedOption?.correct === true;
                  const isWrong = submitted && pickedOption !== undefined && !pickedOption.correct;

                  return (
                    <div key={question.id} className="ink-card p-6 md:p-7">
                      <div className="flex items-start gap-3 mb-4">
                        <span className="shrink-0 font-mono text-sm tracking-wider mt-0.5 text-[color:var(--bone-mute)]">
                          #{question.number}
                        </span>
                        <p className="text-base md:text-lg font-medium leading-relaxed text-[color:var(--bone)]">
                          {question.prompt}
                        </p>
                        {submitted && (
                          <span
                            className="shrink-0 ml-auto inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border"
                            style={
                              isCorrect
                                ? { background: 'oklch(72% 0.15 150 / 0.18)', color: 'oklch(84% 0.13 150)', borderColor: 'oklch(72% 0.15 150 / 0.45)' }
                                : { background: 'oklch(70% 0.18 25 / 0.18)', color: 'oklch(82% 0.15 25)', borderColor: 'oklch(70% 0.18 25 / 0.45)' }
                            }
                            aria-label={isCorrect ? 'Rigtigt' : 'Forkert'}
                          >
                            {isCorrect ? '✓' : '✗'}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        {question.options.map((option) => {
                          const selected = picked === option.id;
                          let optionStyle: CSSProperties = {
                            background: 'oklch(94% 0.022 82 / 0.04)',
                            borderColor: 'var(--line)',
                            color: 'var(--bone-dim)',
                          };

                          if (submitted) {
                            if (option.correct) {
                              optionStyle = {
                                background: 'oklch(72% 0.15 150 / 0.12)',
                                borderColor: 'oklch(72% 0.15 150 / 0.5)',
                                color: 'oklch(88% 0.08 150)',
                              };
                            } else if (selected && !option.correct) {
                              optionStyle = {
                                background: 'oklch(70% 0.18 25 / 0.12)',
                                borderColor: 'oklch(70% 0.18 25 / 0.5)',
                                color: 'oklch(86% 0.10 25)',
                              };
                            } else {
                              optionStyle = {
                                background: 'oklch(94% 0.022 82 / 0.03)',
                                borderColor: 'var(--line)',
                                color: 'var(--bone-mute)',
                              };
                            }
                          } else if (selected) {
                            optionStyle = {
                              background: 'oklch(72% 0.165 38 / 0.14)',
                              borderColor: 'var(--ember)',
                              color: 'var(--bone)',
                            };
                          }

                          return (
                            <label
                              key={option.id}
                              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 min-h-11 ${
                                submitted ? 'cursor-default' : 'cursor-pointer hover:brightness-110'
                              }`}
                              style={optionStyle}
                            >
                              <input
                                type="radio"
                                name={question.id}
                                value={option.id}
                                checked={selected}
                                onChange={() => selectAnswer(question.id, option.id)}
                                disabled={submitted}
                                className="w-4 h-4 accent-[#dc8a4a] shrink-0"
                              />
                              <span className="text-sm md:text-base font-medium flex-1">
                                {option.label}
                              </span>
                              {submitted && option.correct && (
                                <span className="text-xs font-semibold shrink-0" style={{ color: 'oklch(80% 0.13 150)' }}>
                                  Korrekt svar
                                </span>
                              )}
                            </label>
                          );
                        })}
                      </div>

                      {isWrong && (
                        <p className="mt-3 text-xs font-medium" style={{ color: 'oklch(80% 0.13 25)' }}>
                          Dit svar var forkert. Det rigtige svar er markeret ovenfor.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom actions — mirrors the sticky header for long pages */}
        <div className="mt-14 flex justify-center">
          {submitted ? (
            <button
              onClick={handleReset}
              className="ink-pill px-8 py-3 rounded-full text-sm font-semibold min-h-11 text-[color:var(--bone-dim)] hover:text-[color:var(--bone)]"
            >
              Prøv igen
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!allAnswered}
              className={`px-8 py-3 ${submitBtnClass(allAnswered)}`}
              style={allAnswered ? { background: 'var(--ember)' } : undefined}
            >
              {allAnswered ? 'Tjek svar' : `Besvar alle spørgsmål (${totalQuestions - answeredCount} tilbage)`}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
