import Link from 'next/link';
import GlassNav from '@/components/GlassNav';

export const metadata = {
  title: 'Secret · Marcus Forsberg',
  description: 'You found the secret page.',
  robots: { index: false, follow: false },
};

export default function SecretPage() {
  return (
    <>
      <GlassNav />

      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[20%] left-[15%] w-[500px] h-[500px] bg-violet-300/25 rounded-full blur-3xl float-slow" />
        <div className="absolute bottom-[20%] right-[15%] w-[450px] h-[450px] bg-pink-300/20 rounded-full blur-3xl float-medium" />
      </div>

      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20 pb-12">
        <p className="hero-enter text-violet-500 font-semibold tracking-[0.3em] uppercase text-xs mb-8">
          You found it
        </p>

        <h1
          className="hero-enter-delay-1 text-6xl md:text-8xl font-bold text-slate-800 leading-[0.95] mb-12"
          style={{ letterSpacing: '-0.02em' }}
        >
          Hello, curious one<span className="text-violet-500">.</span>
        </h1>

        <p className="hero-enter-delay-2 text-slate-600 text-base md:text-lg font-light max-w-md leading-relaxed mb-12">
          The Konami code does something. So does Cmd-K.
        </p>

        <Link
          href="/"
          className="hero-enter-delay-3 inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors group"
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
    </>
  );
}
