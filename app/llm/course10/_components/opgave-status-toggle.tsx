'use client';

import { useTransition } from 'react';
import type { OpgaveStatus } from '../_lib/types';
import { cycleOpgaveStatus } from '../_actions/opgaver';
import { OpgaveStatusBadge } from './status-badge';

export default function OpgaveStatusToggle({
  opgaveId,
  bryllupId,
  status,
}: {
  opgaveId: string;
  bryllupId: string;
  status: OpgaveStatus;
}) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (pending) return;
    startTransition(async () => {
      await cycleOpgaveStatus(opgaveId, bryllupId);
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
      <OpgaveStatusBadge status={status} />
    </button>
  );
}
