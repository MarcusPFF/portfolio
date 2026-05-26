import { ViewTransition } from 'react';
import GlassNav from '@/components/GlassNav';
import GlassHero from '@/components/GlassHero';
import GlassProjects from '@/components/GlassProjects';
import GlassSkills from '@/components/GlassSkills';
import GlassContact from '@/components/GlassContact';
import ParticleField from '@/components/ParticleField';

export default function Home() {
  return (
    <div className="theme-night">
      <GlassNav />

      {/* Two atmospheric orbs — quiet, just enough to suggest depth */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div
          className="absolute top-[10%] -left-[8%] w-[520px] h-[520px] rounded-full blur-3xl float-slow"
          style={{ background: 'oklch(48% 0.008 280 / 0.22)' }}
        />
        <div
          className="absolute bottom-[2%] -right-[6%] w-[480px] h-[480px] rounded-full blur-3xl float-medium"
          style={{ background: 'oklch(42% 0.12 280 / 0.18)' }}
        />
      </div>

      {/* Cursor-reactive particle field */}
      <ParticleField />

      <ViewTransition
        enter={{ 'nav-forward': 'nav-forward', 'nav-back': 'nav-back', default: 'none' }}
        exit={{ 'nav-forward': 'nav-forward', 'nav-back': 'nav-back', default: 'none' }}
        default="none"
      >
        <main className="relative z-10">
          <GlassHero />
          <GlassProjects />
          <GlassSkills />
          <GlassContact />

          <footer className="container-grid py-16">
            <p
              className="font-mono text-[11px]"
              style={{ color: 'var(--bone-mute)' }}
            >
              © {new Date().getFullYear()} Marcus Forsberg · Copenhagen
            </p>
          </footer>
        </main>
      </ViewTransition>
    </div>
  );
}
