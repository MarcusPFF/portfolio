'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import {
  clearAdminCookie,
  isAdmin,
  isAdminConfigured,
  setAdminCookie,
  verifyAdminPassword,
} from '../_lib/admin-auth';
import { getSupabase } from '../_lib/supabase';
import { isLoginRateLimited } from '../_lib/rate-limit';
import { isUuid } from '../_lib/validation';
import { clientIp } from '../_lib/request';
import { logAudit } from '../_lib/audit';
import {
  SEED_BRYLLUPPER,
  SEED_BETALINGER,
  SEED_OPGAVER,
  SEED_OVERNATNINGER,
  SEED_TILKOEB,
} from '../_lib/seed-data';

export type AdminLoginState =
  | { status: 'idle' }
  | { status: 'error'; message: string };

export async function loginAdmin(
  _prev: AdminLoginState,
  fd: FormData,
): Promise<AdminLoginState> {
  if (!isAdminConfigured()) {
    return {
      status: 'error',
      message: 'Admin er ikke konfigureret. Tilføj ENGESTOFTE_ADMIN_PASSWORD i .env.local.',
    };
  }
  const ip = await clientIp();
  if (isLoginRateLimited(ip)) {
    await logAudit({
      event: 'admin.login_failure',
      actor: 'anon',
      ip,
      details: { reason: 'rate_limited' },
    });
    return {
      status: 'error',
      message: 'For mange forsøg. Vent et minut og prøv igen.',
    };
  }
  const raw = fd.get('password');
  const password = typeof raw === 'string' ? raw : '';
  if (!verifyAdminPassword(password)) {
    await logAudit({
      event: 'admin.login_failure',
      actor: 'anon',
      ip,
      details: { reason: 'wrong_password' },
    });
    return { status: 'error', message: 'Forkert kode.' };
  }
  await setAdminCookie(password);
  await logAudit({ event: 'admin.login_success', actor: 'admin', ip });
  redirect('/llm/course10/admin');
}

export async function logoutAdmin(): Promise<void> {
  const ip = await clientIp();
  await clearAdminCookie();
  await logAudit({ event: 'admin.logout', actor: 'admin', ip });
  redirect('/llm/course10');
}

function revalidateAll() {
  revalidatePath('/llm/course10', 'layout');
}

function omitSlug<T extends { slug: string }>(obj: T): Omit<T, 'slug'> {
  const copy = { ...obj } as Record<string, unknown>;
  delete copy.slug;
  return copy as Omit<T, 'slug'>;
}

function omitBryllupSlug<T extends { bryllup_slug: string }>(
  obj: T,
): Omit<T, 'bryllup_slug'> {
  const copy = { ...obj } as Record<string, unknown>;
  delete copy.bryllup_slug;
  return copy as Omit<T, 'bryllup_slug'>;
}

export type ResetResult = {
  ok: boolean;
  message: string;
};

export async function resetToSeed(): Promise<ResetResult> {
  if (!(await isAdmin())) {
    return { ok: false, message: 'Ikke autoriseret.' };
  }

  const supabase = getSupabase();

  // Slet alt bestående demo-data. opgaver, tilkøb, betalinger og overnatninger
  // forsvinder automatisk via ON DELETE CASCADE. Supabase JS client kræver en
  // filter på .delete(), så vi bruger "id er ikke null" som match-alle.
  const { error: deleteError } = await supabase
    .from('bryllupper')
    .delete()
    .not('id', 'is', null);
  if (deleteError) {
    return { ok: false, message: `Kunne ikke nulstille: ${deleteError.message}` };
  }

  const { data: inserted, error: insertError } = await supabase
    .from('bryllupper')
    .insert(SEED_BRYLLUPPER.map(omitSlug))
    .select('id, brudepar');
  if (insertError || !inserted) {
    return {
      ok: false,
      message: `Kunne ikke indsætte bryllupper: ${insertError?.message ?? 'ukendt fejl'}`,
    };
  }

  const idBySlug = new Map<string, string>();
  for (const row of inserted) {
    const seed = SEED_BRYLLUPPER.find((s) => s.brudepar === row.brudepar);
    if (seed) idBySlug.set(seed.slug, row.id);
  }

  const opgaver = SEED_OPGAVER.flatMap((o) => {
    const bryllup_id = idBySlug.get(o.bryllup_slug);
    return bryllup_id ? [{ ...omitBryllupSlug(o), bryllup_id }] : [];
  });
  if (opgaver.length > 0) {
    const { error } = await supabase.from('opgaver').insert(opgaver);
    if (error) return { ok: false, message: `Opgaver: ${error.message}` };
  }

  const tilkoeb = SEED_TILKOEB.flatMap((t) => {
    const bryllup_id = idBySlug.get(t.bryllup_slug);
    return bryllup_id ? [{ ...omitBryllupSlug(t), bryllup_id }] : [];
  });
  if (tilkoeb.length > 0) {
    const { error } = await supabase.from('tilkoeb').insert(tilkoeb);
    if (error) return { ok: false, message: `Tilkøb: ${error.message}` };
  }

  const betalinger = SEED_BETALINGER.flatMap((b) => {
    const bryllup_id = idBySlug.get(b.bryllup_slug);
    return bryllup_id ? [{ ...omitBryllupSlug(b), bryllup_id }] : [];
  });
  if (betalinger.length > 0) {
    const { error } = await supabase.from('betalinger').insert(betalinger);
    if (error) return { ok: false, message: `Betalinger: ${error.message}` };
  }

  const overnatninger = SEED_OVERNATNINGER.flatMap((o) => {
    const bryllup_id = idBySlug.get(o.bryllup_slug);
    return bryllup_id ? [{ ...omitBryllupSlug(o), bryllup_id }] : [];
  });
  if (overnatninger.length > 0) {
    const { error } = await supabase.from('overnatninger').insert(overnatninger);
    if (error) return { ok: false, message: `Overnatninger: ${error.message}` };
  }

  revalidateAll();
  await logAudit({
    event: 'admin.reset_to_seed',
    actor: 'admin',
    ip: await clientIp(),
    details: {
      weddings: inserted.length,
      opgaver: opgaver.length,
      tilkoeb: tilkoeb.length,
      betalinger: betalinger.length,
      overnatninger: overnatninger.length,
    },
  });
  return {
    ok: true,
    message: `Nulstillet · ${inserted.length} bryllupper, ${opgaver.length} opgaver, ${tilkoeb.length} tilkøb, ${betalinger.length} betalinger, ${overnatninger.length} overnatninger.`,
  };
}

export async function deleteBryllup(id: string): Promise<void> {
  if (!(await isAdmin())) {
    redirect('/llm/course10/admin/login');
  }
  if (!isUuid(id)) {
    redirect('/llm/course10/bryllupper');
  }
  const supabase = getSupabase();
  const { data: bryllup } = await supabase
    .from('bryllupper')
    .select('brudepar, bryllupsdato')
    .eq('id', id)
    .maybeSingle();
  await supabase.from('bryllupper').delete().eq('id', id);
  await logAudit({
    event: 'admin.delete_wedding',
    actor: 'admin',
    ip: await clientIp(),
    bryllupId: id,
    details: bryllup
      ? { brudepar: bryllup.brudepar, bryllupsdato: bryllup.bryllupsdato }
      : undefined,
  });
  revalidateAll();
  redirect('/llm/course10/bryllupper');
}
