import { trips, resolveWaypoint } from '@/lib/trips';

const TRIP_SLUG = 'europa-grand-tour';
const SVG_W = 320;
const SVG_H = 200;
const PAD = 10;

export default function RouteSilhouette() {
  const trip = trips.find((t) => t.slug === TRIP_SLUG);
  if (!trip) return null;

  const points = trip.waypoints
    .map((w) => resolveWaypoint(w))
    .filter((p): p is { lat: number; lng: number } => p !== null);
  if (points.length < 2) return null;

  // Equirectangular projection scaled by latitude (good enough at Europe scale).
  const latRef = points.reduce((sum, p) => sum + p.lat, 0) / points.length;
  const cosLat = Math.cos((latRef * Math.PI) / 180);
  const xs = points.map((p) => p.lng * cosLat);
  const ys = points.map((p) => -p.lat); // invert Y so north is up

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  // Preserve aspect ratio: fit the bbox into the SVG while keeping geographic shape.
  const innerW = SVG_W - PAD * 2;
  const innerH = SVG_H - PAD * 2;
  const scale = Math.min(innerW / rangeX, innerH / rangeY);
  const offsetX = PAD + (innerW - rangeX * scale) / 2;
  const offsetY = PAD + (innerH - rangeY * scale) / 2;

  const projected = points.map((_p, i) => ({
    x: offsetX + (xs[i] - minX) * scale,
    y: offsetY + (ys[i] - minY) * scale,
  }));

  const d = projected
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(' ');

  const start = projected[0];
  const end = projected[projected.length - 1];

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width={SVG_W}
      height={SVG_H}
      aria-label="Route map: Europa Grand Tour, 10,000 km motorcycle trip from Denmark through 15 countries"
      className="w-full h-auto"
    >
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        opacity={0.85}
      />
      <circle cx={start.x} cy={start.y} r={2.4} fill="currentColor" />
      <circle cx={end.x} cy={end.y} r={2.4} fill="currentColor" />
    </svg>
  );
}
