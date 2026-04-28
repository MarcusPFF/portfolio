export const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
export const MAX_REQUESTS_PER_WINDOW = 6; // 6 messages per minute per IP

const requestLog = new Map<string, number[]>();

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = requestLog.get(ip) || [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  requestLog.set(ip, recent);

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  recent.push(now);
  return false;
}

// Clean up stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of requestLog.entries()) {
    const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    if (recent.length === 0) {
      requestLog.delete(ip);
    } else {
      requestLog.set(ip, recent);
    }
  }
}, 5 * 60 * 1000);

// ---------------------------------------------------------------------------
// Contact form — stricter limits because each request triggers an outbound email.
// ---------------------------------------------------------------------------

const TEN_MIN_MS = 10 * 60 * 1000;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const CONTACT_PER_IP_10MIN = 3;
const CONTACT_PER_IP_24H = 10;
const CONTACT_GLOBAL_PER_DAY = 50;

const contactLog = new Map<string, number[]>();
let globalContactDay: { resetAt: number; count: number } = { resetAt: 0, count: 0 };

export function isContactRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (contactLog.get(ip) || []).filter((t) => now - t < ONE_DAY_MS);

  const last10min = timestamps.filter((t) => now - t < TEN_MIN_MS);
  if (last10min.length >= CONTACT_PER_IP_10MIN) return true;
  if (timestamps.length >= CONTACT_PER_IP_24H) return true;

  timestamps.push(now);
  contactLog.set(ip, timestamps);
  return false;
}

export function isGlobalContactCapped(): boolean {
  const now = Date.now();
  if (now > globalContactDay.resetAt) {
    globalContactDay = { resetAt: now + ONE_DAY_MS, count: 0 };
  }
  if (globalContactDay.count >= CONTACT_GLOBAL_PER_DAY) return true;
  globalContactDay.count += 1;
  return false;
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, timestamps] of contactLog.entries()) {
    const recent = timestamps.filter((t) => now - t < ONE_DAY_MS);
    if (recent.length === 0) contactLog.delete(ip);
    else contactLog.set(ip, recent);
  }
}, 60 * 60 * 1000);
