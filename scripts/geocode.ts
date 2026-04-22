import * as fs from 'fs';
import * as path from 'path';
import { trips } from '../lib/trips';

const CACHE_PATH = path.join(process.cwd(), 'lib', 'cityCoords.json');

type CacheEntry = { lat: number; lng: number };
type Cache = Record<string, CacheEntry>;

function loadCache(): Cache {
  try {
    return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8')) as Cache;
  } catch {
    return {};
  }
}

function saveCache(cache: Cache) {
  const sorted: Cache = {};
  for (const k of Object.keys(cache).sort((a, b) => a.localeCompare(b))) {
    sorted[k] = cache[k];
  }
  fs.writeFileSync(CACHE_PATH, JSON.stringify(sorted, null, 2) + '\n');
}

async function geocode(name: string): Promise<CacheEntry | null> {
  const url =
    'https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' +
    encodeURIComponent(name);
  const res = await fetch(url, {
    headers: {
      // Nominatim requires a contactable User-Agent per their usage policy.
      'User-Agent': 'marcus-portfolio-trips/1.0 (marcus.pff03@gmail.com)',
      'Accept-Language': 'en',
    },
  });
  if (!res.ok) {
    console.error(`  × ${name}: HTTP ${res.status}`);
    return null;
  }
  const data = (await res.json()) as Array<{ lat: string; lon: string }>;
  if (!data.length) {
    console.error(`  × ${name}: no match`);
    return null;
  }
  return { lat: Number(data[0].lat), lng: Number(data[0].lon) };
}

function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function printTripDistances(cache: Cache) {
  console.log('\nTrip distances (great-circle between waypoints):');
  for (const t of trips) {
    let total = 0;
    let prev: { lat: number; lng: number } | null = null;
    let skipped = 0;
    for (const w of t.waypoints) {
      const r =
        typeof w.lat === 'number' && typeof w.lng === 'number'
          ? { lat: w.lat, lng: w.lng }
          : cache[w.name] ?? null;
      if (!r) {
        skipped += 1;
        continue;
      }
      if (prev) total += haversineKm(prev, r);
      prev = r;
    }
    const skippedNote = skipped ? ` (skipped ${skipped} unresolved)` : '';
    console.log(`  ${t.slug}: ${Math.round(total)} km${skippedNote}`);
  }
}

async function main() {
  const cache = loadCache();
  const wanted = new Set<string>();
  for (const t of trips) {
    for (const w of t.waypoints) {
      const alreadyResolved =
        typeof w.lat === 'number' && typeof w.lng === 'number';
      if (!alreadyResolved) wanted.add(w.name);
    }
  }
  const missing = Array.from(wanted).filter((n) => !(n in cache));

  if (missing.length === 0) {
    console.log(
      `Nothing to geocode. Cache has ${Object.keys(cache).length} entries.`,
    );
    printTripDistances(cache);
    return;
  }

  console.log(
    `Geocoding ${missing.length} new name(s) via Nominatim (1 req/sec)…`,
  );
  for (const name of missing) {
    const result = await geocode(name);
    if (result) {
      console.log(`  ✓ ${name} → ${result.lat.toFixed(4)}, ${result.lng.toFixed(4)}`);
      cache[name] = result;
      saveCache(cache);
    }
    // Nominatim usage policy: max 1 request per second
    await new Promise((r) => setTimeout(r, 1100));
  }
  console.log(`Done. Cache has ${Object.keys(cache).length} entries.`);
  printTripDistances(cache);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
