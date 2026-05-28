import HeroQA from './HeroQA';
import TypewriterRoles from './TypewriterRoles';
import GithubCard from './GithubCard';

export default function GlassHero() {
  return (
    <section
      className="container-grid pt-28 sm:pt-32 lg:pt-36"
      style={{ paddingBottom: 'var(--section-py)' }}
    >
      <div className="grid grid-cols-12 gap-x-6 lg:gap-x-10 gap-y-12 lg:items-start">
        <div className="col-span-12 lg:col-span-8 lg:pt-1">
          <p
            className="hero-enter font-mono text-[12px] tracking-[0.02em] mb-5 inline-flex items-baseline"
            style={{ color: 'var(--bone)' }}
          >
            <span className="mr-1.5">I&apos;m</span>
            <TypewriterRoles />
          </p>

          <h1
            className="hero-enter-delay-1 font-display leading-[0.92] text-left mb-10"
            style={{
              color: 'var(--bone)',
              fontWeight: 350,
              fontSize: 'clamp(2.5rem, 7.5vw, 6.25rem)',
              fontVariationSettings: '"opsz" 144, "SOFT" 100',
              letterSpacing: '-0.035em',
            }}
          >
            Marcus Forsberg
            <span aria-hidden="true" style={{ color: 'var(--accent)' }}>
              .
            </span>
          </h1>

          <div
            className="hero-enter-delay-3 max-w-lg space-y-4 font-light leading-[1.6]"
            style={{ color: 'var(--bone-dim)', fontSize: 'var(--body-lg)' }}
          >
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
              do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>

          <div className="hero-enter-delay-3 mt-8 max-w-md">
            <p
              className="eyebrow mb-2"
              style={{ color: 'var(--bone-mute)' }}
            >
              Ask my AI clone
            </p>
            <HeroQA />
          </div>
        </div>

        <div className="hero-enter-delay-2 col-span-12 lg:col-span-4 lg:pt-0">
          <GithubCard user="MarcusPFF" />
        </div>
      </div>
    </section>
  );
}
