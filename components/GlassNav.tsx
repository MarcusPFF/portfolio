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

const SECTION_IDS = ['projects', 'skills', 'contact'] as const;

export default function GlassNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [dotX, setDotX] = useState<number | null>(null);
  const [dotVisible, setDotVisible] = useState(false);
  const pathname = usePathname();
  const [lastPathname, setLastPathname] = useState(pathname);
  const rootRef = useRef<HTMLElement>(null);
  const linksContainerRef = useRef<HTMLDivElement>(null);
  const linkRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setMenuOpen(false);
    setActiveSection(null);
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track which homepage section is in view via IntersectionObserver. The
  // observer reports each section's visibility state; we pick the first
  // visible section in document order. When nothing is visible (top of page)
  // the dot disappears.
  useEffect(() => {
    if (pathname !== '/') return;

    const visibility = new Map<string, boolean>();
    SECTION_IDS.forEach((id) => visibility.set(id, false));

    const els = SECTION_IDS
      .map((id) => document.getElementById(id))
      .filter((e): e is HTMLElement => !!e);
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibility.set(entry.target.id, entry.isIntersecting);
        }
        const firstVisible = SECTION_IDS.find((id) => visibility.get(id));
        setActiveSection(firstVisible ?? null);
      },
      { rootMargin: '-100px 0px -50% 0px' },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  // Compute the sliding dot's x-position from the active link's bbox.
  // When activeSection becomes null (e.g. scrolling through GitHub Activity
  // between Skills and Contact), keep the last known dotX so the dot fades
  // out in place rather than sliding back to left:0 and reappearing.
  useEffect(() => {
    let raf = 0;
    const recompute = () => {
      if (!activeSection) {
        setDotVisible(false);
        return;
      }
      const link = linkRefs.current.get(`/#${activeSection}`);
      const container = linksContainerRef.current;
      if (!link || !container) return;
      const linkRect = link.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      setDotX(linkRect.left - containerRect.left + linkRect.width / 2);
      setDotVisible(true);
    };
    raf = requestAnimationFrame(recompute);
    window.addEventListener('resize', recompute);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', recompute);
    };
  }, [activeSection]);

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
      className={`fixed top-3 left-1/2 -translate-x-1/2 z-50 rounded-full px-4 py-2 sm:px-6 sm:py-2.5 flex items-center gap-3 sm:gap-6 transition-all duration-500 ${
        scrolled || menuOpen ? 'glass-nav shadow-lg' : 'bg-transparent'
      }`}
    >
      <Link
        href="/"
        transitionTypes={directionFor('/') ? [directionFor('/') as string] : undefined}
        className="font-bold text-slate-800 text-base tracking-tight hover:opacity-70 transition-opacity"
      >
        M.
      </Link>

      <div ref={linksContainerRef} className="hidden sm:flex items-center gap-6 relative">
        {navLinks.map((link) => {
          const dir = directionFor(link.href);
          const isHashLink = link.href.startsWith('/#');
          const sectionId = isHashLink ? link.href.slice(2) : null;
          const isActive = isHashLink
            ? pathname === '/' && activeSection === sectionId
            : pathname === link.href;
          const className = `nav-link text-[13px] font-medium tracking-wide transition-colors duration-300 ${
            isActive ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'
          }`;
          return (
            <Link
              key={link.label}
              ref={(el) => {
                if (el) linkRefs.current.set(link.href, el);
                else linkRefs.current.delete(link.href);
              }}
              href={link.href}
              transitionTypes={dir ? [dir] : undefined}
              className={className}
            >
              {link.label}
            </Link>
          );
        })}

        <span
          aria-hidden="true"
          className="absolute -bottom-2 w-1 h-1 rounded-full bg-violet-500 pointer-events-none"
          style={{
            left: dotX ?? 0,
            transform: 'translateX(-50%)',
            opacity: dotVisible ? 1 : 0,
            transition: 'left 300ms ease-out, opacity 300ms ease-out',
          }}
        />
      </div>

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

      {menuOpen && (
        <div
          id="mobile-nav"
          style={{
            background: '#ffffff',
            boxShadow: '0 12px 40px rgba(15, 23, 42, 0.18), 0 2px 6px rgba(15, 23, 42, 0.08)',
          }}
          className="sm:hidden absolute top-full right-0 mt-3 w-56 rounded-2xl overflow-hidden flex flex-col py-2 border border-slate-200"
        >
          {navLinks.map((link) => {
            const dir = directionFor(link.href);
            const isHashLink = link.href.startsWith('/#');
            const sectionId = isHashLink ? link.href.slice(2) : null;
            const isActive = isHashLink
              ? pathname === '/' && activeSection === sectionId
              : pathname === link.href;
            return (
              <Link
                key={link.label}
                href={link.href}
                transitionTypes={dir ? [dir] : undefined}
                onClick={() => setMenuOpen(false)}
                className={`px-5 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-slate-900 bg-slate-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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
