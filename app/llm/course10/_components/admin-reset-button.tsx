'use client';

import { useState, useTransition } from 'react';
import { resetToSeed, type ResetResult } from '../_actions/admin';

export default function AdminResetButton() {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ResetResult | null>(null);

  function handleClick() {
    const ok = confirm(
      'Nulstil alt demo-data til de oprindelige 6 bryllupper? Alle ændringer går tabt.',
    );
    if (!ok) return;
    startTransition(async () => {
      const res = await resetToSeed();
      setResult(res);
    });
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="px-4 py-2 border border-[#c89a8e] text-[#7a3327] rounded-md text-sm font-medium hover:bg-[#e9d4cd] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {pending ? 'Nulstiller…' : 'Reset til seed'}
      </button>
      {result ? (
        <p
          className={`text-xs ${
            result.ok ? 'text-[#3d4a3a]' : 'text-[#7a3327]'
          }`}
        >
          {result.message}
        </p>
      ) : null}
    </div>
  );
}
