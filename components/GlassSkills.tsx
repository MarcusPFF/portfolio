import ScrollReveal from './ScrollReveal';
import { skillGroups } from '../lib/data';


export default function GlassSkills() {
  return (
    <section id="skills" className="py-28 px-6 md:px-24">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <p className="text-slate-400 font-medium tracking-[0.2em] uppercase text-sm mb-3">Expertise</p>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-16 tracking-tight">
            Skills & Tools
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {skillGroups.map((group, idx) => (
            <ScrollReveal key={idx} delay={idx * 150}>
              <div className="glass-card p-8 h-full">
                <div className="w-12 h-12 rounded-xl bg-white/50 flex items-center justify-center mb-6 text-xl">
                  {group.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-6 tracking-tight">{group.category}</h3>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((skill) => (
                    <span
                      key={skill}
                      className="glass-pill px-4 py-2.5 rounded-xl text-slate-600 font-medium text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
