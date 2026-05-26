import ScrollReveal from './ScrollReveal';
import { skillGroups } from '../lib/data';

const LABEL_OVERRIDES: Record<string, string> = {
  'Frameworks & Libraries': 'Frameworks',
  'Tools & Platforms': 'Tools',
};

function labelFor(category: string): string {
  return LABEL_OVERRIDES[category] ?? category;
}

// Non-breaking space before each separator keeps the punctuation attached to
// the preceding token on line-wrap, so dots don't orphan to the start of a
// wrapped line.
const NBSP = ' ';
const EM_DASH = `${NBSP}—`;
const MID_DOT = `${NBSP}·`;

export default function GlassSkills() {
  return (
    <section
      id="stack"
      className="container-grid"
      style={{ paddingTop: 'clamp(2.5rem, 4.5vw, 4rem)', paddingBottom: 'var(--section-py)' }}
    >
      <ScrollReveal>
        <div className="flex items-baseline justify-between mb-10">
          <h2
            className="font-display text-4xl md:text-5xl"
            style={{
              color: 'var(--bone)',
              fontWeight: 350,
              fontVariationSettings: '"opsz" 144, "SOFT" 100',
              letterSpacing: '-0.02em',
            }}
          >
            Stack
          </h2>
          <span
            className="font-mono text-[11px] tabular-nums"
            style={{ color: 'var(--bone-dim)' }}
            aria-label={`${skillGroups.length} stack categories`}
          >
            {String(skillGroups.length).padStart(2, '0')}
          </span>
        </div>
      </ScrollReveal>

      <ScrollReveal>
        <div
          className="space-y-4 font-light leading-[1.7]"
          style={{ fontSize: 'var(--body-lg)' }}
        >
          {skillGroups.map((group) => (
            <p key={group.category}>
              <span style={{ color: 'var(--bone-dim)' }}>
                {labelFor(group.category)}
              </span>
              <span style={{ color: 'var(--bone-mute)' }}>{EM_DASH}</span>{' '}
              {group.items.map((item, i) => {
                const isLast = i === group.items.length - 1;
                return (
                  <span key={item}>
                    <span style={{ color: 'var(--bone)' }}>{item}</span>
                    {!isLast && (
                      <>
                        <span style={{ color: 'var(--bone-mute)' }}>{MID_DOT}</span>{' '}
                      </>
                    )}
                  </span>
                );
              })}
            </p>
          ))}
        </div>
      </ScrollReveal>
    </section>
  );
}
