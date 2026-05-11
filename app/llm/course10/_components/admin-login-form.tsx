'use client';

import { useActionState } from 'react';
import { loginAdmin, type AdminLoginState } from '../_actions/admin';

const inputClasses =
  'w-full px-3 py-2 bg-[#fffdf8] border border-[#dad3c4] rounded-md text-sm text-[#2a2723] placeholder:text-[#a89b87] focus:outline-none focus:border-[#3d4a3a] focus:ring-1 focus:ring-[#3d4a3a]/30';

export default function AdminLoginForm() {
  const [state, formAction, pending] = useActionState<AdminLoginState, FormData>(
    loginAdmin,
    { status: 'idle' },
  );

  const error = state.status === 'error' ? state.message : null;

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label
          htmlFor="password"
          className="block text-[11px] font-medium tracking-[0.12em] uppercase text-[#75695b] mb-1.5"
        >
          Admin-kode
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          className={inputClasses}
        />
        {error ? (
          <p className="text-xs text-[#7a3327] mt-2">{error}</p>
        ) : null}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full px-5 py-2 bg-[#3d4a3a] text-[#f0ede2] rounded-md text-sm font-medium hover:bg-[#2e3a2c] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {pending ? 'Logger ind…' : 'Log ind'}
      </button>
    </form>
  );
}
