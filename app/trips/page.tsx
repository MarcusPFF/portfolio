import { ViewTransition } from 'react';
import GlassNav from '@/components/GlassNav';
import ChatWidgetLazy from '@/components/ChatWidgetLazy';
import TripsListClient from '@/components/TripsListClient';

export const metadata = {
  title: 'Motorcycle Trips | Marcus Forsberg',
  description: 'Tours, expeditions and weekend rides on two wheels.',
};

export default function TripsPage() {
  return (
    <div className="theme-night">
      <GlassNav night />

      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div
          className="absolute top-[10%] -left-[6%] w-[520px] h-[520px] rounded-full blur-3xl float-slow"
          style={{ background: 'oklch(48% 0.008 280 / 0.22)' }}
        />
        <div
          className="absolute bottom-[4%] -right-[6%] w-[460px] h-[460px] rounded-full blur-3xl float-medium"
          style={{ background: 'oklch(42% 0.12 280 / 0.16)' }}
        />
      </div>

      <ViewTransition
        enter={{ 'nav-forward': 'nav-forward', 'nav-back': 'nav-back', default: 'none' }}
        exit={{ 'nav-forward': 'nav-forward', 'nav-back': 'nav-back', default: 'none' }}
        default="none"
      >
        <main className="relative z-10 pt-20">
          <TripsListClient />

          <footer className="py-12 text-center font-mono text-[11px] text-[color:var(--bone-mute)]">
            <p>© 2026 Marcus Forsberg</p>
          </footer>
        </main>
      </ViewTransition>

      <ChatWidgetLazy />
    </div>
  );
}
