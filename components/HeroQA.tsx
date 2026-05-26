'use client';

import { useRef, useState, type FormEvent, type ChangeEvent } from 'react';

export default function HeroQA() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = input.trim();
    if (!q || isLoading) return;

    setResponse('');
    setError('');
    setIsLoading(true);
    setIsAnswered(false);
    // Keep input value so the user sees what they asked.

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: q }] }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Something went wrong.');
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          assistantContent += decoder.decode(value, { stream: true });
          setResponse(assistantContent);
        }
      }
      setIsAnswered(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (isAnswered) setIsAnswered(false);
  };

  const handleFocus = () => {
    // Clicking/focusing the input after a previous answer wipes the
    // faded question so the user gets a fresh field to type into.
    if (isAnswered) {
      setInput('');
      setIsAnswered(false);
    }
  };

  const hasOutput = !!response || isLoading || !!error;

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative">
        <label htmlFor="hero-qa-input" className="sr-only">
          Ask Marcus anything
        </label>
        <input
          id="hero-qa-input"
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleChange}
          onFocus={handleFocus}
          placeholder="Ask me anything"
          autoComplete="off"
          disabled={isLoading}
          style={{
            background: 'oklch(20.5% 0.028 280 / 0.55)',
            borderColor: 'var(--line-strong)',
            color: isAnswered ? 'var(--bone-mute)' : 'var(--bone)',
          }}
          className={`w-full pl-5 pr-14 py-3.5 rounded-full border backdrop-blur text-base outline-none focus:border-[color:var(--ember)] transition-colors shadow-sm disabled:opacity-70 placeholder:[color:var(--bone-mute)] ${
            isAnswered ? 'italic' : ''
          }`}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          aria-label="Send question"
          style={{
            background: !input.trim() || isLoading
              ? 'oklch(94% 0.022 82 / 0.10)'
              : 'var(--ember)',
            color: !input.trim() || isLoading ? 'var(--bone-mute)' : 'oklch(12% 0.02 30)',
          }}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center hover:brightness-110 disabled:cursor-not-allowed active:scale-[0.94] transition-[transform,background-color,filter] duration-200 ease-out"
        >
          {isLoading ? (
            <span
              className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"
              aria-hidden="true"
            />
          ) : (
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 12h14M13 6l6 6-6 6"
              />
            </svg>
          )}
        </button>
      </form>

      {hasOutput && (
        <div className="mt-10 text-left">
          {isLoading && !response && (
            <span
              className="inline-flex items-center gap-2"
              aria-label="Thinking"
            >
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: 'var(--bone-mute)', animationDelay: '0ms' }}
              />
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: 'var(--bone-mute)', animationDelay: '200ms' }}
              />
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: 'var(--bone-mute)', animationDelay: '400ms' }}
              />
            </span>
          )}

          {response && (
            <p
              className="text-base md:text-lg font-light leading-[1.7] whitespace-pre-wrap"
              style={{ color: 'var(--bone)' }}
            >
              {response}
            </p>
          )}

          {error && (
            <p
              className="text-sm"
              style={{ color: 'oklch(70% 0.18 25)' }}
            >
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
