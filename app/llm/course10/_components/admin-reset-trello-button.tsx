'use client';

import { useState, useTransition } from 'react';
import {
  resetTrelloBoardAction,
  type ResetTrelloResult,
} from '../_actions/sync';

export default function AdminResetTrelloButton() {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ResetTrelloResult | null>(null);

  function handleClick() {
    const ok = confirm(
      'Arkivér ALLE lister på Trello-boardet (også eventuelle der ikke er bryllupper)? trello_list_id og trello_card_id ryddes i Supabase, så næste upload starter friskt.',
    );
    if (!ok) return;
    startTransition(async () => {
      const res = await resetTrelloBoardAction();
      setResult(res);
    });
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="inline-flex items-center gap-2 px-4 py-2 bg-[#7a3327] text-[#f0ede2] rounded-md text-sm font-medium hover:bg-[#6a2c22] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {pending ? 'Arkiverer…' : 'Reset Trello board'}
      </button>
      {result ? (
        <p
          className={`text-xs ${
            result.ok ? 'text-[#3d4a3a]' : 'text-[#7a3327]'
          }`}
        >
          {result.ok
            ? `Arkiverede ${result.lists_archived} lister. trello_list_id og trello_card_id ryddet.`
            : result.error}
        </p>
      ) : null}
    </div>
  );
}
