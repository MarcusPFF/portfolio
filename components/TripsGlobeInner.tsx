'use client';

import Globe, { type GlobeMethods } from 'react-globe.gl';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  MeshPhongMaterial,
  TextureLoader,
  SphereGeometry,
  LinearFilter,
  LinearMipmapLinearFilter,
  type Texture,
  type Mesh,
  type Object3D,
} from 'three';
import { pick, resolveWaypoint, type Lang, type Trip } from '@/lib/trips';

type PathPoint = [number, number, number]; // [lat, lng, altitude]

type PathDatum = {
  kind: 'trip' | 'border';
  points: PathPoint[];
  color: string;
  stroke: number;
  slug?: string;
  title?: string;
};

type OrbitControls = {
  autoRotate: boolean;
  autoRotateSpeed: number;
  enableDamping: boolean;
  minDistance: number;
  maxDistance: number;
};

const EARTH_TEXTURE_HIGH = '/trips/earth-16k.jpg';
const EARTH_TEXTURE_LOW = '/trips/earth-8k.jpg';
const TOPOLOGY_TEXTURE = '/trips/earth-topology-4k.jpg';

/*
  Mobile GPUs typically cap MAX_TEXTURE_SIZE at 4096-8192 px while the 16K
  NASA Blue Marble is 21600×10800 — way beyond that, which causes WebGL to
  fail silently and renders the globe black. Pick the texture the device
  can actually handle at runtime.
*/
function pickEarthTexture(): string {
  if (typeof document === 'undefined') return EARTH_TEXTURE_LOW;
  try {
    const canvas = document.createElement('canvas');
    const gl =
      (canvas.getContext('webgl2') as WebGL2RenderingContext | null) ??
      (canvas.getContext('webgl') as WebGLRenderingContext | null);
    if (!gl) return EARTH_TEXTURE_LOW;
    const maxSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;
    return maxSize >= 16384 ? EARTH_TEXTURE_HIGH : EARTH_TEXTURE_LOW;
  } catch {
    return EARTH_TEXTURE_LOW;
  }
}
const WATER_MASK = '/trips/earth-water.png';
const COUNTRIES_URL =
  'https://vasturiano.github.io/react-globe.gl/example/datasets/ne_110m_admin_0_countries.geojson';
const BORDERS_URL = '/trips/borders.geojson';

const BORDER_ALTITUDE = 0.006;
const TRIP_ALTITUDE = 0.003;

type GeoFeature = {
  type: 'Feature';
  properties: {
    NAME?: string;
    NAME_LONG?: string;
    ADMIN?: string;
    SOVEREIGNT?: string;
    NAME_EN?: string;
  };
  geometry:
    | { type: 'Polygon'; coordinates: number[][][] }
    | { type: 'MultiPolygon'; coordinates: number[][][][] };
};

type LabelDatum = { lat: number; lng: number; name: string };

function ringArea(ring: number[][]): number {
  let a = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[i + 1];
    a += x1 * y2 - x2 * y1;
  }
  return Math.abs(a / 2);
}

function ringCentroid(ring: number[][]): { lat: number; lng: number } {
  let lat = 0;
  let lng = 0;
  for (const pt of ring) {
    lng += pt[0];
    lat += pt[1];
  }
  return { lat: lat / ring.length, lng: lng / ring.length };
}

/*
  Proper area-weighted polygon centroid (shoelace formula). Not biased by
  dense coastlines — gives the visual "middle" of a country.
*/
function polygonCentroid(ring: number[][]): { lat: number; lng: number } {
  let cx = 0;
  let cy = 0;
  let a = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[i + 1];
    const cross = x1 * y2 - x2 * y1;
    a += cross;
    cx += (x1 + x2) * cross;
    cy += (y1 + y2) * cross;
  }
  a /= 2;
  if (Math.abs(a) < 1e-9) return ringCentroid(ring);
  return { lng: cx / (6 * a), lat: cy / (6 * a) };
}

/*
  Use the centroid of the *largest* outer ring for each feature so that a
  country like Greece (mainland + many small islands) gets its label placed
  on the mainland instead of averaged out into the Aegean Sea.
*/
function centroidOf(feature: GeoFeature): { lat: number; lng: number } | null {
  if (feature.geometry.type === 'Polygon') {
    const outer = feature.geometry.coordinates[0];
    return outer ? polygonCentroid(outer) : null;
  }
  let best: number[][] | null = null;
  let bestArea = -1;
  for (const poly of feature.geometry.coordinates) {
    const outer = poly[0];
    if (!outer) continue;
    const area = ringArea(outer);
    if (area > bestArea) {
      bestArea = area;
      best = outer;
    }
  }
  return best ? polygonCentroid(best) : null;
}

