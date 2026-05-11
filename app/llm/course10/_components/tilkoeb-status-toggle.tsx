'use client';

import { useTransition } from 'react';
import type { TilkoebStatus } from '../_lib/types';
import { cycleTilkoebStatus } from '../_actions/tilkoeb';
import { TilkoebStatusBadge } from './status-badge';

export default function TilkoebStatusToggle({
  tilkoebId,
  bryllupId,
  status,
}: {
  tilkoebId: string;
  bryllupId: string;
  status: TilkoebStatus;
}) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (pending) return;
    startTransition(async () => {
      await cycleTilkoebStatus(tilkoebId, bryllupId);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="cursor-pointer hover:opacity-80 disabled:opacity-50 transition-opacity"
      title="Klik for at skifte status"
    >
      <TilkoebStatusBadge status={status} />
    </button>
  );
}
