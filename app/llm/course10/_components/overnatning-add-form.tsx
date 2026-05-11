'use client';

import { useState, useTransition } from 'react';
import { createOvernatning } from '../_actions/overnatninger';
import { OVERNATNING_PROPERTIES } from '../_lib/formatting';
import type { OvernatningType } from '../_lib/types';

const PROPERTY_ORDER: OvernatningType[] = [
  'hospitalet',
  'hushovmesterboligen',
  'fiskerhuset',
  'grevindens_hus',
  'skovloeberhuset',
  'glamping',
];

const inputClasses =
  'w-full px-3 py-2 bg-[#fffdf8] border border-[#dad3c4] rounded-md text-sm text-[#2a2723] placeholder:text-[#a89b87] focus:outline-none focus:border-[#3d4a3a] focus:ring-1 focus:ring-[#3d4a3a]/30';

const labelClasses =
  'block text-[11px] font-medium tracking-[0.12em] uppercase text-[#75695b] mb-1.5';

export default function OvernatningAddForm({ bryllupId }: { bryllupId: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [selectedType, setSelectedType] = useState<OvernatningType>('hospitalet');

  function handleSubmit(fd: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createOvernatning(bryllupId, fd);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
      setSelectedType('hospitalet');
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs border border-[#3d4a3a] text-[#3d4a3a] rounded-md hover:bg-[#3d4a3a] hover:text-[#f0ede2] transition-colors"
      >
        + Tilføj overnatning
      </button>
    );
  }

  const selectedProperty = OVERNATNING_PROPERTIES[selectedType];

  return (
    <form
      action={handleSubmit}
      className="bg-[#fffdf8] border border-[#3d4a3a]/40 rounded-lg p-5 space-y-4 w-full max-w-md"
    >
      <div>
        <label htmlFor="type" className={labelClasses}>
          Ejendom
        </label>
        <select
          id="type"
          name="type"
          required
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as OvernatningType)}
          className={inputClasses}
        >
          {PROPERTY_ORDER.map((key) => (
            <option key={key} value={key}>
              {OVERNATNING_PROPERTIES[key].label}
            </option>
          ))}
        </select>
        <p className="text-[11px] text-[#75695b] italic mt-1.5">
          {selectedProperty.description}
          {selectedProperty.maxGuests
            ? ` (maks ${selectedProperty.maxGuests} personer)`
            : ''}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="antal_personer" className={labelClasses}>
            Personer
          </label>
          <input
            id="antal_personer"
            name="antal_personer"
            type="number"
            min={1}
            max={50}
            className={inputClasses}
            placeholder="2"
          />
        </div>
        <div>
          <label htmlFor="pris" className={labelClasses}>
            Pris (kr.)
          </label>
          <input
            id="pris"
            name="pris"
            type="number"
            min={0}
            max={200000}
            step={100}
            className={inputClasses}
            placeholder="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="fra_dato" className={labelClasses}>
            Fra dato
          </label>
          <input
            id="fra_dato"
            name="fra_dato"
            type="date"
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="til_dato" className={labelClasses}>
            Til dato
          </label>
          <input
            id="til_dato"
            name="til_dato"
            type="date"
            className={inputClasses}
          />
        </div>
      </div>

      {error ? (
        <div className="bg-[#e9d4cd] border border-[#c89a8e] text-[#7a3327] px-3 py-2 rounded-md text-xs">
          {error}
        </div>
      ) : null}

      <div className="flex items-center gap-2 pt-2 border-t border-[#dad3c4]">
        <button
          type="submit"
          disabled={pending}
          className="px-4 py-1.5 bg-[#3d4a3a] text-[#f0ede2] rounded-md text-xs font-medium hover:bg-[#2e3a2c] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {pending ? 'Tilføjer…' : 'Tilføj overnatning'}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          className="px-4 py-1.5 text-xs text-[#2a2723] hover:bg-[#dad3c4]/40 rounded-md transition-colors"
        >
          Annullér
        </button>
      </div>
    </form>
  );
}
