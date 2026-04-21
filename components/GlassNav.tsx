'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const navLinks = [
  { label: 'Projects', href: '/#projects' },
  { label: 'Skills', href: '/#skills' },
  { label: 'Contact', href: '/#contact' },
  { label: 'LLM Course (Exam)', href: '/llm' },
];

export default function GlassNav() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function directionFor(href: string): 'nav-forward' | 'nav-back' | null {
    if (href.startsWith('/#')) return null;
    if (href === '/') return 'nav-back';
    if (pathname === '/' || (pathname.startsWith('/llm') && href.startsWith('/llm') && href.length > pathname.length)) {
      return 'nav-forward';
    }
    if (pathname.startsWith('/llm') && href === '/llm' && pathname !== '/llm') return 'nav-back';
    return 'nav-forward';
  }

  return (
    <nav
      style={{ viewTransitionName: 'site-header' }}
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-full px-8 py-3 flex items-center gap-8 transition-all duration-500 ${scrolled
        ? 'glass-nav shadow-lg'
        : 'bg-transparent'
        }`}
    >
      <Link
        href="/"
        transitionTypes={directionFor('/') ? [directionFor('/') as string] : undefined}
        className="font-bold text-slate-800 text-lg tracking-tight hover:opacity-70 transition-opacity"
      >
        M.
      </Link>

      <div className="hidden sm:flex items-center gap-6">
        {navLinks.map((link) => {
          const dir = directionFor(link.href);
          const isActive = pathname === link.href || (pathname === '/' && link.href.startsWith('/#'));
          const className = `text-sm font-medium tracking-wide transition-colors duration-300 ${
            isActive ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'
          }`;
          return (
            <Link
              key={link.label}
              href={link.href}
              transitionTypes={dir ? [dir] : undefined}
              className={className}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
