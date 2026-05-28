import Link from 'next/link';
import GlassNav from '@/components/GlassNav';

export const metadata = {
  title: 'Secret · Marcus Forsberg',
  description: 'You found the secret page.',
  robots: { index: false, follow: false },
};

export default function SecretPage() {
  return (
    <div className="theme-night">
      <GlassNav night />

      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div
          className="absolute top-[18%] -left-[4%] w-[500px] h-[500px] rounded-full blur-3xl float-slow"
          style={{ background: 'oklch(48% 0.010 280 / 0.20)' }}
        />
        <div
          className="absolute bottom-[16%] -right-[4%] w-[460px] h-[460px] rounded-full blur-3xl float-medium"
          style={{ background: 'oklch(60% 0.13 40 / 0.12)' }}
        />
      </div>

      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20 pb-12">
        <p className="hero-enter font-mono text-[12px] tracking-[0.04em] mb-8 text-[color:var(--bone-mute)]">
          You found it
        </p>

        <h1
          className="hero-enter-delay-1 font-display text-6xl md:text-8xl leading-[0.95] mb-12 text-[color:var(--bone)]"
          style={{ fontWeight: 400, letterSpacing: '-0.02em' }}
        >
          Hello, curious one
          <span aria-hidden="true" className="text-[color:var(--accent)]">.</span>
        </h1>

        <p className="hero-enter-delay-2 text-base md:text-lg font-light max-w-md leading-relaxed mb-12 text-[color:var(--bone-dim)]">
          The Konami code does something. So does Cmd-K.
        </p>

        <Link
          href="/"
          className="hero-enter-delay-3 inline-flex items-center gap-2 text-sm transition-colors group text-[color:var(--bone-dim)] hover:text-[color:var(--bone)]"
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
          Back to surface
        </Link>
      </main>
    </div>
  );
}
