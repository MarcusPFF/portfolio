import ScrollReveal from './ScrollReveal';
import { skillGroups } from '../lib/data';

export default function GlassSkills() {
  return (
    <section id="skills" className="py-20 px-6 md:px-24">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal>
          <p className="text-slate-400 font-medium tracking-[0.2em] uppercase text-xs mb-3">
            Expertise
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2 tracking-tight">
            Skills &amp; Tools
          </h2>
          <p className="text-slate-500 font-light text-sm mb-10">Things I work with</p>
        </ScrollReveal>

        <ScrollReveal>
          <div className="glass-card overflow-hidden">
            <ul>
              {skillGroups.map((group, idx) => (
                <li
                  key={group.category}
                  className={idx > 0 ? 'border-t border-white/40' : ''}
                >
                  <div className="px-5 md:px-7 py-5 flex flex-col md:flex-row md:items-baseline gap-2 md:gap-6">
                    <div className="md:w-44 shrink-0 flex items-baseline gap-2">
                      <span className="text-base" aria-hidden="true">
                        {group.icon}
                      </span>
                      <p className="text-slate-500 font-semibold tracking-[0.15em] uppercase text-[10px]">
                        {group.category}
                      </p>
                    </div>
                    <p className="flex-1 text-sm text-slate-700 font-light leading-relaxed">
                      {group.items.join(' · ')}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
