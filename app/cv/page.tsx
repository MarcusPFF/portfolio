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

export default function CVPage() {
  return (
    <>
      <GlassNav />

      <main className="relative z-10 pt-24 pb-16 px-6 md:px-12 print:pt-0 print:px-0">
        <article className="max-w-3xl mx-auto bg-white/70 print:bg-white rounded-[1.5rem] print:rounded-none border border-white/60 print:border-0 shadow-sm print:shadow-none p-10 md:p-14 print:p-0">
          {/* Header */}
          <header className="mb-10 pb-8 border-b border-slate-200">
            <p className="text-slate-500 font-semibold tracking-[0.25em] uppercase text-xs mb-3">
              Curriculum Vitae
            </p>
            <h1
              className="text-5xl font-bold text-slate-900 mb-2"
              style={{ letterSpacing: '-0.02em' }}
            >
              {personalDetails.name}<span className="text-violet-500">.</span>
            </h1>
            <p className="text-slate-600 text-base mb-3">
              {personalDetails.roles.join(' · ')}
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
              <span>Copenhagen, DK</span>
              <span>·</span>
              <a
                href="https://marcuspff.com"
                className="underline underline-offset-2 hover:text-slate-800"
              >
                marcuspff.com
              </a>
              <span>·</span>
              <a
                href="mailto:hello@marcuspff.com"
                className="underline underline-offset-2 hover:text-slate-800"
              >
                hello@marcuspff.com
              </a>
              <span>·</span>
              <a
                href="https://github.com/MarcusPFF"
                className="underline underline-offset-2 hover:text-slate-800"
              >
                github.com/MarcusPFF
              </a>
            </div>
          </header>

          {/* Skills */}
          <section className="mb-10">
            <h2 className="text-xs font-semibold tracking-[0.25em] uppercase text-slate-500 mb-4">
              Skills
            </h2>
            <dl className="space-y-3">
              {skillGroups.map((g) => (
                <div key={g.category} className="grid grid-cols-[140px_1fr] gap-4">
                  <dt className="text-xs font-semibold text-slate-700 uppercase tracking-[0.1em] pt-0.5">
                    {g.category}
                  </dt>
                  <dd className="text-sm text-slate-700 font-light leading-relaxed">
                    {g.items.join(' · ')}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Projects */}
          <section className="mb-10">
            <h2 className="text-xs font-semibold tracking-[0.25em] uppercase text-slate-500 mb-4">
              Selected Projects
            </h2>
            <ul className="space-y-4">
              {visibleProjects.map((p) => (
                <li key={p.title}>
                  <div className="flex items-baseline gap-3 flex-wrap mb-0.5">
                    <h3 className="text-sm font-bold text-slate-800">{p.title}</h3>
                    <span className="text-xs text-slate-400 uppercase tracking-[0.1em]">
                      {p.subtitle}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 font-light mb-1">{p.desc}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-[0.15em]">
                    {p.tags.join(' · ')}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          {/* Course */}
          <section className="mb-10">
            <h2 className="text-xs font-semibold tracking-[0.25em] uppercase text-slate-500 mb-4">
              LLM Course
            </h2>
            <ul className="space-y-2">
              {visibleClasses.map((c) => (
                <li key={c.title} className="flex items-baseline gap-3">
                  <span className="text-xs font-semibold text-slate-700 w-32 shrink-0">
                    {c.title}
                  </span>
                  <span className="text-sm text-slate-600">{c.subtitle}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Trips */}
          <section className="mb-10">
            <h2 className="text-xs font-semibold tracking-[0.25em] uppercase text-slate-500 mb-4">
              Adventures
            </h2>
            <p className="text-sm text-slate-600 mb-3 font-light">
              {trips.length} multi-day motorcycle trips · {totalKm.toLocaleString('en-US')} km total across Europe.
            </p>
            <ul className="space-y-1 text-sm text-slate-600">
              {trips.map((t) => (
                <li key={t.slug} className="flex items-baseline gap-3">
                  <span className="font-medium text-slate-800">{t.title.en}</span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-500">
                    {t.distanceKm.toLocaleString('en-US')} km
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <p className="text-[10px] text-slate-400 uppercase tracking-[0.25em] text-center pt-6 border-t border-slate-200">
            Generated · Press Cmd/Ctrl+P to save as PDF
          </p>
        </article>
      </main>
    </>
  );
}
