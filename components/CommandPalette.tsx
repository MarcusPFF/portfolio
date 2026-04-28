'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { projects, classes } from '@/lib/data';
import { trips } from '@/lib/trips';

type Item = {
  id: string;
  label: string;
  detail?: string;
  href: string;
  external?: boolean;
  group: string;
};

const STATIC_ITEMS: Item[] = [
  { id: 'home', label: 'Home', href: '/', group: 'Pages' },
  { id: 'projects', label: 'Selected Projects', href: '/#projects', group: 'Pages' },
  { id: 'skills', label: 'Skills & Tools', href: '/#skills', group: 'Pages' },
  { id: 'contact', label: 'Contact', href: '/#contact', group: 'Pages' },
  { id: 'trips', label: 'Motorcycle Trips', href: '/trips', group: 'Pages' },
  { id: 'llm', label: 'LLM Course', href: '/llm', group: 'Pages' },
  { id: 'cv', label: 'CV', href: '/cv', group: 'Pages' },
];

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [lastQuery, setLastQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  // Build the full searchable index once.
  const allItems = useMemo<Item[]>(() => {
    const projectItems: Item[] = projects
      .filter((p) => !p.hidden)
      .map((p, i) => ({
        id: `project-${i}`,
        label: p.title,
        detail: p.subtitle,
        href: p.link ?? '#',
        external: !!p.link,
        group: 'Projects',
      }));

    const tripItems: Item[] = trips.map((t) => ({
      id: `trip-${t.slug}`,
      label: t.title.en,
      detail: `${t.distanceKm.toLocaleString('en-US')} km${t.bike ? ` · ${t.bike}` : ''}`,
      href: `/trips/${t.slug}`,
      group: 'Trips',
    }));

    const blogItems: Item[] = classes
      .filter((c) => c.blogSlug && !c.hidden)
      .map((c) => ({
        id: `blog-${c.blogSlug}`,
        label: `${c.title} — ${c.subtitle}`,
        detail: 'Course blog',
        href: `/llm/${c.blogSlug}/blog`,
        group: 'Course blogs',
      }));

    return [...STATIC_ITEMS, ...projectItems, ...tripItems, ...blogItems];
  }, []);

  // Filter by query.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems;
    return allItems.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.detail?.toLowerCase().includes(q) ||
        item.group.toLowerCase().includes(q),
    );
  }, [query, allItems]);

  // Group for display.
  const groups = useMemo(() => {
    const map = new Map<string, Array<{ item: Item; globalIdx: number }>>();
    filtered.forEach((item, globalIdx) => {
      if (!map.has(item.group)) map.set(item.group, []);
      map.get(item.group)!.push({ item, globalIdx });
    });
    return Array.from(map.entries());
  }, [filtered]);

  // Reset active index whenever query changes (derived state — no effect).
  if (query !== lastQuery) {
    setLastQuery(query);
    setActiveIndex(0);
  }

  // Cmd/Ctrl-K toggles, Esc closes, arrows + Enter navigate.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
        setQuery('');
        return;
      }
      if (!open) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, Math.max(0, filtered.length - 1)));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const item = filtered[activeIndex];
        if (item) navigate(item);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, filtered, activeIndex]);

  // Lock background scroll while open.
  useEffect(() => {
    if (open) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [open]);

  // Scroll the active item into view as user arrows through.
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(
      `[data-idx="${activeIndex}"]`,
    );
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, filtered]);

  const navigate = (item: Item) => {
    setOpen(false);
    if (item.external) {
      window.open(item.href, '_blank', 'noopener,noreferrer');
    } else {
      router.push(item.href);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[150] flex items-start justify-center pt-[15vh] px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onClick={() => setOpen(false)}
    >
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" />

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-white/95 backdrop-blur-xl border border-white/80 rounded-2xl shadow-2xl overflow-hidden"
        style={{ animation: 'cmdkPop 180ms cubic-bezier(0.22, 1, 0.36, 1) forwards' }}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-200/60">
          <svg
            className="w-4 h-4 text-slate-400 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="8" />
            <path strokeLinecap="round" d="M21 21l-4.3-4.3" />
          </svg>
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to or search…"
            className="flex-1 bg-transparent border-0 outline-none text-slate-800 text-sm placeholder-slate-400"
            aria-label="Search"
          />
          <kbd className="text-[10px] font-mono uppercase tracking-wider text-slate-400 border border-slate-200 rounded px-1.5 py-0.5 hidden sm:inline">
            esc
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-slate-400">
              No matches.
            </p>
          ) : (
            groups.map(([group, items]) => (
              <div key={group} className="mb-1">
                <p className="px-5 py-1.5 text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-400">
                  {group}
                </p>
                {items.map(({ item, globalIdx }) => {
                  const isActive = globalIdx === activeIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      data-idx={globalIdx}
                      onMouseEnter={() => setActiveIndex(globalIdx)}
                      onClick={() => navigate(item)}
                      className={`w-full text-left px-5 py-2.5 flex items-center gap-3 transition-colors ${
                        isActive ? 'bg-slate-100' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">
                          {item.label}
                        </p>
                        {item.detail && (
                          <p className="text-xs text-slate-500 truncate">
                            {item.detail}
                          </p>
                        )}
                      </div>
                      {item.external && (
                        <svg
                          className="w-3.5 h-3.5 text-slate-400 shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hints */}
        <div className="px-5 py-3 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <kbd className="font-mono border border-slate-200 rounded px-1.5 py-0.5">
                ↑↓
              </kbd>
              navigate
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="font-mono border border-slate-200 rounded px-1.5 py-0.5">
                ↵
              </kbd>
              open
            </span>
          </div>
          <span className="flex items-center gap-1.5">
            <kbd className="font-mono border border-slate-200 rounded px-1.5 py-0.5">
              ⌘K
            </kbd>
            toggle
          </span>
        </div>
      </div>

      <style>{`
        @keyframes cmdkPop {
          from { opacity: 0; transform: scale(0.96) translateY(-8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}
