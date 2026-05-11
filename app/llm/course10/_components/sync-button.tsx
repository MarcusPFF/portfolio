'use client';

import { useState, useTransition } from 'react';
import {
  syncFromTrelloAction,
  uploadToTrelloAction,
  type SyncActionResult,
} from '../_actions/sync';
import { formatDate } from '../_lib/formatting';

export type SyncVariant = 'download' | 'upload';

type VariantConfig = {
  label: string;
  pendingLabel: string;
  action: () => Promise<SyncActionResult>;
  buttonClass: string;
  iconBefore?: string;
  confirmMessage: string | null;
};

const VARIANTS: Record<SyncVariant, VariantConfig> = {
  download: {
    label: 'Hent fra Trello',
    pendingLabel: 'Henter…',
    action: syncFromTrelloAction,
    buttonClass:
      'bg-[#3d4a3a] text-[#f0ede2] hover:bg-[#2e3a2c] disabled:bg-[#3d4a3a]/60',
    iconBefore: '↓',
    confirmMessage: null,
  },
  upload: {
    label: 'Upload til Trello',
    pendingLabel: 'Uploader…',
    action: uploadToTrelloAction,
    buttonClass:
      'bg-[#b08a3e] text-[#f7f3ec] hover:bg-[#8e6f30] disabled:bg-[#b08a3e]/60',
    iconBefore: '↑',
    confirmMessage:
      'Upload synkroniserer Supabase-data til Trello-boardet. Eventuelle manuelle ændringer i Trello kan blive overskrevet. Fortsæt?',
  },
};

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffSec = Math.round((now - then) / 1000);
  if (diffSec < 60) return 'lige nu';
  if (diffSec < 3600) return `for ${Math.floor(diffSec / 60)} min siden`;
  if (diffSec < 86400) return `for ${Math.floor(diffSec / 3600)} timer siden`;
  return formatDate(iso, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function SyncButton({
  variant,
  lastSyncedAt,
}: {
  variant: SyncVariant;
  lastSyncedAt: string | null;
}) {
  const config = VARIANTS[variant];
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<SyncActionResult | null>(null);

  function handleClick() {
    if (config.confirmMessage && !confirm(config.confirmMessage)) return;
    setResult(null);
    startTransition(async () => {
      const res = await config.action();
      setResult(res);
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={handleClick}
          disabled={pending}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium disabled:cursor-not-allowed transition-colors ${config.buttonClass}`}
        >
          {pending ? (
            <>
              <Spinner /> {config.pendingLabel}
            </>
          ) : (
            <>
              {config.iconBefore ? (
                <span aria-hidden className="text-base leading-none">
                  {config.iconBefore}
                </span>
              ) : null}
              {config.label}
            </>
          )}
        </button>
        {lastSyncedAt ? (
          <span className="text-xs text-[#75695b]">
            Sidst {variant === 'download' ? 'hentet' : 'uploadet'}{' '}
            {formatRelative(lastSyncedAt)}
          </span>
        ) : (
          <span className="text-xs text-[#a89b87]">
            Aldrig {variant === 'download' ? 'hentet' : 'uploadet'}
          </span>
        )}
      </div>

      {result && result.ok ? (
        <div className="bg-[#e7e9d8] border border-[#a8b094] text-[#3d4a3a] px-4 py-3 rounded-md text-xs space-y-1">
          <p className="font-medium">
            ✓ {variant === 'download' ? 'Hentet' : 'Uploadet'} på{' '}
            {(result.duration_ms / 1000).toFixed(1)}s.
          </p>
          <p>
            Bryllupper: {result.weddings.created} oprettet,{' '}
            {result.weddings.updated} opdateret. Opgaver:{' '}
            {result.tasks.created} oprettet, {result.tasks.updated} opdateret.
          </p>
          {result.warnings.length > 0 ? (
            <details className="mt-2">
              <summary className="cursor-pointer text-[#7a5a1e]">
                {result.warnings.length} advarsler
              </summary>
              <ul className="mt-2 ml-4 list-disc space-y-0.5 text-[11px] text-[#75695b]">
                {result.warnings.slice(0, 10).map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
                {result.warnings.length > 10 ? (
                  <li className="italic">
                    … og {result.warnings.length - 10} flere
                  </li>
                ) : null}
              </ul>
            </details>
          ) : null}
        </div>
      ) : null}

      {result && !result.ok ? (
        <div className="bg-[#e9d4cd] border border-[#c89a8e] text-[#7a3327] px-4 py-3 rounded-md text-xs">
          {result.error}
        </div>
      ) : null}
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
