'use client';

import { useState, useTransition } from 'react';
import {
  deleteAllBryllupperAction,
  type DeleteAllResult,
} from '../_actions/admin';

export default function AdminDeleteAllButton() {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<DeleteAllResult | null>(null);

  function handleClick() {
    const ok = confirm(
      'Fjern ALLE bryllupper fra Supabase? Også opgaver, tilkøb, betalinger og overnatninger. Kan ikke fortrydes.',
    );
    if (!ok) return;
    startTransition(async () => {
      const res = await deleteAllBryllupperAction();
      setResult(res);
    });
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="inline-flex items-center gap-2 px-4 py-2 bg-[#7a3327] text-[#f0ede2] rounded-md text-sm font-medium hover:bg-[#6a2c22] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {pending ? 'Sletter…' : 'Fjern alle bryllupper'}
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
