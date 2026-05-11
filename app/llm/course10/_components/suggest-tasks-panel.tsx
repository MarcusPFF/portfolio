'use client';

import { useState, useTransition } from 'react';
import {
  approveSuggestedTasks,
  generateTaskSuggestions,
} from '../_actions/ai';
import type { SuggestedTask } from '../_lib/ai/suggest-tasks';
import {
  KATEGORI_LABELS,
  formatDateShort,
} from '../_lib/formatting';

type Row = SuggestedTask & {
  selected: boolean;
  customTitel: string;
};

export default function SuggestTasksPanel({
  bryllupId,
  bryllupsdato,
}: {
  bryllupId: string;
  bryllupsdato: string;
}) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleGenerate() {
    setError(null);
    setInfo(null);
    startTransition(async () => {
      const result = await generateTaskSuggestions(bryllupId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setRows(
        result.tasks.map((t) => ({
          ...t,
          selected: true,
          customTitel: t.titel,
        })),
      );
    });
  }

  function handleCancel() {
    setRows(null);
    setError(null);
  }

  function handleApprove() {
    if (!rows) return;
    setError(null);
    const selected = rows
      .filter((r) => r.selected)
      .map((r) => ({
        titel: r.customTitel || r.titel,
        kategori: r.kategori,
        dage_foer_bryllup: r.dage_foer_bryllup,
      }));
    if (selected.length === 0) {
      setError('Vælg mindst én opgave før godkendelse.');
      return;
    }
    startTransition(async () => {
      const result = await approveSuggestedTasks(bryllupId, selected);
      if (!result.ok) {
        setError(result.error ?? 'Kunne ikke gemme opgaverne.');
        return;
      }
      setInfo(`Tilføjede ${result.inserted} AI-foreslåede opgaver.`);
      setRows(null);
    });
  }

  function toggleRow(idx: number) {
    setRows((prev) =>
      prev
        ? prev.map((r, i) => (i === idx ? { ...r, selected: !r.selected } : r))
        : null,
    );
  }

  function setRowTitel(idx: number, titel: string) {
    setRows((prev) =>
      prev
        ? prev.map((r, i) => (i === idx ? { ...r, customTitel: titel } : r))
        : null,
    );
  }

  function computeDeadline(daysBefore: number): string {
    const d = new Date(bryllupsdato + 'T00:00:00Z');
    d.setUTCDate(d.getUTCDate() - daysBefore);
    return d.toISOString().slice(0, 10);
  }

  const selectedCount = rows?.filter((r) => r.selected).length ?? 0;

  if (rows === null) {
    return (
      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={pending}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs border border-[#3d4a3a] text-[#3d4a3a] rounded-md hover:bg-[#3d4a3a] hover:text-[#f0ede2] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {pending ? (
            <>
              <Spinner /> Genererer forslag…
            </>
          ) : (
            <>✦ Generér AI-forslag</>
          )}
        </button>
        {info ? (
          <span className="text-xs text-[#3d4a3a]">{info}</span>
        ) : null}
        {error ? (
          <span className="text-xs text-[#7a3327]">{error}</span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mt-4 bg-[#fffdf8] border border-[#3d4a3a]/40 rounded-lg overflow-hidden">
      <div className="px-5 py-3 bg-[#3d4a3a]/5 border-b border-[#3d4a3a]/20 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="display text-base text-[#2a2723]">AI-forslag</p>
          <p className="text-[11px] text-[#75695b]">
            {selectedCount} af {rows.length} valgt. Klik for at fra-vælge, rediger
            titlen ved behov.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCancel}
            disabled={pending}
            className="px-3 py-1.5 text-xs text-[#2a2723] hover:bg-[#dad3c4]/40 rounded-md transition-colors"
          >
            Annullér
          </button>
          <button
            type="button"
            onClick={handleApprove}
            disabled={pending || selectedCount === 0}
            className="px-3 py-1.5 text-xs bg-[#3d4a3a] text-[#f0ede2] rounded-md hover:bg-[#2e3a2c] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {pending ? 'Gemmer…' : `Godkend valgte (${selectedCount})`}
          </button>
        </div>
      </div>

      {error ? (
        <div className="px-5 py-2 bg-[#e9d4cd] text-[#7a3327] text-xs">
          {error}
        </div>
      ) : null}

      <ul className="divide-y divide-[#efe8d8]">
        {rows.map((row, idx) => (
          <li
            key={idx}
            className={`px-5 py-3 flex items-start gap-3 ${
              row.selected ? '' : 'opacity-50'
            }`}
          >
            <input
              type="checkbox"
              checked={row.selected}
              onChange={() => toggleRow(idx)}
              className="mt-1.5 w-4 h-4 accent-[#3d4a3a] shrink-0"
              aria-label={`Vælg "${row.titel}"`}
            />
            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={row.customTitel}
                onChange={(e) => setRowTitel(idx, e.target.value)}
                disabled={!row.selected}
                maxLength={120}
                className="w-full px-2 py-1 text-sm text-[#2a2723] bg-transparent border-b border-transparent hover:border-[#dad3c4] focus:border-[#3d4a3a] focus:outline-none disabled:cursor-not-allowed"
              />
              <p className="text-[11px] text-[#75695b] mt-0.5 px-2">
                {KATEGORI_LABELS[row.kategori]} · Frist{' '}
                {formatDateShort(computeDeadline(row.dage_foer_bryllup))} ·{' '}
                {row.dage_foer_bryllup} dage før
              </p>
              {row.begrundelse ? (
                <p className="text-[11px] text-[#a89b87] italic mt-0.5 px-2">
                  {row.begrundelse}
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Spinner() {
  return (
    <span
      className="inline-block w-3 h-3 border-2 border-current border-r-transparent rounded-full animate-spin"
      aria-hidden
    />
  );
}
