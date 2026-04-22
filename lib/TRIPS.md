# Adding a new motorcycle trip

Quick checklist — follow top to bottom.

## 1. Add the trip to `lib/trips.ts`

Copy an existing entry in the `trips` array and edit. Required fields:

- `slug` — URL segment (kebab-case, unique). This is the `/trips/<slug>` URL.
- `dateSort` — `YYYY-MM` format. Used for sorting and the sidebar year grouping.
- `distanceKm` — a number. Used for the "Longest" sort.
- `color` — Tailwind gradient class for the card hover (`from-X/20 to-Y/20`).
- `hexColor` — the line color on the globe. Use a bold hex (e.g. `#6366f1`).
- `waypoints` — list of cities the route passes through.
- `title`, `subtitle`, `location`, `duration`, `summary`, `highlights`, `story` — all as `{ en, dk, de }` objects.

### Waypoints

You can write them in either form:

```ts
// Form A — just the name (preferred for new cities):
{ name: 'Reykjavik' },

// Form B — name + explicit coordinates (skip the geocode step):
{ name: 'Copenhagen', lat: 55.6761, lng: 12.5683 },
```

If you only give a name, the coordinates get filled in by `npm run geocode` from
`lib/cityCoords.json`.

## 2. Run the geocoder

```
npm run geocode
```

This:
- scans `trips.ts` for waypoint names without coordinates
- asks OpenStreetMap Nominatim for each missing one (1 request/sec — takes a few seconds)
- appends results to `lib/cityCoords.json`

If all waypoint names are already in the cache, it prints
`Nothing to geocode.` and exits immediately.

## 3. Commit both files

```
git add lib/trips.ts lib/cityCoords.json
git commit -m "add trip: <title>"
git push
```

Vercel rebuilds. New trip appears on `/trips`, its card links to `/trips/<slug>`,
and the globe draws a colored thread through the waypoints.

## Troubleshooting

- **Line missing on globe** — a waypoint name couldn't be resolved. Check
  `cityCoords.json` contains every name from your `waypoints`. Re-run
  `npm run geocode` if any are missing.
- **Coordinates off** — edit the entry in `cityCoords.json` directly, or pass
  explicit `lat`/`lng` on the waypoint to override.
- **Nominatim returned "no match"** — try a more specific name:
  `'Reine, Lofoten'`, `'Skagen, Denmark'`, etc.

## Adding pictures (optional)

Drop files into `public/trips/<slug>/` and add the paths to the trip's
`images` array:

```ts
images: ['/trips/nordkapp-expedition/1.jpg', '/trips/nordkapp-expedition/2.jpg'],
```

If `images` is empty or missing, the detail page shows a "pictures coming soon"
placeholder.
