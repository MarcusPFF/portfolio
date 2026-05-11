'use client';

import { useOptimistic, useState, useTransition } from 'react';
import type { Tilkoeb } from '../_lib/types';
import { TILKOEB_LABELS, formatDKK } from '../_lib/formatting';
import { deleteTilkoeb } from '../_actions/tilkoeb';
import TilkoebStatusToggle from './tilkoeb-status-toggle';
import SuggestTilkoebPanel from './suggest-tilkoeb-panel';
import DeleteModeButton from './delete-mode-button';
import DeleteRowButton from './delete-row-button';

export default function TilkoebSection({
  tilkoeb,
  bryllupId,
  admin,
}: {
  tilkoeb: Tilkoeb[];
  bryllupId: string;
  admin: boolean;
}) {
  const [deleteMode, setDeleteMode] = useState(false);
  const [pending, startTransition] = useTransition();
  const [visible, removeOptimistically] = useOptimistic<Tilkoeb[], string>(
    tilkoeb,
    (current, idToRemove) => current.filter((t) => t.id !== idToRemove),
  );

  function handleDelete(t: Tilkoeb) {
    startTransition(async () => {
      removeOptimistically(t.id);
      await deleteTilkoeb(t.id, bryllupId);
    });
  }

  return (
    <section className="mb-10">
      <div className="flex items-baseline justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-baseline gap-3">
          <h3 className="display text-2xl text-[#2a2723]">Tilkøb</h3>
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
          <SuggestTilkoebPanel bryllupId={bryllupId} />
        </div>
      </div>
      <div className="bg-[#fffdf8] border border-[#dad3c4] rounded-lg px-5 py-4">
        {visible.length === 0 ? (
          <p className="text-sm text-[#75695b] italic py-2">
            Ingen tilkøb endnu.
          </p>
        ) : (
          <ul className="divide-y divide-[#efe8d8]">
            {visible.map((t) => (
              <li
                key={t.id}
                className="py-3 flex items-start justify-between gap-4"
              >
                <div className="min-w-0">
                  <p className="text-sm text-[#2a2723]">
                    {TILKOEB_LABELS[t.type]}
                  </p>
                  {t.beskrivelse ? (
                    <p className="text-[11px] text-[#75695b] mt-0.5">
                      {t.beskrivelse}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm text-[#2a2723]">
                    {formatDKK(t.pris)}
                  </span>
                  <TilkoebStatusToggle
                    tilkoebId={t.id}
                    bryllupId={bryllupId}
                    status={t.status}
                  />
                  {admin && deleteMode ? (
                    <DeleteRowButton
                      onConfirm={() => handleDelete(t)}
                      label={TILKOEB_LABELS[t.type]}
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
