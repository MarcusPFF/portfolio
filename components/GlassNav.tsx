'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const navLinks = [
  { label: 'Projects', href: '/#projects' },
  { label: 'Skills', href: '/#skills' },
  { label: 'Contact', href: '/#contact' },
  { label: 'Motorcycle Trips', href: '/trips' },
  { label: 'LLM Course (Exam)', href: '/llm' },
];

export default function GlassNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when the user navigates (pathname change)
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Close on outside click / Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  function directionFor(href: string): 'nav-forward' | 'nav-back' | null {
    if (href.startsWith('/#')) return null;
    if (href === pathname) return null;
    const current = pathname.split('/').filter(Boolean).length;
    const target = href.split('/').filter(Boolean).length;
    if (target > current) return 'nav-forward';
    if (target < current) return 'nav-back';
    return pathname.startsWith(href) ? 'nav-back' : 'nav-forward';
  }

  return (
    <nav
      ref={rootRef}
      style={{ viewTransitionName: 'site-header' }}
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-full px-5 py-2.5 sm:px-8 sm:py-3 flex items-center gap-4 sm:gap-8 transition-all duration-500 ${
        scrolled || menuOpen ? 'glass-nav shadow-lg' : 'bg-transparent'
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
          const isActive =
            pathname === link.href || (pathname === '/' && link.href.startsWith('/#'));
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

      {/* Mobile hamburger — visible below sm breakpoint */}
      <button
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
        aria-controls="mobile-nav"
        className="sm:hidden w-8 h-8 flex items-center justify-center text-slate-700 hover:text-slate-900"
      >
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {menuOpen ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </>
          ) : (
            <>
              <line x1="4" y1="7" x2="20" y2="7" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="17" x2="20" y2="17" />
            </>
          )}
        </svg>
      </button>

      {/* Mobile dropdown — only rendered when open */}
      {menuOpen && (
        <div
          id="mobile-nav"
          className="sm:hidden absolute top-full right-0 mt-3 w-56 rounded-2xl glass-nav shadow-lg overflow-hidden flex flex-col py-2"
        >
          {navLinks.map((link) => {
            const dir = directionFor(link.href);
            const isActive =
              pathname === link.href || (pathname === '/' && link.href.startsWith('/#'));
            return (
              <Link
                key={link.label}
                href={link.href}
                transitionTypes={dir ? [dir] : undefined}
                onClick={() => setMenuOpen(false)}
                className={`px-5 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-slate-900 bg-white/50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
