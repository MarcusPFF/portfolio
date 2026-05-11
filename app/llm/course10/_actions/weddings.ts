'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getSupabase } from '../_lib/supabase';
import { isMutationRateLimited } from '../_lib/rate-limit';
import { isUuid } from '../_lib/validation';
import { clientIp } from '../_lib/request';
import { getAuditContext, logAudit } from '../_lib/audit';
import type {
  BryllupStatus,
  Koordinator,
  Lokation,
  Pakke,
  Vielsestype,
} from '../_lib/types';

const MAX_NOTER_LENGTH = 2000;

const STATUS_VALUES: BryllupStatus[] = [
  'forespoergsel',
  'tilbud_sendt',
  'booket',
  'afholdt',
  'aflyst',
];
const PAKKE_VALUES: Pakke[] = ['grundpakke', 'festpakke'];
const LOKATION_VALUES: Lokation[] = ['den_gamle_lade', 'vaerkstedet'];
const VIELSESTYPE_VALUES: Vielsestype[] = [
  'engestofte_kirke',
  'maribo_domkirke',
  'park',
  'borgerlig',
  'ingen',
];
const KOORDINATOR_VALUES: Koordinator[] = ['johan', 'lise'];

export type WeddingFormErrors = {
  brudepar?: string;
  bryllupsdato?: string;
  antal_kuverter?: string;
  pakke?: string;
  lokation?: string;
  vielsestype?: string;
  koordinator?: string;
  status?: string;
  kontakt_email?: string;
  general?: string;
};

export type WeddingFormState =
  | { status: 'idle' }
  | { status: 'error'; errors: WeddingFormErrors };

