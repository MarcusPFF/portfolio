import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'engestofte_admin';
const COOKIE_PATH = '/llm/course10';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 dage

function expected(): string | null {
  const raw = process.env.ENGESTOFTE_ADMIN_PASSWORD;
  return raw && raw.length > 0 ? raw : null;
}

/**
 * HMAC-key til signering af cookie-værdier. Vi genbruger Supabase service
 * role key — den er allerede et server-only secret med høj entropi. Fallback
 * bruges aldrig i praksis, men gør funktionen safe at kalde i tests/build.
 */
function signingKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? 'engestofte-fallback-key';
}

function sign(value: string): string {
  return createHmac('sha256', signingKey())
    .update('engestofte:admin:' + value)
    .digest('hex');
}

function safeStringCompare(a: string, b: string): boolean {
  // Buffer.from sikrer samme længde-håndtering. Returnerer false hvis
  // længderne afviger — det leaker ikke værdi-indhold.
  if (a.length !== b.length) return false;
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  return timingSafeEqual(bufA, bufB);
}

export async function isAdmin(): Promise<boolean> {
  const exp = expected();
  if (!exp) return false;
  const store = await cookies();
  const cookieValue = store.get(COOKIE_NAME)?.value;
  if (!cookieValue) return false;
  return safeStringCompare(cookieValue, sign(exp));
}

export async function setAdminCookie(password: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, sign(password), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: COOKIE_PATH,
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function clearAdminCookie(): Promise<void> {
  const store = await cookies();
  store.delete({ name: COOKIE_NAME, path: COOKIE_PATH });
}

export function verifyAdminPassword(input: string): boolean {
  const exp = expected();
  if (!exp) return false;
  return safeStringCompare(input, exp);
}

export function isAdminConfigured(): boolean {
  return expected() !== null;
}
