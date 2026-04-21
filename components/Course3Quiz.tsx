'use client';

import { useMemo, useState } from 'react';
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

  return (
    <section className="py-28 px-6 md:px-24">
      <div className="max-w-3xl mx-auto">
        <header className="mb-10">
          <p className="text-slate-400 font-medium tracking-[0.2em] uppercase text-sm mb-3">
            Course 3
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4 tracking-tight">
            Meditations-quiz
          </h1>
          <p className="text-slate-500 font-light leading-relaxed max-w-2xl">
            5 sektioner, 29 spørgsmål. Vælg ét svar per spørgsmål. Når alle er besvaret, kan du tjekke
            dine svar.
          </p>
        </header>

        {/* Sticky status / score card */}
        <div className="sticky top-20 z-20 mb-10">
          <div className="glass-card p-5 md:p-6">
            {submitted ? (
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-slate-400 font-medium tracking-widest uppercase text-xs mb-1">
                    Din score
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-slate-800">
                    {score} / {totalQuestions} rigtige
                  </p>
                </div>
                <button
                  onClick={handleReset}
                  className="px-6 py-3 glass-pill rounded-full text-sm font-semibold text-slate-700 hover:text-slate-900 border border-slate-200/50 min-h-11"
                >
                  Prøv igen
                </button>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-baseline justify-between mb-2">
                    <p className="text-slate-600 text-sm font-medium">
                      {answeredCount} af {totalQuestions} besvaret
                    </p>
                    <p className="text-slate-400 text-xs font-medium">{progressPct}%</p>
                  </div>
                  <div className="h-2 w-full bg-white/50 rounded-full overflow-hidden border border-white/60">
                    <div
                      className="h-full bg-gradient-to-r from-purple-400/70 to-pink-400/70 transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={!allAnswered}
                  className={`px-6 py-3 rounded-full text-sm font-semibold border min-h-11 transition-all duration-300 ${
                    allAnswered
                      ? 'bg-slate-800 text-white border-slate-800 hover:bg-slate-900'
                      : 'glass-pill text-slate-400 border-slate-200/50 cursor-not-allowed'
                  }`}
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
                <p className="text-slate-400 font-medium tracking-widest uppercase text-xs mb-2">
                  Sektion {section.number}
                </p>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
                  {section.title}
                </h2>
                <div className="mt-4 h-px bg-gradient-to-r from-slate-300/70 via-slate-200/50 to-transparent" />
              </div>

              <div className="flex flex-col gap-6">
                {section.questions.map((question) => {
                  const picked = answers[question.id];
                  const pickedOption = question.options.find((o) => o.id === picked);
                  const isCorrect = submitted && pickedOption?.correct === true;
                  const isWrong = submitted && pickedOption !== undefined && !pickedOption.correct;

                  return (
                    <div key={question.id} className="glass-card p-6 md:p-7">
                      <div className="flex items-start gap-3 mb-4">
                        <span className="shrink-0 text-sm font-semibold text-slate-400 tracking-wider mt-0.5">
                          #{question.number}
                        </span>
                        <p className="text-base md:text-lg text-slate-800 font-medium leading-relaxed">
                          {question.prompt}
                        </p>
                        {submitted && (
                          <span
                            className={`shrink-0 ml-auto inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                              isCorrect
                                ? 'bg-emerald-500/20 text-emerald-700'
                                : 'bg-rose-500/20 text-rose-700'
                            }`}
                            aria-label={isCorrect ? 'Rigtigt' : 'Forkert'}
                          >
                            {isCorrect ? '✓' : '✗'}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        {question.options.map((option) => {
                          const selected = picked === option.id;
                          let optionClass =
                            'border-white/60 bg-white/40 hover:bg-white/70 text-slate-700';

                          if (submitted) {
                            if (option.correct) {
                              optionClass =
                                'border-emerald-400/70 bg-emerald-400/15 text-emerald-900';
                            } else if (selected && !option.correct) {
                              optionClass = 'border-rose-400/70 bg-rose-400/15 text-rose-900';
                            } else {
                              optionClass = 'border-white/40 bg-white/20 text-slate-500';
                            }
                          } else if (selected) {
                            optionClass =
                              'border-slate-800/60 bg-white/80 text-slate-900 shadow-sm';
                          }

                          return (
                            <label
                              key={option.id}
                              className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-200 min-h-11 ${optionClass} ${
                                submitted ? 'cursor-default' : ''
                              }`}
                            >
                              <input
                                type="radio"
                                name={question.id}
                                value={option.id}
                                checked={selected}
                                onChange={() => selectAnswer(question.id, option.id)}
                                disabled={submitted}
                                className="w-4 h-4 accent-slate-800 shrink-0"
                              />
                              <span className="text-sm md:text-base font-medium flex-1">
                                {option.label}
                              </span>
                              {submitted && option.correct && (
                                <span className="text-xs font-semibold text-emerald-700 shrink-0">
                                  Korrekt svar
                                </span>
                              )}
                            </label>
                          );
                        })}
                      </div>

                      {isWrong && (
                        <p className="mt-3 text-xs text-rose-700/80 font-medium">
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
              className="px-8 py-3 glass-pill rounded-full text-sm font-semibold text-slate-700 hover:text-slate-900 border border-slate-200/50 min-h-11"
            >
              Prøv igen
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!allAnswered}
              className={`px-8 py-3 rounded-full text-sm font-semibold border min-h-11 transition-all duration-300 ${
                allAnswered
                  ? 'bg-slate-800 text-white border-slate-800 hover:bg-slate-900'
                  : 'glass-pill text-slate-400 border-slate-200/50 cursor-not-allowed'
              }`}
            >
              {allAnswered ? 'Tjek svar' : `Besvar alle spørgsmål (${totalQuestions - answeredCount} tilbage)`}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
