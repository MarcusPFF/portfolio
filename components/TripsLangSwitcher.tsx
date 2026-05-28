'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Lang } from '@/lib/trips';

type Option = { code: Lang; label: string; flag: string; name: string };

const OPTIONS: Option[] = [
  { code: 'dk', label: 'DK', flag: '🇩🇰', name: 'Dansk' },
  { code: 'en', label: 'EN', flag: '🇬🇧', name: 'English' },
  { code: 'de', label: 'DE', flag: '🇩🇪', name: 'Deutsch' },
];

export default function TripsLangSwitcher({
  lang,
  onChange,
}: {
  lang: Lang;
  onChange: (l: Lang) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const current = OPTIONS.find((o) => o.code === lang) ?? OPTIONS[1];

  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return;
    const r = buttonRef.current.getBoundingClientRect();
    const MENU_WIDTH = 192; // Tailwind w-48
    const MARGIN = 8;
    // Prefer aligning the menu's right edge with the button's right edge,
    // but clamp to the viewport so we never overflow on either side.
    let left = r.right - MENU_WIDTH;
    if (left < MARGIN) left = MARGIN;
    if (left + MENU_WIDTH > window.innerWidth - MARGIN) {
      left = window.innerWidth - MENU_WIDTH - MARGIN;
    }
    setPos({ top: r.bottom + 8, left });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (
        !buttonRef.current?.contains(e.target as Node) &&
        !menuRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onScroll = () => setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [open]);

  const handleSelect = (code: Lang) => {
    onChange(code);
    setOpen(false);
  };

  return (
    <div className="inline-block">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Select language"
        onClick={() => setOpen((v) => !v)}
        className="ink-pill inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold min-h-9 text-[color:var(--bone-dim)] hover:text-[color:var(--bone)]"
      >
        <span className="text-base leading-none" aria-hidden="true">
          {current.flag}
        </span>
        <span className="tracking-wider">{current.label}</span>
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open &&
        typeof document !== 'undefined' &&
        createPortal(
          <ul
            ref={menuRef}
            role="menu"
            style={{
              position: 'fixed',
              top: pos.top,
              left: pos.left,
              zIndex: 9999,
              background: 'oklch(15.5% 0.020 280 / 0.97)',
              backdropFilter: 'blur(20px) saturate(140%)',
              WebkitBackdropFilter: 'blur(20px) saturate(140%)',
              borderRadius: '1rem',
              boxShadow: '0 18px 50px oklch(0% 0 0 / 0.55), 0 2px 6px oklch(0% 0 0 / 0.35)',
            }}
            className="theme-night w-48 py-2 overflow-hidden border border-[color:var(--line-strong)]"
          >
            {OPTIONS.map((o) => {
              const active = o.code === lang;
              return (
                <li key={o.code} role="none">
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={active}
                    onClick={() => handleSelect(o.code)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-[oklch(94%_0.022_82_/_0.08)] text-[color:var(--bone)]'
                        : 'text-[color:var(--bone-dim)] hover:bg-[oklch(94%_0.022_82_/_0.05)] hover:text-[color:var(--bone)]'
                    }`}
                  >
                    <span className="text-base leading-none" aria-hidden="true">
                      {o.flag}
                    </span>
                    <span className="flex-1 text-left">{o.name}</span>
                    <span className="text-xs text-[color:var(--bone-mute)] tracking-wider">{o.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>,
          document.body,
        )}
    </div>
  );
}
