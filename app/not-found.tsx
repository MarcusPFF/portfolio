import Link from 'next/link';
import GlassNav from '@/components/GlassNav';

export const metadata = {
  title: '404 · Wrong turn | Marcus Forsberg',
  description: 'Page not found.',
};

export default function NotFound() {
  return (
    <div className="theme-night">
      <GlassNav night />

      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div
          className="absolute top-[12%] -left-[6%] w-[520px] h-[520px] rounded-full blur-3xl float-slow"
          style={{ background: 'oklch(48% 0.008 280 / 0.22)' }}
        />
        <div
          className="absolute bottom-[4%] -right-[6%] w-[460px] h-[460px] rounded-full blur-3xl float-medium"
          style={{ background: 'oklch(42% 0.12 280 / 0.18)' }}
        />
      </div>

      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20 pb-12">
        <p className="hero-enter font-mono text-[12px] tracking-[0.04em] mb-6 text-[color:var(--bone-mute)]">
          404 · Wrong turn
        </p>
        <h1
          className="hero-enter-delay-1 font-display text-6xl md:text-8xl leading-[0.95] mb-8 text-[color:var(--bone)]"
          style={{ fontWeight: 400, letterSpacing: '-0.02em' }}
        >
          Off the map
          <span aria-hidden="true" className="text-[color:var(--accent)]">.</span>
        </h1>
        <p className="hero-enter-delay-2 max-w-md text-base md:text-lg leading-relaxed mb-10 font-light text-[color:var(--bone-dim)]">
          That page either doesn&apos;t exist or rode off without me. Pick a route below.
        </p>

        <div className="hero-enter-delay-3 flex justify-center">
          <Link
            href="/"
            className="group ink-pill px-6 py-3 text-sm rounded-full font-medium inline-flex items-center gap-2 text-[color:var(--bone)]"
          >
            <svg
              className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Return home
          </Link>
        </div>
      </main>
    </div>
  );
}
