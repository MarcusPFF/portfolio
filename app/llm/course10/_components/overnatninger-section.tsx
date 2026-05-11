'use client';

import { useOptimistic, useState, useTransition } from 'react';
import type { Overnatning } from '../_lib/types';
import {
  OVERNATNING_LABELS,
  formatDKK,
  formatDateShort,
} from '../_lib/formatting';
import { deleteOvernatning } from '../_actions/overnatninger';
import OvernatningAddForm from './overnatning-add-form';
import DeleteModeButton from './delete-mode-button';
import DeleteRowButton from './delete-row-button';

export default function OvernatningerSection({
  overnatninger,
  bryllupId,
  admin,
}: {
  overnatninger: Overnatning[];
  bryllupId: string;
  admin: boolean;
}) {
  const [deleteMode, setDeleteMode] = useState(false);
  const [pending, startTransition] = useTransition();
  const [visible, removeOptimistically] = useOptimistic<Overnatning[], string>(
    overnatninger,
    (current, idToRemove) => current.filter((o) => o.id !== idToRemove),
  );

  function handleDelete(o: Overnatning) {
    startTransition(async () => {
      removeOptimistically(o.id);
      await deleteOvernatning(o.id, bryllupId);
    });
  }

  return (
    <section className="mb-10">
      <div className="flex items-baseline justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-baseline gap-3">
          <h3 className="display text-2xl text-[#2a2723]">Overnatninger</h3>
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
          <OvernatningAddForm bryllupId={bryllupId} />
        </div>
      </div>
      <div className="bg-[#fffdf8] border border-[#dad3c4] rounded-lg px-5 py-4">
        {visible.length === 0 ? (
          <p className="text-sm text-[#75695b] italic py-2">
            Ingen overnatninger booket.
          </p>
        ) : (
          <ul className="divide-y divide-[#efe8d8]">
            {visible.map((o) => (
              <li
                key={o.id}
                className="py-3 flex items-start justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="text-sm text-[#2a2723]">
                    {o.type ? OVERNATNING_LABELS[o.type] : '—'}
                  </p>
                  <p className="text-[11px] text-[#75695b] mt-0.5">
                    {o.antal_personer ? `${o.antal_personer} pers.` : ''}
                    {o.fra_dato && o.til_dato
                      ? ` · ${formatDateShort(o.fra_dato)} → ${formatDateShort(o.til_dato)}`
                      : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm text-[#2a2723] tabular-nums">
                    {formatDKK(o.pris)}
                  </span>
                  {admin && deleteMode ? (
                    <DeleteRowButton
                      onConfirm={() => handleDelete(o)}
                      label={o.type ? OVERNATNING_LABELS[o.type] : 'Overnatning'}
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
