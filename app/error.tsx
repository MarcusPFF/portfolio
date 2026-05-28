'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[App error]', error);
  }, [error]);

  return (
    <div className="theme-night">
      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20 pb-12">
        <p className="font-mono text-[12px] tracking-[0.04em] mb-6 text-[color:var(--bone-mute)]">
          500 · Something broke
        </p>
        <h1
          className="font-display text-6xl md:text-8xl leading-[0.95] mb-8 text-[color:var(--bone)]"
          style={{ fontWeight: 400, letterSpacing: '-0.02em' }}
        >
          Mechanical failure
          <span aria-hidden="true" className="text-[color:var(--accent)]">.</span>
        </h1>
        <p className="max-w-md text-base md:text-lg leading-relaxed mb-10 font-light text-[color:var(--bone-dim)]">
          Something went sideways on the server. Try reloading — usually fixes it.
        </p>

        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="ink-pill px-6 py-3 text-sm rounded-full font-medium active:scale-[0.97] text-[color:var(--bone)]"
          >
            Try again
          </button>
          <Link
            href="/"
            className="ink-pill px-6 py-3 text-sm rounded-full font-medium inline-flex items-center text-[color:var(--bone-dim)] hover:text-[color:var(--bone)]"
          >
            Home
          </Link>
        </div>

        {error.digest && (
          <p className="mt-10 font-mono text-[10px] tracking-[0.2em] text-[color:var(--bone-mute)]">
            ref · {error.digest}
          </p>
        )}
      </main>
    </div>
  );
}
