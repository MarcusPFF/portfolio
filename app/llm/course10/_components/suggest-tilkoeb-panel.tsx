'use client';

import { useState, useTransition } from 'react';
import {
  approveSuggestedTilkoeb,
  generateTilkoebSuggestions,
} from '../_actions/ai';
import type { SuggestedTilkoeb } from '../_lib/ai/suggest-tilkoeb';
import { TILKOEB_LABELS, formatDKK } from '../_lib/formatting';

type Row = SuggestedTilkoeb & {
  selected: boolean;
  customBeskrivelse: string;
  customPris: string; // string for input control; converted on submit
};

export default function SuggestTilkoebPanel({ bryllupId }: { bryllupId: string }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleGenerate() {
    setError(null);
    setInfo(null);
    startTransition(async () => {
      const result = await generateTilkoebSuggestions(bryllupId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setRows(
        result.tilkoeb.map((t) => ({
          ...t,
          selected: true,
          customBeskrivelse: t.beskrivelse,
          customPris: String(t.pris),
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
    const items: { type: string; beskrivelse: string; pris: number }[] = [];
    for (const r of rows) {
      if (!r.selected) continue;
      const pris = Number(r.customPris);
      if (!Number.isFinite(pris) || pris < 0) {
        setError(`Ugyldig pris på "${r.customBeskrivelse || TILKOEB_LABELS[r.type]}"`);
        return;
      }
      items.push({
        type: r.type,
        beskrivelse: r.customBeskrivelse || r.beskrivelse,
        pris: Math.round(pris),
      });
    }
    if (items.length === 0) {
      setError('Vælg mindst ét tilkøb før godkendelse.');
      return;
    }
    startTransition(async () => {
      const result = await approveSuggestedTilkoeb(bryllupId, items);
      if (!result.ok) {
        setError(result.error ?? 'Kunne ikke gemme tilkøbene.');
        return;
      }
      setInfo(`Tilføjede ${result.inserted} forslag som "forespurgt".`);
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

  function setRowBeskrivelse(idx: number, beskrivelse: string) {
    setRows((prev) =>
      prev
        ? prev.map((r, i) =>
            i === idx ? { ...r, customBeskrivelse: beskrivelse } : r,
          )
        : null,
    );
  }

  function setRowPris(idx: number, pris: string) {
    setRows((prev) =>
      prev
        ? prev.map((r, i) => (i === idx ? { ...r, customPris: pris } : r))
        : null,
    );
  }

  const selectedCount = rows?.filter((r) => r.selected).length ?? 0;
  const totalEstimate = rows
    ? rows
        .filter((r) => r.selected)
        .reduce((sum, r) => sum + (Number(r.customPris) || 0), 0)
    : 0;

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
        {info ? <span className="text-xs text-[#3d4a3a]">{info}</span> : null}
        {error ? <span className="text-xs text-[#7a3327]">{error}</span> : null}
      </div>
    );
  }

  return (
    <div className="mt-4 bg-[#fffdf8] border border-[#3d4a3a]/40 rounded-lg overflow-hidden">
      <div className="px-5 py-3 bg-[#3d4a3a]/5 border-b border-[#3d4a3a]/20 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="display text-base text-[#2a2723]">AI-forslag til pitch</p>
          <p className="text-[11px] text-[#75695b]">
            {selectedCount} af {rows.length} valgt · estimat{' '}
            {formatDKK(totalEstimate)}. Tilpas beskrivelse og pris, klik godkend.
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
              className="mt-2 w-4 h-4 accent-[#3d4a3a] shrink-0"
              aria-label={`Vælg ${TILKOEB_LABELS[row.type]}`}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded-full border bg-[#efe8d8] text-[#6b6358] border-[#dad3c4]">
                  {TILKOEB_LABELS[row.type]}
                </span>
              </div>
              <input
                type="text"
                value={row.customBeskrivelse}
                onChange={(e) => setRowBeskrivelse(idx, e.target.value)}
                disabled={!row.selected}
                maxLength={200}
                placeholder="Beskrivelse til brudeparret"
                className="w-full px-2 py-1 text-sm text-[#2a2723] bg-transparent border-b border-transparent hover:border-[#dad3c4] focus:border-[#3d4a3a] focus:outline-none disabled:cursor-not-allowed"
              />
              {row.begrundelse ? (
                <p className="text-[11px] text-[#a89b87] italic mt-0.5 px-2">
                  {row.begrundelse}
                </p>
              ) : null}
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <div className="flex items-center gap-1 text-sm">
                <input
                  type="number"
                  value={row.customPris}
                  onChange={(e) => setRowPris(idx, e.target.value)}
                  disabled={!row.selected}
                  min={0}
                  max={500000}
                  step={100}
                  className="w-24 px-2 py-1 text-right bg-[#fffdf8] border border-[#dad3c4] rounded-md text-sm text-[#2a2723] focus:outline-none focus:border-[#3d4a3a] disabled:cursor-not-allowed"
                />
                <span className="text-[#75695b] text-xs">kr.</span>
              </div>
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
