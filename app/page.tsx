import { ViewTransition } from 'react';
import GlassNav from '@/components/GlassNav';
import GlassHero from '@/components/GlassHero';
import GlassProjects from '@/components/GlassProjects';
import GlassSkills from '@/components/GlassSkills';
import GlassContact from '@/components/GlassContact';
import GithubActivity from '@/components/GithubActivity';
import ParticleField from '@/components/ParticleField';

export default function Home() {
  return (
    <>
      <GlassNav />

      {/* Floating decorative orbs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-[400px] h-[400px] bg-purple-300/20 rounded-full blur-3xl float-slow" />
        <div className="absolute top-[60%] right-[10%] w-[350px] h-[350px] bg-pink-300/20 rounded-full blur-3xl float-medium" />
        <div className="absolute top-[30%] right-[30%] w-[300px] h-[300px] bg-blue-300/15 rounded-full blur-3xl float-fast" />
        <div className="absolute bottom-[10%] left-[20%] w-[250px] h-[250px] bg-orange-200/15 rounded-full blur-3xl float-slow" />
      </div>

      {/* Cursor-reactive particle field — sits above orbs, below content */}
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
          <GithubActivity />
          <GlassContact />

          <footer className="py-12 text-center text-slate-400 font-light text-sm">
            <p>© 2026 Marcus Forsberg</p>
          </footer>
        </main>
      </ViewTransition>
    </>
  );
}
