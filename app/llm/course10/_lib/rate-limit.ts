/**
 * E.G.-lokale rate limiters.
 *
 * AI-kald bruger portfoliets delte limiter i lib/rate-limit (6/min/IP) for at
 * dele cost-budget med chat og course-5. Disse to lokale buckets dækker
 * cheap-but-spam-prone actions:
 *
 *  - mutationLimit:  30/min/IP for create/update/cycle/approve actions
 *  - loginLimit:      5/min/IP for admin password attempts (brute-force guard)
 *
 * Bemærk: Map'erne lever per process. På Vercel serverless betyder det at
 * flere parallelle instanser hver har sin egen tæller, så effektiv kapacitet
 * bliver capacity × antal-instanser. Det er acceptabelt for en pitch-demo
 * med lav trafik; hvis det skalerer op, skift til Upstash Redis eller Vercel KV.
 */

const WINDOW_MS = 60 * 1000;

type Bucket = {
  capacity: number;
  log: Map<string, number[]>;
};

function makeBucket(capacity: number): Bucket {
  return { capacity, log: new Map() };
}

function check(bucket: Bucket, ip: string): boolean {
  const now = Date.now();
  const recent = (bucket.log.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= bucket.capacity) {
    bucket.log.set(ip, recent);
    return true; // limited
  }
  recent.push(now);
  bucket.log.set(ip, recent);
  return false;
}

const mutationBucket = makeBucket(30);
const loginBucket = makeBucket(5);

export function isMutationRateLimited(ip: string): boolean {
  return check(mutationBucket, ip);
}

export function isLoginRateLimited(ip: string): boolean {
  return check(loginBucket, ip);
}

// Skraldemand: fjern udløbne entries så Map'erne ikke vokser uendeligt
setInterval(() => {
  const now = Date.now();
  for (const bucket of [mutationBucket, loginBucket]) {
    for (const [ip, timestamps] of bucket.log) {
      const recent = timestamps.filter((t) => now - t < WINDOW_MS);
      if (recent.length === 0) bucket.log.delete(ip);
      else bucket.log.set(ip, recent);
    }
  }
}, 5 * 60 * 1000);
