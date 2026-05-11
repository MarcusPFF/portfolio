'use client';

import { useTransition } from 'react';
import type { BetalingStatus } from '../_lib/types';
import { toggleBetalingStatus } from '../_actions/betalinger';
import { BetalingStatusBadge } from './status-badge';

export default function BetalingStatusToggle({
  betalingId,
  bryllupId,
  status,
}: {
  betalingId: string;
  bryllupId: string;
  status: BetalingStatus;
}) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (pending) return;
    startTransition(async () => {
      await toggleBetalingStatus(betalingId, bryllupId);
    });
  }

  const title =
    status === 'betalt'
      ? 'Klik for at markere som afventer'
      : 'Klik for at markere som betalt';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="cursor-pointer hover:opacity-80 disabled:opacity-50 transition-opacity"
      title={title}
    >
      <BetalingStatusBadge status={status} />
    </button>
  );
}
