import TypewriterRoles from "./TypewriterRoles";

export default function GlassHero() {
  return (
    <section className="min-h-screen flex flex-col justify-center px-6 md:px-24 pt-20 pb-6 relative">
      <div className="w-full max-w-4xl mx-auto">
        <div className="glass-card p-8 md:p-14">
          <div className="hero-enter">
            <p className="font-semibold tracking-[0.2em] uppercase mb-5 text-xs flex items-center gap-2">
              <span className="gradient-text">I&apos;m</span>
              <span className="text-slate-500"><TypewriterRoles /></span>
            </p>
          </div>

          <div className="hero-enter-delay-1">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-slate-800 tracking-tight leading-[0.9] mb-6">
              Marcus Forsberg
              <span className="gradient-text">.</span>
            </h1>
          </div>

          <div className="hero-enter-delay-2">
            <p className="text-slate-500 max-w-lg text-base md:text-lg leading-relaxed mb-9 font-light">
              Welcome to my personal site. Here you will find projects, my
              motorcycle trips and information about me.
            </p>
          </div>

          <div className="hero-enter-delay-3 flex flex-wrap gap-3">
            <a
              href="#projects"
              className="group px-6 py-3 bg-slate-800 text-white text-sm rounded-full font-medium shadow-sm hover:shadow-lg hover:bg-slate-700 transition-all duration-300 inline-flex items-center gap-2"
            >
              View My Work
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
            </a>
            <a
              href="#contact"
              className="px-6 py-3 glass-pill text-sm text-slate-600 rounded-full font-medium inline-flex items-center"
            >
              Let&apos;s Connect
            </a>
          </div>

          <div className="hero-enter-delay-4 flex items-center gap-5 mt-10 pt-6 border-t border-white/30">
            <div>
              <p className="text-xl font-bold text-slate-800">3+</p>
              <p className="text-xs text-slate-400">Years Experience</p>
            </div>
            <div className="w-px h-8 bg-slate-200/60" />
            <div>
              <p className="text-xl font-bold text-slate-800">10+</p>
              <p className="text-xs text-slate-400">Projects Built</p>
            </div>
            <div className="w-px h-8 bg-slate-200/60" />
            <div>
              <p className="text-xl font-bold text-slate-800">∞</p>
              <p className="text-xs text-slate-400">White monsters</p>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-enter-delay-4 mt-8 flex justify-center">
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