type BorderFeature = {
  type: 'Feature';
  geometry:
    | { type: 'LineString'; coordinates: number[][] }
    | { type: 'MultiLineString'; coordinates: number[][][] };
};

function featureName(f: GeoFeature): string {
  const p = f.properties;
  return (
    p.NAME ||
    p.NAME_EN ||
    p.NAME_LONG ||
    p.ADMIN ||
    p.SOVEREIGNT ||
    ''
  );
}

function tuneTexture(tex: Texture) {
  tex.anisotropy = 16;
  tex.magFilter = LinearFilter;
  tex.minFilter = LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
}

export default function TripsGlobeInner({
  trips,
  lang,
  hint,
}: {
  trips: Trip[];
  lang: Lang;
  hint: string;
}) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const controlsRef = useRef<OrbitControls | null>(null);
  const [size, setSize] = useState({ width: 800, height: 640 });
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const isHoveringRef = useRef(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showBorders, setShowBorders] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const [countries, setCountries] = useState<GeoFeature[]>([]);
  const [borders, setBorders] = useState<BorderFeature[]>([]);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Neutral fallback while the 8K texture loads
  const baseMaterial = useMemo(
    () =>
      new MeshPhongMaterial({
        color: '#1e293b',
        emissive: '#0b1020',
        emissiveIntensity: 0.2,
        shininess: 10,
      }),
    [],
  );
  const [material, setMaterial] = useState<MeshPhongMaterial>(baseMaterial);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setSize({ width: Math.max(320, Math.floor(rect.width)), height: 640 });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loader = new TextureLoader();
    const load = (url: string) =>
      new Promise<Texture>((resolve, reject) => {
        loader.load(url, (t) => resolve(t), undefined, (err) => reject(err));
      });

    Promise.all([load(pickEarthTexture()), load(TOPOLOGY_TEXTURE), load(WATER_MASK)])
      .then(([earth, topo, water]) => {
        if (cancelled) return;
        tuneTexture(earth);
        tuneTexture(topo);
        tuneTexture(water);

        const mat = new MeshPhongMaterial({
          map: earth,
          bumpMap: topo,
          // Displacement kept subtle so trip lines and borders can sit
          // nearly flat on the surface without being buried in peaks.
          // Bump scale compensates so mountains still read in 3D via
          // lighting/shadow, even though the geometry is barely pushed.
          bumpScale: 3.2,
          displacementMap: topo,
          displacementScale: 0.6,
          displacementBias: -0.15,
          // Water mask → only oceans pick up specular highlights.
          // Land stays matte, oceans get subtle shine — big realism win.
          specularMap: water,
          specular: '#64748b',
          shininess: 14,
        });
        setMaterial(mat);
      })
      .catch(() => {
        /* keep fallback */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const g = globeRef.current;
    if (!g) return;
    const renderer = g.renderer();
    // Cap pixel ratio at 1.5 — on retina displays 2.0 roughly doubles
    // fragment load for marginal visual gain; 1.5 keeps the globe crisp
    // while giving the rotation a clean 60 fps.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    const controls = g.controls() as OrbitControls;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.22;
    controls.enableDamping = true;
    // Globe radius is 100; minDistance 115 lets the camera hug the surface
    // for a much closer view. Some 8K texture pixelation appears at this
    // range, but the zoom freedom is worth it.
    controls.minDistance = 115;
    controls.maxDistance = 500;
    controlsRef.current = controls;
    g.pointOfView({ lat: 42, lng: 18, altitude: 2.1 }, 0);

    // Upgrade the globe sphere to enough geometry resolution so the 4K
    // heightmap can push real mountains out of the surface; balance lights
    // so the 8K color map reads evenly without glare hotspots.
    const scene = g.scene() as unknown as Object3D;
    const tuneScene = () => {
      scene.traverse((obj: Object3D) => {
        const mesh = obj as Mesh & { isMesh?: boolean };
        if (
          mesh.isMesh &&
          mesh.geometry &&
          mesh.geometry.type === 'SphereGeometry' &&
          !mesh.userData._upgraded
        ) {
          const params = (mesh.geometry as SphereGeometry).parameters;
          const radius = params?.radius ?? 100;
          mesh.userData._upgraded = true;
          mesh.geometry.dispose();
          // 384×384 segments ≈ 295k triangles. Finer displacement sampling
          // so ridges and coastlines read crisply without a perf cliff.
          mesh.geometry = new SphereGeometry(radius, 384, 384);
        }

        const light = obj as Object3D & {
          isDirectionalLight?: boolean;
          isAmbientLight?: boolean;
          intensity?: number;
        };
        if (light.isDirectionalLight && light.intensity !== undefined) {
          light.intensity = 0.55;
        }
        if (light.isAmbientLight && light.intensity !== undefined) {
          light.intensity = 1.0;
        }
      });
    };
    tuneScene();
    const t1 = setTimeout(tuneScene, 60);
    const t2 = setTimeout(tuneScene, 250);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const tripPaths: PathDatum[] = useMemo(
    () =>
      trips
        .map<PathDatum>((t) => {
          const points: PathPoint[] = [];
          for (const w of t.waypoints) {
            const resolved = resolveWaypoint(w);
            if (resolved) points.push([resolved.lat, resolved.lng, TRIP_ALTITUDE]);
          }
          return {
            kind: 'trip',
            slug: t.slug,
            title: pick(t.title, lang),
            color: t.hexColor,
            stroke: 4.5,
            points,
          };
        })
        .filter((p) => p.points.length >= 2),
    [trips, lang],
  );

  const borderPaths: PathDatum[] = useMemo(() => {
    if (!showBorders) return [];
    const out: PathDatum[] = [];
    for (const f of borders) {
      const geom = f.geometry;
      if (!geom) continue;
      const segments: number[][][] =
        geom.type === 'LineString'
          ? [geom.coordinates]
          : geom.type === 'MultiLineString'
            ? geom.coordinates
            : [];
      for (const seg of segments) {
        const points: PathPoint[] = [];
        for (const c of seg) {
          if (!Array.isArray(c) || c.length < 2) continue;
          const lng = c[0];
          const lat = c[1];
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
          points.push([lat, lng, BORDER_ALTITUDE]);
        }
        if (points.length >= 2) {
          out.push({
            kind: 'border',
            color: 'rgba(255, 255, 255, 0.55)',
            stroke: 0.8,
            points,
          });
        }
      }
    }
    return out;
  }, [borders, showBorders]);

  const paths = useMemo(() => {
    const filteredTrips = selectedSlug
      ? tripPaths.filter((p) => p.slug === selectedSlug)
      : tripPaths;
    return [...borderPaths, ...filteredTrips];
  }, [tripPaths, borderPaths, selectedSlug]);

  const applyRotation = () => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = isPlaying && !isHoveringRef.current;
    }
  };

  useEffect(() => {
    applyRotation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying]);

  const onHoverChange = (hovered: object | null) => {
    isHoveringRef.current = hovered !== null;
    applyRotation();
  };

  // Fetch country polygons (used for label centroids) + boundary lines
  // (used for rendering actual political borders — excludes coastlines)
  useEffect(() => {
    let cancelled = false;
    fetch(COUNTRIES_URL)
      .then((r) => r.json())
      .then((data: { features?: GeoFeature[] }) => {
        if (!cancelled) setCountries(data.features ?? []);
      })
      .catch(() => {});
    fetch(BORDERS_URL)
      .then((r) => r.json())
      .then((data: { features?: BorderFeature[] }) => {
        if (!cancelled) setBorders(data.features ?? []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const labels: LabelDatum[] = useMemo(() => {
    if (!showLabels) return [];
    const out: LabelDatum[] = [];
    for (const f of countries) {
      const c = centroidOf(f);
      if (!c) continue;
      const name = featureName(f);
      if (!name) continue;
      out.push({ lat: c.lat, lng: c.lng, name });
    }
    return out;
  }, [countries, showLabels]);

  // Close settings panel on outside click / Escape
  useEffect(() => {
    if (!settingsOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!settingsRef.current?.contains(e.target as Node)) setSettingsOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSettingsOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [settingsOpen]);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden rounded-[1.25rem] border border-slate-800/50"
      style={{
        height: size.height,
        background: 'radial-gradient(ellipse at center, #0b1220 0%, #050810 70%, #020308 100%)',
      }}
    >
      <Globe
        ref={globeRef}
        width={size.width}
        height={size.height}
        backgroundColor="rgba(0,0,0,0)"
        globeMaterial={material}
        showAtmosphere
        atmosphereColor="#7dd3fc"
        atmosphereAltitude={0.18}
        rendererConfig={{ antialias: true, alpha: true }}
        labelsData={labels}
        labelLat={(d: object) => (d as LabelDatum).lat}
        labelLng={(d: object) => (d as LabelDatum).lng}
        labelText={(d: object) => (d as LabelDatum).name}
        labelSize={0.22}
        labelAltitude={0.008}
        labelIncludeDot
        labelDotRadius={0.12}
        labelDotOrientation={() => 'bottom'}
        labelColor={() => '#ffffff'}
        labelResolution={3}
        labelsTransitionDuration={0}
        pathsData={paths}
        pathPoints={(d: object) => (d as PathDatum).points}
        pathPointLat={(p: object) => (p as PathPoint)[0]}
        pathPointLng={(p: object) => (p as PathPoint)[1]}
        pathPointAlt={(p: object) => (p as PathPoint)[2]}
        pathColor={(d: object) => (d as PathDatum).color}
        pathStroke={(d: object) => (d as PathDatum).stroke}
        pathResolution={4}
        pathDashLength={1}
        pathDashGap={0}
        pathDashAnimateTime={0}
        pathLabel={(d: object) => {
          const p = d as PathDatum;
          return p.kind === 'trip' ? p.title ?? '' : '';
        }}
        onPathHover={(hovered: object | null) => {
          const p = hovered as PathDatum | null;
          onHoverChange(p && p.kind === 'trip' ? p : null);
        }}
        onPathClick={(d: object) => {
          const p = d as PathDatum;
          if (p.kind === 'trip' && p.slug) router.push(`/trips/${p.slug}`);
        }}
      />

      <div className="absolute top-4 left-4 pointer-events-none">
        <div className="px-3 py-1.5 rounded-full text-xs font-medium text-slate-200 bg-slate-900/70 backdrop-blur-sm border border-slate-700/60">
          {hint}
        </div>
      </div>

      {/* Settings (view options) — placed immediately left of play/pause */}
      <div ref={settingsRef} className="absolute top-4 right-14">
        <button
          type="button"
          onClick={() => setSettingsOpen((v) => !v)}
          aria-label="View options"
          aria-expanded={settingsOpen}
          aria-haspopup="menu"
          className="w-9 h-9 rounded-full flex items-center justify-center text-slate-200 bg-slate-900/70 backdrop-blur-sm border border-slate-700/60 hover:bg-slate-900/90 hover:text-white transition-colors"
        >
          <svg
            className="w-4 h-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
        </button>

        {settingsOpen && (
          <div
            role="menu"
            className="absolute right-0 mt-2 w-52 rounded-xl bg-slate-900/95 backdrop-blur-sm border border-slate-700/60 shadow-xl p-3 flex flex-col gap-2 z-30"
          >
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-slate-400 px-1 pb-1">
              View options
            </p>
            <label className="flex items-center gap-3 px-1 py-1.5 text-sm text-slate-200 cursor-pointer select-none hover:text-white">
              <input
                type="checkbox"
                checked={showBorders}
                onChange={(e) => setShowBorders(e.target.checked)}
                className="w-4 h-4 accent-violet-400"
              />
              Show borders
            </label>
            <label className="flex items-center gap-3 px-1 py-1.5 text-sm text-slate-200 cursor-pointer select-none hover:text-white">
              <input
                type="checkbox"
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
                className="w-4 h-4 accent-violet-400"
              />
              Show country names
            </label>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setIsPlaying((v) => !v)}
        aria-label={isPlaying ? 'Pause rotation' : 'Play rotation'}
        aria-pressed={!isPlaying}
        className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-slate-200 bg-slate-900/70 backdrop-blur-sm border border-slate-700/60 hover:bg-slate-900/90 hover:text-white transition-colors"
      >
        {isPlaying ? (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        ) : (
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M7 5.5v13a1 1 0 001.51.86l11-6.5a1 1 0 000-1.72l-11-6.5A1 1 0 007 5.5z" />
          </svg>
        )}
      </button>

      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
        {trips.map((t) => {
          const isActive = selectedSlug === t.slug;
          const isDimmed = selectedSlug !== null && !isActive;
          return (
            <button
              key={t.slug}
              type="button"
              onClick={() => setSelectedSlug((prev) => (prev === t.slug ? null : t.slug))}
              aria-pressed={isActive}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm border transition-all min-h-8 ${
                isActive
                  ? 'text-white bg-slate-900/90'
                  : isDimmed
                    ? 'text-slate-400 bg-slate-900/40 border-slate-700/40 hover:bg-slate-900/60 hover:text-slate-200'
                    : 'text-slate-100 bg-slate-900/70 border-slate-700/60 hover:bg-slate-900/85'
              }`}
              style={
                isActive
                  ? {
                      borderColor: t.hexColor,
                      boxShadow: `0 0 14px ${t.hexColor}99, 0 0 2px ${t.hexColor} inset`,
                    }
                  : undefined
              }
            >
              <span
                className="inline-block w-2.5 h-2.5 rounded-full"
                style={{ background: t.hexColor, boxShadow: `0 0 8px ${t.hexColor}` }}
              />
              {pick(t.title, lang)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
