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
    <main className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20 pb-12">
      <p className="text-slate-500 font-semibold tracking-[0.25em] uppercase text-xs mb-6">
        500 · Something broke
      </p>
      <h1
        className="text-6xl md:text-8xl font-bold text-slate-800 leading-[0.95] mb-8"
        style={{ letterSpacing: '-0.02em' }}
      >
        Mechanical failure<span className="text-violet-500">.</span>
      </h1>
      <p className="text-slate-500 max-w-md text-base md:text-lg leading-relaxed mb-10 font-light">
        Something went sideways on the server. Try reloading — usually fixes it.
      </p>

      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-slate-800 text-white text-sm rounded-full font-medium shadow-sm hover:shadow-lg hover:bg-slate-700 active:scale-[0.97] transition-all duration-300"
        >
          Try again
        </button>
        <Link
          href="/"
          className="px-6 py-3 glass-pill text-sm text-slate-600 rounded-full font-medium inline-flex items-center"
        >
          Home
        </Link>
      </div>

      {error.digest && (
        <p className="mt-10 text-[10px] uppercase tracking-[0.25em] text-slate-400 font-mono">
          ref · {error.digest}
        </p>
      )}
    </main>
  );
}