function str(fd: FormData, key: string): string | null {
  const v = fd.get(key);
  if (typeof v !== 'string') return null;
  const trimmed = v.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function pickEnum<T extends string>(value: string | null, allowed: T[]): T | null {
  if (!value) return null;
  return allowed.includes(value as T) ? (value as T) : null;
}

function validate(fd: FormData) {
  const errors: WeddingFormErrors = {};

  const brudepar = str(fd, 'brudepar');
  if (!brudepar) errors.brudepar = 'Påkrævet';
  else if (brudepar.length > 120) errors.brudepar = 'Maks 120 tegn';

  const bryllupsdatoRaw = str(fd, 'bryllupsdato');
  if (!bryllupsdatoRaw) {
    errors.bryllupsdato = 'Påkrævet';
  } else if (!/^\d{4}-\d{2}-\d{2}$/.test(bryllupsdatoRaw)) {
    errors.bryllupsdato = 'Skal være en gyldig dato';
  } else if (Number.isNaN(new Date(bryllupsdatoRaw).getTime())) {
    errors.bryllupsdato = 'Ugyldig dato';
  }

  const kuverterRaw = str(fd, 'antal_kuverter');
  let antal_kuverter: number | null = null;
  if (kuverterRaw) {
    const n = Number(kuverterRaw);
    if (!Number.isInteger(n) || n < 1 || n > 500) {
      errors.antal_kuverter = 'Skal være et helt tal mellem 1 og 500';
    } else {
      antal_kuverter = n;
    }
  }

  const pakkeRaw = str(fd, 'pakke');
  if (pakkeRaw && !PAKKE_VALUES.includes(pakkeRaw as Pakke)) {
    errors.pakke = 'Ugyldigt valg';
  }

  const lokationRaw = str(fd, 'lokation');
  if (lokationRaw && !LOKATION_VALUES.includes(lokationRaw as Lokation)) {
    errors.lokation = 'Ugyldigt valg';
  }

  const vielsestypeRaw = str(fd, 'vielsestype');
  if (
    vielsestypeRaw &&
    !VIELSESTYPE_VALUES.includes(vielsestypeRaw as Vielsestype)
  ) {
    errors.vielsestype = 'Ugyldigt valg';
  }

  const koordinatorRaw = str(fd, 'koordinator');
  if (
    koordinatorRaw &&
    !KOORDINATOR_VALUES.includes(koordinatorRaw as Koordinator)
  ) {
    errors.koordinator = 'Ugyldigt valg';
  }

  const statusRaw = str(fd, 'status') ?? 'forespoergsel';
  if (!STATUS_VALUES.includes(statusRaw as BryllupStatus)) {
    errors.status = 'Ugyldig status';
  }

  const kontakt_email = str(fd, 'kontakt_email');
  if (kontakt_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(kontakt_email)) {
    errors.kontakt_email = 'Skal være en gyldig email';
  }

  const noter = str(fd, 'noter');
  if (noter && noter.length > MAX_NOTER_LENGTH) {
    errors.general = `Noter må maks være ${MAX_NOTER_LENGTH} tegn (er ${noter.length}).`;
  }

  const kontakt_tlf = str(fd, 'kontakt_tlf');
  if (kontakt_tlf && kontakt_tlf.length > 40) {
    errors.general = 'Telefonnummer er for langt.';
  }

  return {
    errors,
    payload: {
      brudepar: brudepar ?? '',
      bryllupsdato: bryllupsdatoRaw ?? '',
      antal_kuverter,
      pakke: pickEnum(pakkeRaw, PAKKE_VALUES),
      lokation: pickEnum(lokationRaw, LOKATION_VALUES),
      vielsestype: pickEnum(vielsestypeRaw, VIELSESTYPE_VALUES),
      koordinator: pickEnum(koordinatorRaw, KOORDINATOR_VALUES),
      status: (pickEnum(statusRaw, STATUS_VALUES) ?? 'forespoergsel') as BryllupStatus,
      kontakt_email,
      kontakt_tlf,
      noter,
    },
  };
}

function revalidate() {
  revalidatePath('/llm/course10/dashboard');
  revalidatePath('/llm/course10/bryllupper');
  revalidatePath('/llm/course10/kalender');
}

export async function createBryllup(
  _prev: WeddingFormState,
  fd: FormData,
): Promise<WeddingFormState> {
  if (isMutationRateLimited(await clientIp())) {
    return {
      status: 'error',
      errors: { general: 'For mange ændringer på kort tid. Vent et minut.' },
    };
  }
  const { errors, payload } = validate(fd);
  if (Object.keys(errors).length > 0) {
    return { status: 'error', errors };
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('bryllupper')
    .insert(payload)
    .select('id')
    .single();

  if (error || !data) {
    console.error('[engestofte createBryllup]', error);
    return {
      status: 'error',
      errors: { general: 'Kunne ikke oprette bryllup. Prøv igen.' },
    };
  }

  const ctx = await getAuditContext();
  await logAudit({
    event: 'wedding.create',
    actor: ctx.actor,
    ip: ctx.ip,
    bryllupId: data.id,
    details: {
      brudepar: payload.brudepar,
      bryllupsdato: payload.bryllupsdato,
      status: payload.status,
    },
  });

  revalidate();
  redirect(`/llm/course10/bryllupper/${data.id}`);
}

export async function updateBryllup(
  id: string,
  _prev: WeddingFormState,
  fd: FormData,
): Promise<WeddingFormState> {
  if (!isUuid(id)) {
    return {
      status: 'error',
      errors: { general: 'Ugyldigt bryllups-id.' },
    };
  }
  if (isMutationRateLimited(await clientIp())) {
    return {
      status: 'error',
      errors: { general: 'For mange ændringer på kort tid. Vent et minut.' },
    };
  }
  const { errors, payload } = validate(fd);
  if (Object.keys(errors).length > 0) {
    return { status: 'error', errors };
  }

  const supabase = getSupabase();
  const { error } = await supabase
    .from('bryllupper')
    .update(payload)
    .eq('id', id);

  if (error) {
    console.error('[engestofte updateBryllup]', error);
    return {
      status: 'error',
      errors: { general: 'Kunne ikke gemme ændringer. Prøv igen.' },
    };
  }

  const ctx = await getAuditContext();
  await logAudit({
    event: 'wedding.update',
    actor: ctx.actor,
    ip: ctx.ip,
    bryllupId: id,
    details: { brudepar: payload.brudepar, status: payload.status },
  });

  revalidate();
  revalidatePath(`/llm/course10/bryllupper/${id}`);
  redirect(`/llm/course10/bryllupper/${id}`);
}
