/**
 * The flight plan.
 *
 * One continuous 3D scene runs behind the whole page, and the camera travels
 * along -Z as you scroll. Scrolling down flies you out through the solar
 * system in real order — Sun, the four rockies, the asteroid belt exactly
 * where it belongs, then the gas and ice giants — before the deep-space
 * constructs at the end.
 *
 * Bodies alternate left and right of centre so they frame the reading column
 * rather than sitting behind it.
 *
 * Sizes are stylised, not to scale: at true scale Jupiter would be 28x Mercury
 * and Neptune would be a pixel. Relative order of size is preserved.
 */

export type StationId =
  | 'galaxy'
  | 'sun'
  | 'mercury'
  | 'venus'
  | 'earth'
  | 'mars'
  | 'belt'
  | 'jupiter'
  | 'saturn'
  | 'uranus'
  | 'neptune'
  | 'satellite'
  | 'core'
  | 'beacon';

export type Station = {
  id: StationId;
  /** Display name for the HUD readout. Omitted for non-bodies. */
  name?: string;
  /** One-line note shown under the name. */
  note?: string;
  /** Scroll progress where the camera draws level with the object. */
  at: number;
  /** World position. X offsets from the reading column, Z is depth. */
  position: [number, number, number];
};

/** Camera Z at the very top of the page. */
export const CAMERA_START_Z = 26;
/**
 * Camera Z at the very bottom. Deliberately short of the pulsar at -520: the
 * last object is something you approach, not something you end up inside.
 */
export const CAMERA_END_Z = -470;

export const STATIONS: Station[] = [
  { id: 'galaxy', at: 0.0, position: [0, 0, 0] },
  { id: 'sun', name: 'Sol', note: 'G-type main sequence · 1.4M km', at: 0.14, position: [17, 6, -68] },
  { id: 'mercury', name: 'Mercury', note: '0.39 AU · no atmosphere', at: 0.21, position: [16, -6, -102] },
  { id: 'venus', name: 'Venus', note: '0.72 AU · runaway greenhouse', at: 0.272, position: [-17, 6, -132] },
  { id: 'earth', name: 'Earth', note: '1 AU · one moon', at: 0.342, position: [16, -5, -166] },
  { id: 'mars', name: 'Mars', note: '1.52 AU · two moons', at: 0.412, position: [-16, 6, -200] },
  { id: 'belt', name: 'Asteroid Belt', note: '2.2–3.2 AU · ~1.1M bodies', at: 0.481, position: [0, 0, -234] },
  { id: 'jupiter', name: 'Jupiter', note: '5.2 AU · 95 moons', at: 0.564, position: [17, -6, -274] },
  { id: 'saturn', name: 'Saturn', note: '9.5 AU · ring system', at: 0.65, position: [-17, 5, -316] },
  { id: 'uranus', name: 'Uranus', note: '19.2 AU · tipped 98°', at: 0.732, position: [16, 6, -356] },
  { id: 'neptune', name: 'Neptune', note: '30.1 AU · supersonic winds', at: 0.807, position: [-16, -6, -392] },
  { id: 'satellite', at: 0.82, position: [14, 5, -408] },
  { id: 'core', at: 0.885, position: [-15, -4, -438] },
  { id: 'beacon', name: 'Pulsar', note: 'End of the corridor', at: 0.965, position: [12, 5, -503] },
];

/* --------------------------------------------------------------------------
   Body specs. Colours stay heavily desaturated so the palette holds — each
   planet is distinguished by surface character and a hint of its real hue
   rather than by saturated colour.
   -------------------------------------------------------------------------- */

export type BodyKind = 'rock' | 'terran' | 'gas' | 'ice';

