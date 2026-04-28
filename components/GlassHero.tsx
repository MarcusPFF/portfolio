import TypewriterRoles from './TypewriterRoles';
import HeroQA from './HeroQA';

export default function GlassHero() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 md:px-12 lg:px-24 pt-20 pb-6">
      <div className="w-full max-w-3xl mx-auto">
        <div className="hero-enter">
          <p className="font-semibold tracking-[0.2em] uppercase mb-6 text-xs flex items-center justify-center gap-2">
            <span className="gradient-text">I&apos;m</span>
            <span className="text-slate-500">
              <TypewriterRoles />
            </span>
          </p>
        </div>

        <div className="hero-enter-delay-1">
          <h1
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-slate-800 leading-[1] mb-12"
            style={{ letterSpacing: '-0.025em' }}
          >
            Marcus Forsberg<span className="text-violet-500">.</span>
          </h1>
        </div>

        <div className="hero-enter-delay-2">
          <HeroQA />
        </div>
      </div>

      <div className="hero-enter-delay-4 mt-14 flex justify-center">
        <a
          href="#projects"
          aria-label="Scroll to projects"
          className="group inline-flex flex-col items-center gap-2 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] font-medium">
            Scroll
          </span>
          <svg
            className="w-4 h-4 animate-bounce"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </a>
      </div>
    </section>
  );
}
