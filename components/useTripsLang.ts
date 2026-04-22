'use client';

import { useCallback, useSyncExternalStore } from 'react';
import type { Lang } from '@/lib/trips';

const KEY = 'trips-lang';

function isLang(v: unknown): v is Lang {
  return v === 'en' || v === 'dk' || v === 'de';
}

function readStored(): Lang {
  try {
    const stored = window.localStorage.getItem(KEY);
    if (isLang(stored)) return stored;
  } catch {
    /* noop */
  }
  return 'en';
}

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

const getServerSnapshot = (): Lang => 'en';

export function useTripsLang(): [Lang, (l: Lang) => void] {
  const lang = useSyncExternalStore(subscribe, readStored, getServerSnapshot);

  const setLang = useCallback((l: Lang) => {
    try {
      window.localStorage.setItem(KEY, l);
      // Storage events don't fire in the same tab; dispatch manually so other
      // subscribers on this page re-read the value.
      window.dispatchEvent(new StorageEvent('storage', { key: KEY, newValue: l }));
    } catch {
      /* noop */
    }
  }, []);

  return [lang, setLang];
}