export type BodySpec = {
  radius: number;
  /** Drives which surface model the shader runs. */
  kind: BodyKind;
  /** Polar ice cap extent, 0-1. 0 disables caps. */
  caps?: number;
  /** Strength of a named storm oval. Gas giants only. */
  spot?: number;
  /** Base surface colour, desaturated. */
  color: string;
  /** Lighter colour the bands/highlights resolve to. */
  highlight: string;
  /** Latitude band frequency. 0 = cratered rock, high = a gas giant. */
  bands: number;
  /** Surface noise amount — craters and mottling. */
  grain: number;
  /** Ring system: [inner, outer, tilt] in world units and radians. */
  rings?: [number, number, number];
  /** Moons as [radius, orbit distance, speed, tilt]. */
  moons?: [number, number, number, number][];
  /** Axial tilt, radians. Uranus is the joke that writes itself. */
  tilt?: number;
};

export const BODIES: Record<string, BodySpec> = {
  mercury: {
    radius: 0.95,
    kind: 'rock',
    color: '#4a4742',
    highlight: '#8d8a83',
    bands: 0,
    grain: 0.85,
  },
  venus: {
    radius: 1.5,
    kind: 'gas',
    color: '#5c5344',
    highlight: '#b8ad96',
    bands: 1.4,
    grain: 0.3,
  },
  earth: {
    radius: 1.6,
    kind: 'terran',
    caps: 0.82,
    color: '#2c3a46',
    highlight: '#93a6b4',
    bands: 0.8,
    grain: 0.65,
    moons: [[0.34, 3.6, 0.4, 0.35]],
  },
  mars: {
    radius: 1.15,
    kind: 'rock',
    caps: 0.88,
    color: '#5a4238',
    highlight: '#a8897a',
    bands: 0.5,
    grain: 0.7,
    moons: [
      [0.12, 2.3, 0.62, 0.2],
      [0.09, 3.1, -0.4, -0.35],
    ],
  },
  jupiter: {
    radius: 3.7,
    kind: 'gas',
    spot: 0.85,
    color: '#4b4238',
    highlight: '#c2b09a',
    bands: 4.2,
    grain: 0.2,
    moons: [
      [0.22, 6.2, 0.42, 0.12],
      [0.18, 7.6, -0.3, -0.2],
      [0.26, 9.1, 0.22, 0.3],
    ],
  },
  saturn: {
    radius: 3.0,
    kind: 'gas',
    color: '#544c3e',
    highlight: '#cabc9f',
    bands: 3.4,
    grain: 0.16,
    rings: [4.2, 7.4, 0.42],
    moons: [[0.24, 9.4, 0.3, 0.1]],
  },
  uranus: {
    radius: 2.4,
    kind: 'ice',
    color: '#3b4d50',
    highlight: '#9fbcbe',
    bands: 1.1,
    grain: 0.12,
    rings: [2.9, 3.9, 0.1],
    // Uranus orbits on its side; the near-vertical rings are its signature.
    tilt: Math.PI / 2.1,
  },
  neptune: {
    radius: 2.3,
    kind: 'ice',
    color: '#2f3d55',
    highlight: '#8ba0c4',
    bands: 1.8,
    grain: 0.24,
    moons: [[0.2, 4.4, -0.34, 0.4]],
  },
};

/** Camera Z for a given scroll progress. */
export function cameraZ(progress: number) {
  return CAMERA_START_Z + (CAMERA_END_Z - CAMERA_START_Z) * progress;
}

/**
 * 1 when the camera is level with a station, falling to 0 either side.
 * Used to wake objects only while they are actually near the lens.
 */
export function proximity(progress: number, at: number, span = 0.075) {
  const d = Math.abs(progress - at);
  if (d >= span) return 0;
  const t = 1 - d / span;
  return t * t * (3 - 2 * t);
}

/** The named body the camera is closest to, or null between them. */
export function nearestBody(progress: number): Station | null {
  let best: Station | null = null;
  let bestD = Infinity;
  for (const s of STATIONS) {
    if (!s.name) continue;
    const d = Math.abs(progress - s.at);
    if (d < bestD) {
      bestD = d;
      best = s;
    }
  }
  return bestD < 0.05 ? best : null;
}
