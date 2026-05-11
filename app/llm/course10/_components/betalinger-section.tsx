'use client';

import { useOptimistic, useState, useTransition } from 'react';
import type { Betaling } from '../_lib/types';
import {
  BETALING_TYPE_LABELS,
  formatDKK,
  formatDateShort,
} from '../_lib/formatting';
import { deleteBetaling } from '../_actions/betalinger';
import BetalingStatusToggle from './betaling-status-toggle';
import BetalingAddForm from './betaling-add-form';
import DeleteModeButton from './delete-mode-button';
import DeleteRowButton from './delete-row-button';

export default function BetalingerSection({
  betalinger,
  bryllupId,
  admin,
}: {
  betalinger: Betaling[];
  bryllupId: string;
  admin: boolean;
}) {
  const [deleteMode, setDeleteMode] = useState(false);
  const [pending, startTransition] = useTransition();
  const [visible, removeOptimistically] = useOptimistic<Betaling[], string>(
    betalinger,
    (current, idToRemove) => current.filter((b) => b.id !== idToRemove),
  );

  function handleDelete(b: Betaling) {
    startTransition(async () => {
      removeOptimistically(b.id);
      await deleteBetaling(b.id, bryllupId);
    });
  }

  return (
    <section className="mb-10">
      <div className="flex items-baseline justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-baseline gap-3">
          <h3 className="display text-2xl text-[#2a2723]">Betalinger</h3>
          <span className="text-xs text-[#75695b]">{visible.length}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {admin ? (
            <DeleteModeButton
              active={deleteMode}
              onToggle={() => setDeleteMode(!deleteMode)}
              itemCount={visible.length}
            />
          ) : null}
          <BetalingAddForm bryllupId={bryllupId} />
        </div>
      </div>
      <div className="bg-[#fffdf8] border border-[#dad3c4] rounded-lg px-5 py-4">
        {visible.length === 0 ? (
          <p className="text-sm text-[#75695b] italic py-2">
            Ingen betalinger registreret.
          </p>
        ) : (
          <ul className="divide-y divide-[#efe8d8]">
            {visible.map((b) => (
              <li
                key={b.id}
                className="py-3 flex items-start justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="text-sm text-[#2a2723]">
                    {b.type ? BETALING_TYPE_LABELS[b.type] : 'Betaling'}
                  </p>
                  <p className="text-[11px] text-[#75695b] mt-0.5">
                    {b.forfald ? `Frist ${formatDateShort(b.forfald)}` : ''}
                    {b.betalt_dato
                      ? ` · Betalt ${formatDateShort(b.betalt_dato)}`
                      : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm text-[#2a2723] tabular-nums">
                    {formatDKK(b.beloeb)}
                  </span>
                  <BetalingStatusToggle
                    betalingId={b.id}
                    bryllupId={bryllupId}
                    status={b.status}
                  />
                  {admin && deleteMode ? (
                    <DeleteRowButton
                      onConfirm={() => handleDelete(b)}
                      label={
                        b.type
                          ? `${BETALING_TYPE_LABELS[b.type]} ${formatDKK(b.beloeb)}`
                          : `Betaling ${formatDKK(b.beloeb)}`
                      }
                      disabled={pending}
                    />
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
