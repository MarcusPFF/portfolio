'use client';

import { useRef, useState } from 'react';

type Props = {
  email: string;
  className?: string;
};

export default function CopyEmail({ email, className = '' }: Props) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onClick = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — silently noop */
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={copied ? 'Email copied to clipboard' : `Copy email ${email}`}
      className={`group relative inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 active:scale-[0.97] transition-all ${className}`}
    >
      <svg
        className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-colors"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
      </svg>
      <span className="font-medium tabular-nums">{email}</span>
      <span
        aria-hidden="true"
        className={`absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-full bg-slate-900 text-white text-[10px] font-semibold uppercase tracking-wider transition-all duration-200 ${
          copied ? 'opacity-100 -translate-y-0' : 'opacity-0 translate-y-1 pointer-events-none'
        }`}
      >
        Copied
      </span>
    </button>
  );
}
