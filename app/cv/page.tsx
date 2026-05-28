import GlassNav from '@/components/GlassNav';
import { personalDetails, skillGroups, projects, classes } from '@/lib/data';
import { trips } from '@/lib/trips';

export const metadata = {
  title: 'CV · Marcus Forsberg',
  description: 'Print-friendly CV for Marcus Forsberg.',
};

const totalKm = trips.reduce((s, t) => s + t.distanceKm, 0);
const visibleProjects = projects.filter((p) => !p.hidden);
const visibleClasses = classes.filter((c) => !c.hidden);

// Screen = dark editorial theme. Print = clean light paper: redefine the
// theme-night tokens to dark-on-white on the CV doc so text stays legible
// even when a PDF pipeline strips backgrounds, force white surfaces, hide nav.
const printStyles = `
@media print {
  body { background: #fff !important; }
  body nav { display: none !important; }
  .cv-doc {
    --bone: #0f172a;
    --bone-dim: #334155;
    --bone-mute: #64748b;
    --line: #e2e8f0;
    --line-strong: #e2e8f0;
    --accent: #b45309;
    background: #fff !important;
    border: 0 !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    padding: 0 !important;
    max-width: 100% !important;
  }
}
`;

export default function CVPage() {
  return (
    <div className="theme-night">
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />
      <GlassNav night />

      <main className="relative z-10 pt-24 pb-16 px-6 md:px-12 print:pt-0 print:px-0">
        <article className="cv-doc ink-card max-w-3xl mx-auto p-10 md:p-14 print:p-0">
          {/* Header */}
          <header className="mb-10 pb-8 border-b border-[color:var(--line)]">
            <p className="eyebrow mb-3 text-[color:var(--bone-mute)]">
              Curriculum Vitae
            </p>
            <h1
              className="font-display text-5xl mb-2 text-[color:var(--bone)]"
              style={{ letterSpacing: '-0.02em', fontWeight: 450 }}
            >
              {personalDetails.name}
              <span className="text-[color:var(--accent)]">.</span>
            </h1>
            <p className="text-base mb-3 text-[color:var(--bone-dim)]">
              {personalDetails.roles.join(' · ')}
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs font-mono text-[color:var(--bone-mute)]">
              <span>North Zealand, DK</span>
              <span>·</span>
              <a
                href="https://marcuspff.com"
                className="underline underline-offset-2 text-[color:var(--bone-dim)] hover:text-[color:var(--bone)]"
              >
                marcuspff.com
              </a>
              <span>·</span>
              <a
                href="mailto:hello@marcuspff.com"
                className="underline underline-offset-2 text-[color:var(--bone-dim)] hover:text-[color:var(--bone)]"
              >
                hello@marcuspff.com
              </a>
              <span>·</span>
              <a
                href="https://github.com/MarcusPFF"
                className="underline underline-offset-2 text-[color:var(--bone-dim)] hover:text-[color:var(--bone)]"
              >
                github.com/MarcusPFF
              </a>
            </div>
          </header>

          {/* Skills */}
          <section className="mb-10">
            <h2 className="font-display text-lg mb-4 text-[color:var(--bone)]">
              Skills
            </h2>
            <dl className="space-y-3">
              {skillGroups.map((g) => (
                <div key={g.category} className="grid grid-cols-[140px_1fr] gap-4">
                  <dt className="text-xs font-semibold pt-1 text-[color:var(--bone-dim)]">
                    {g.category}
                  </dt>
                  <dd className="text-sm font-light leading-relaxed text-[color:var(--bone)]">
                    {g.items.join(' · ')}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Projects */}
          <section className="mb-10">
            <h2 className="font-display text-lg mb-4 text-[color:var(--bone)]">
              Selected Projects
            </h2>
            <ul className="space-y-4">
              {visibleProjects.map((p) => (
                <li key={p.title}>
                  <div className="flex items-baseline gap-3 flex-wrap mb-0.5">
                    <h3 className="text-sm font-semibold text-[color:var(--bone)]">
                      {p.title}
                    </h3>
                    <span className="text-[11px] font-mono text-[color:var(--bone-mute)]">
                      {p.subtitle}
                    </span>
                  </div>
                  <p className="text-sm font-light mb-1 text-[color:var(--bone-dim)]">
                    {p.desc}
                  </p>
                  <p className="text-[10px] font-mono tracking-[0.1em] text-[color:var(--bone-mute)]">
                    {p.tags.join(' · ')}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          {/* Course */}
          <section className="mb-10">
            <h2 className="font-display text-lg mb-4 text-[color:var(--bone)]">
              LLM Course
            </h2>
            <ul className="space-y-2">
              {visibleClasses.map((c) => (
                <li key={c.title} className="flex items-baseline gap-3">
                  <span className="font-mono text-xs w-32 shrink-0 text-[color:var(--bone-mute)]">
                    {c.title}
                  </span>
                  <span className="text-sm text-[color:var(--bone-dim)]">
                    {c.subtitle}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Trips */}
          <section className="mb-10">
            <h2 className="font-display text-lg mb-4 text-[color:var(--bone)]">
              Adventures
            </h2>
            <p className="text-sm mb-3 font-light text-[color:var(--bone-dim)]">
              {trips.length} multi-day motorcycle trips · {totalKm.toLocaleString('en-US')} km total across Europe.
            </p>
            <ul className="space-y-1 text-sm">
              {trips.map((t) => (
                <li key={t.slug} className="flex items-baseline gap-3">
                  <span className="font-medium text-[color:var(--bone)]">{t.title.en}</span>
                  <span className="text-xs text-[color:var(--bone-mute)]">·</span>
                  <span className="text-xs font-mono text-[color:var(--bone-mute)]">
                    {t.distanceKm.toLocaleString('en-US')} km
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <p className="text-[10px] font-mono tracking-[0.2em] text-center pt-6 border-t border-[color:var(--line)] text-[color:var(--bone-mute)]">
            Generated · Press Cmd/Ctrl+P to save as PDF
          </p>
        </article>
      </main>
    </div>
  );
}
