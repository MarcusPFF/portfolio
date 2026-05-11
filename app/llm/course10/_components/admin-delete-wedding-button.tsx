'use client';

import { useTransition } from 'react';
import { deleteBryllup } from '../_actions/admin';

export default function AdminDeleteWeddingButton({
  id,
  brudepar,
}: {
  id: string;
  brudepar: string;
}) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    const ok = confirm(`Slet bryllup "${brudepar}" permanent? Kan ikke fortrydes.`);
    if (!ok) return;
    startTransition(async () => {
      await deleteBryllup(id);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="px-3 py-1.5 text-xs border border-[#c89a8e] text-[#7a3327] rounded-md hover:bg-[#e9d4cd] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? 'Sletter…' : 'Slet'}
    </button>
  );
}
