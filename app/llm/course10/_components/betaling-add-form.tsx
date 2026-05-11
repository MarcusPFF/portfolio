'use client';

import { useState, useTransition } from 'react';
import { createBetaling } from '../_actions/betalinger';
import { BETALING_TYPE_LABELS } from '../_lib/formatting';
import type { BetalingType } from '../_lib/types';

const TYPE_ORDER: BetalingType[] = ['depositum', 'slutbetaling', 'tilkoeb'];

const inputClasses =
  'w-full px-3 py-2 bg-[#fffdf8] border border-[#dad3c4] rounded-md text-sm text-[#2a2723] placeholder:text-[#a89b87] focus:outline-none focus:border-[#3d4a3a] focus:ring-1 focus:ring-[#3d4a3a]/30';

const labelClasses =
  'block text-[11px] font-medium tracking-[0.12em] uppercase text-[#75695b] mb-1.5';

export default function BetalingAddForm({ bryllupId }: { bryllupId: string }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(fd: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createBetaling(bryllupId, fd);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(false);
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-xs border border-[#3d4a3a] text-[#3d4a3a] rounded-md hover:bg-[#3d4a3a] hover:text-[#f0ede2] transition-colors"
      >
        + Registrér betaling
      </button>
    );
  }

  return (
    <form
      action={handleSubmit}
      className="bg-[#fffdf8] border border-[#3d4a3a]/40 rounded-lg p-5 space-y-4 w-full max-w-md"
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="bet_type" className={labelClasses}>
            Type
          </label>
          <select
            id="bet_type"
            name="type"
            required
            defaultValue="depositum"
            className={inputClasses}
          >
            {TYPE_ORDER.map((t) => (
              <option key={t} value={t}>
                {BETALING_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="bet_beloeb" className={labelClasses}>
            Beløb (kr.)
          </label>
          <input
            id="bet_beloeb"
            name="beloeb"
            type="number"
            min={1}
            max={5000000}
            step={1}
            required
            className={inputClasses}
            placeholder="50000"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="bet_forfald" className={labelClasses}>
            Forfald
          </label>
          <input
            id="bet_forfald"
            name="forfald"
            type="date"
            className={inputClasses}
          />
        </div>
        <div>
          <label htmlFor="bet_betalt_dato" className={labelClasses}>
            Betalt dato
          </label>
          <input
            id="bet_betalt_dato"
            name="betalt_dato"
            type="date"
            className={inputClasses}
          />
          <p className="text-[11px] text-[#75695b] italic mt-1">
            Hvis udfyldt sættes status automatisk til Betalt.
          </p>
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
          {pending ? 'Registrerer…' : 'Registrér betaling'}
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
