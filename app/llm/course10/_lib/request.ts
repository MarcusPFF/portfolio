import { headers } from 'next/headers';

/**
 * Klient-IP via x-forwarded-for. Bruges af rate-limiter og audit-log.
 * Returnerer 'unknown' i lokal udvikling hvor headeren ikke er sat.
 */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}
