'use client';

import { useEffect, useState } from 'react';

const KONAMI = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
];

export default function KonamiCode() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    let buffer: string[] = [];

    const onKey = (e: KeyboardEvent) => {
      // Ignore typing inside inputs / textareas
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      buffer = [...buffer, key].slice(-KONAMI.length);
      if (buffer.join(',').toLowerCase() === KONAMI.join(',').toLowerCase()) {
        setActive(true);
        buffer = [];
        window.setTimeout(() => setActive(false), 6000);
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!active) return null;

  return (
    <div
      aria-hidden="true"
      className="theme-night fixed inset-0 z-[200] pointer-events-none flex items-center justify-center"
    >
      {/* Confetti dots */}
      {Array.from({ length: 30 }).map((_, i) => (
        <span
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            background: ['#dc8a4a', '#f4eee0', '#e6a866', '#b9b09c', '#dc8a4a'][i % 5],
            left: `${(i * 17) % 100}%`,
            top: `${(i * 23) % 100}%`,
            animation: `konamiFly 2.5s ${i * 80}ms cubic-bezier(0.22, 1, 0.36, 1) forwards`,
          }}
        />
      ))}

      <div
        className="ink-card px-8 py-6 text-center"
        style={{ animation: 'konamiPop 600ms cubic-bezier(0.22, 1, 0.36, 1) forwards' }}
      >
        <p className="text-[10px] uppercase tracking-[0.3em] font-semibold mb-2 text-[color:var(--accent)]">
          Cheat unlocked
        </p>
        <p className="text-2xl font-bold text-[color:var(--bone)]" style={{ letterSpacing: '-0.02em' }}>
          Vroom mode<span className="text-[color:var(--accent)]">.</span>
        </p>
      </div>

      <style>{`
        @keyframes konamiPop {
          from { opacity: 0; transform: scale(0.8) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes konamiFly {
          0%   { opacity: 0; transform: translate(0, 0) scale(0); }
          20%  { opacity: 1; transform: translate(calc(var(--dx, 0) * 1px), calc(var(--dy, 0) * 1px)) scale(1); }
          100% { opacity: 0; transform: translate(calc(var(--dx, 0) * 4px), calc(var(--dy, 0) * 4px + 200px)) scale(0.5); }
        }
      `}</style>
    </div>
  );
}
