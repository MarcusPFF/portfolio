import ScrollReveal from './ScrollReveal';

export default function GlassHero() {
  return (
    <section className="min-h-screen flex flex-col justify-center px-6 md:px-24 pt-24">
      <div className="w-full max-w-5xl mx-auto">
        <div className="glass-card p-10 md:p-20">
          <div className="hero-enter">
            <p className="text-slate-400 font-medium tracking-[0.2em] uppercase mb-6 text-sm">
              Developer  ·  Designer  ·  Creator
            </p>
          </div>

          <div className="hero-enter-delay-1">
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-slate-800 tracking-tight leading-[0.9] mb-8">
              Marcus Forsberg
              <span className="gradient-text">.</span>
            </h1>
          </div>

          <div className="hero-enter-delay-2">
            <p className="text-slate-500 max-w-xl text-lg md:text-xl leading-relaxed mb-12 font-light">
              I craft elegant, accessible, and performant web experiences — blurring
              the lines between beautiful design and robust engineering.
            </p>
          </div>

          <div className="hero-enter-delay-3 flex flex-wrap gap-4">
            <a
              href="#projects"
              className="group px-8 py-4 bg-slate-800 text-white rounded-full font-medium shadow-sm hover:shadow-lg hover:bg-slate-700 transition-all duration-300 flex items-center gap-2"
            >
              View My Work
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <a
              href="#contact"
              className="px-8 py-4 glass-pill text-slate-600 rounded-full font-medium"
            >
              Let&apos;s Connect
            </a>
          </div>

          <div className="hero-enter-delay-4 flex items-center gap-6 mt-14 pt-8 border-t border-white/30">
            <div>
              <p className="text-2xl font-bold text-slate-800">3+</p>
              <p className="text-sm text-slate-400">Years Experience</p>
            </div>
            <div className="w-px h-10 bg-slate-200/60"></div>
            <div>
              <p className="text-2xl font-bold text-slate-800">10+</p>
              <p className="text-sm text-slate-400">Projects Built</p>
            </div>
            <div className="w-px h-10 bg-slate-200/60"></div>
            <div>
              <p className="text-2xl font-bold text-slate-800">∞</p>
              <p className="text-sm text-slate-400">White monsters</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
