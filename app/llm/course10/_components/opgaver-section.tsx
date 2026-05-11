'use client';

import { useOptimistic, useState, useTransition } from 'react';
import type { Opgave } from '../_lib/types';
import { KATEGORI_LABELS, formatDateShort } from '../_lib/formatting';
import { deleteOpgave } from '../_actions/opgaver';
import OpgaveStatusToggle from './opgave-status-toggle';
import SuggestTasksPanel from './suggest-tasks-panel';
import DeleteModeButton from './delete-mode-button';
import DeleteRowButton from './delete-row-button';

export default function OpgaverSection({
  opgaver,
  bryllupId,
  bryllupsdato,
  admin,
}: {
  opgaver: Opgave[];
  bryllupId: string;
  bryllupsdato: string;
  admin: boolean;
}) {
  const [deleteMode, setDeleteMode] = useState(false);
  const [pending, startTransition] = useTransition();
  const [visible, removeOptimistically] = useOptimistic<Opgave[], string>(
    opgaver,
    (current, idToRemove) => current.filter((o) => o.id !== idToRemove),
  );

  function handleDelete(opgave: Opgave) {
    startTransition(async () => {
      removeOptimistically(opgave.id);
      await deleteOpgave(opgave.id, bryllupId);
    });
  }

  return (
    <section className="mb-10">
      <div className="flex items-baseline justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-baseline gap-3">
          <h3 className="display text-2xl text-[#2a2723]">Opgaver</h3>
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
          <SuggestTasksPanel bryllupId={bryllupId} bryllupsdato={bryllupsdato} />
        </div>
      </div>
      <div className="bg-[#fffdf8] border border-[#dad3c4] rounded-lg px-5 py-4">
        {visible.length === 0 ? (
          <p className="text-sm text-[#75695b] italic py-2">
            Ingen opgaver endnu.
          </p>
        ) : (
          <ul className="divide-y divide-[#efe8d8]">
            {visible.map((o) => (
              <li
                key={o.id}
                className="py-3 flex items-start justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="text-sm text-[#2a2723]">{o.titel}</p>
                  <p className="text-[11px] text-[#75695b] mt-0.5">
                    {o.kategori ? KATEGORI_LABELS[o.kategori] : 'Andet'}
                    {o.deadline ? ` · Frist ${formatDateShort(o.deadline)}` : ''}
                    {o.ansvarlig ? ` · ${o.ansvarlig}` : ''}
                    {o.ai_genereret ? ' · ✦ AI-forslag' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <OpgaveStatusToggle
                    opgaveId={o.id}
                    bryllupId={bryllupId}
                    status={o.status}
                  />
                  {admin && deleteMode ? (
                    <DeleteRowButton
                      onConfirm={() => handleDelete(o)}
                      label={o.titel}
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
