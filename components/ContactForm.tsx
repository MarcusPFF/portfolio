'use client';

import { useRef, useState, type FormEvent, type MouseEvent } from 'react';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';

type Status = 'idle' | 'sending' | 'success' | 'error';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_QUESTION = 10;
const MAX_QUESTION = 2000;

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';

export default function ContactForm() {
  const [email, setEmail] = useState('');
  const [question, setQuestion] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [turnstileToken, setTurnstileToken] = useState('');
  const honeypotRef = useRef<HTMLInputElement>(null);
  const mountedAtRef = useRef<number>(Date.now());
  const turnstileRef = useRef<TurnstileInstance | null>(null);
  const submitBtnRef = useRef<HTMLButtonElement>(null);

  // Magnetic pull on the submit button — very subtle, almost imperceptible.
  // Translate is driven via CSS custom properties so the `:active` scale
  // utility can compose with it instead of being overridden by inline transform.
  const onSubmitMove = (e: MouseEvent<HTMLButtonElement>) => {
    const el = submitBtnRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const factor = 0.08;
    const max = 3;
    const rawX = (e.clientX - rect.left - rect.width / 2) * factor;
    const rawY = (e.clientY - rect.top - rect.height / 2) * factor;
    const x = Math.max(-max, Math.min(max, rawX));
    const y = Math.max(-max, Math.min(max, rawY));
    el.style.setProperty('--mx', `${x}px`);
    el.style.setProperty('--my', `${y}px`);
  };
  const onSubmitLeave = () => {
    const el = submitBtnRef.current;
    if (!el) return;
    el.style.setProperty('--mx', '0px');
    el.style.setProperty('--my', '0px');
  };

  const emailValid = EMAIL_RE.test(email.trim());
  const questionLen = question.trim().length;
  const questionValid = questionLen >= MIN_QUESTION && question.length <= MAX_QUESTION;
  const turnstileReady = !TURNSTILE_SITE_KEY || turnstileToken.length > 0;
  const canSubmit = emailValid && questionValid && turnstileReady && status !== 'sending';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus('sending');
    setErrorMsg('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          question: question.trim(),
          website: honeypotRef.current?.value ?? '',
          elapsed: Date.now() - mountedAtRef.current,
          turnstileToken,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Could not send message');
      }
      setStatus('success');
      setEmail('');
      setQuestion('');
      setTurnstileToken('');
      turnstileRef.current?.reset();
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
      turnstileRef.current?.reset();
      setTurnstileToken('');
    }
  }

  if (status === 'success') {
    return (
      <div
        className="rounded-2xl p-8 text-center backdrop-blur-sm"
        style={{
          background: 'oklch(20.5% 0.028 280 / 0.55)',
          border: '1px solid var(--line-strong)',
        }}
      >
        <div
          className="w-11 h-11 mx-auto rounded-full flex items-center justify-center mb-3"
          style={{ background: 'oklch(72% 0.165 38 / 0.15)' }}
        >
          <svg
            className="w-5 h-5"
            style={{ color: 'var(--ember)' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3
          className="font-display text-xl mb-1"
          style={{ color: 'var(--bone)', fontWeight: 400 }}
        >
          Message sent
        </h3>
        <p className="text-xs font-light mb-4" style={{ color: 'var(--bone-dim)' }}>
          I&apos;ll get back to you when I get a moment.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="text-[11px] underline underline-offset-4 transition-colors hover:[color:var(--ember)]"
          style={{ color: 'var(--bone-mute)' }}
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="text-left"
      noValidate
    >
      {/* Honeypot — invisible to humans */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '-9999px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
      >
        <label>
          Website
          <input
            ref={honeypotRef}
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            defaultValue=""
          />
        </label>
      </div>

      <div className="space-y-4">
        <label className="block">
          <span
            className="block text-xs font-semibold mb-1.5"
            style={{ color: 'var(--bone-dim)' }}
          >
            Your Email{' '}
            <span style={{ color: 'var(--accent)' }} aria-hidden="true">
              *
            </span>
          </span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{
              background: 'oklch(15.5% 0.020 280 / 0.55)',
              borderColor: 'var(--line-strong)',
              color: 'var(--bone)',
            }}
            className="w-full px-4 py-2.5 rounded-xl border focus:border-[color:var(--ember)] text-sm outline-none transition-colors placeholder:[color:var(--bone-mute)]"
          />
          <span
            className="block text-[11px] mt-1.5 font-light"
            style={{ color: 'var(--bone-mute)' }}
          >
            I&apos;ll only use this to reply.
          </span>
        </label>

        <label className="block">
          <span
            className="flex items-center justify-between text-xs font-semibold mb-1.5"
            style={{ color: 'var(--bone-dim)' }}
          >
            <span>
              Your Question{' '}
              <span style={{ color: 'var(--ember)' }} aria-hidden="true">
                *
              </span>
            </span>
            <span
              className="font-mono text-[10px] font-normal"
              style={{
                color:
                  question.length > MAX_QUESTION
                    ? 'oklch(70% 0.18 25)'
                    : 'var(--bone-mute)',
              }}
            >
              {question.length}/{MAX_QUESTION}
            </span>
          </span>
          <textarea
            required
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={4}
            placeholder="What would you like to know?"
            style={{
              background: 'oklch(15.5% 0.020 280 / 0.55)',
              borderColor: 'var(--line-strong)',
              color: 'var(--bone)',
            }}
            className="w-full px-4 py-2.5 rounded-xl border focus:border-[color:var(--ember)] text-sm outline-none transition-colors resize-y min-h-[7rem] placeholder:[color:var(--bone-mute)]"
          />
          <span
            className="block text-[11px] mt-1.5 font-light"
            style={{ color: 'var(--bone-mute)' }}
          >
            {questionLen === 0
              ? `Minimum ${MIN_QUESTION} characters.`
              : questionLen < MIN_QUESTION
                ? `${MIN_QUESTION - questionLen} more characters to go.`
                : 'Looks good.'}
          </span>
        </label>
      </div>

      {TURNSTILE_SITE_KEY && (
        <div className="mt-5 flex justify-center">
          <Turnstile
            ref={turnstileRef}
            siteKey={TURNSTILE_SITE_KEY}
            onSuccess={(token) => setTurnstileToken(token)}
            onError={() => setTurnstileToken('')}
            onExpire={() => setTurnstileToken('')}
            options={{ theme: 'dark', appearance: 'interaction-only' }}
          />
        </div>
      )}

      {status === 'error' && (
        <p
          className="mt-4 text-xs font-medium"
          style={{ color: 'oklch(70% 0.18 25)' }}
        >
          {errorMsg}
        </p>
      )}

      <div className="mt-6 flex justify-end">
        <button
          ref={submitBtnRef}
          type="submit"
          disabled={!canSubmit}
          onMouseMove={onSubmitMove}
          onMouseLeave={onSubmitLeave}
          style={{
            transform:
              'translate3d(var(--mx, 0px), var(--my, 0px), 0) scale(var(--press, 1))',
            background: canSubmit
              ? 'var(--ember)'
              : 'oklch(94% 0.022 82 / 0.08)',
            color: canSubmit ? 'oklch(12% 0.02 30)' : 'var(--bone-mute)',
            boxShadow: canSubmit
              ? '0 6px 20px -8px oklch(72% 0.165 38 / 0.7)'
              : 'none',
          }}
          onMouseDown={(e) => e.currentTarget.style.setProperty('--press', '0.97')}
          onMouseUp={(e) => e.currentTarget.style.setProperty('--press', '1')}
          className="group inline-flex items-center gap-2 px-5 py-2.5 text-sm rounded-full font-semibold hover:brightness-110 disabled:cursor-not-allowed transition-[transform,background-color,box-shadow,filter] duration-150 ease-out will-change-transform"
        >
          {status === 'sending' ? (
            <>
              <span
                className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"
                aria-hidden="true"
              />
              Sending
            </>
          ) : (
            <>
              Send Message
              <svg
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
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
            </>
          )}
        </button>
      </div>
    </form>
  );
}
