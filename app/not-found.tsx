import Link from 'next/link';
import GlassNav from '@/components/GlassNav';

export const metadata = {
  title: '404 · Wrong turn | Marcus Forsberg',
  description: 'Page not found.',
};

export default function NotFound() {
  return (
    <>
      <GlassNav />

      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-[400px] h-[400px] bg-purple-300/20 rounded-full blur-3xl float-slow" />
        <div className="absolute top-[60%] right-[10%] w-[350px] h-[350px] bg-pink-300/20 rounded-full blur-3xl float-medium" />
        <div className="absolute top-[30%] right-[30%] w-[300px] h-[300px] bg-blue-300/15 rounded-full blur-3xl float-fast" />
        <div className="absolute bottom-[10%] left-[20%] w-[250px] h-[250px] bg-orange-200/15 rounded-full blur-3xl float-slow" />
      </div>

      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20 pb-12">
        <p className="hero-enter text-slate-500 font-semibold tracking-[0.25em] uppercase text-xs mb-6">
          404 · Wrong turn
        </p>
        <h1
          className="hero-enter-delay-1 text-6xl md:text-8xl font-bold text-slate-800 leading-[0.95] mb-8"
          style={{ letterSpacing: '-0.02em' }}
        >
          Off the map<span className="text-violet-500">.</span>
        </h1>
        <p className="hero-enter-delay-2 text-slate-500 max-w-md text-base md:text-lg leading-relaxed mb-10 font-light">
          That page either doesn&apos;t exist or rode off without me. Pick a route below.
        </p>

        <div className="hero-enter-delay-3 flex justify-center">
          <Link
            href="/"
            className="group px-6 py-3 bg-slate-800 text-white text-sm rounded-full font-medium shadow-sm hover:shadow-lg hover:bg-slate-700 active:scale-[0.97] transition-all duration-300 inline-flex items-center gap-2"
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
    </>
  );
}
