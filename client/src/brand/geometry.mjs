/**
 * TRACE brand geometry — single source of truth.
 *
 * Consumed by:
 *   - src/components/Logo.tsx  (runtime React marks)
 *   - scripts/build-brand.mjs  (static SVG + PNG asset emission)
 *
 * Plain .mjs so both Vite and bare node can import it without a build step.
 * Coordinates are authored in a 512x512 square (mark) and a 660x160 strip
 * (wordmark). Never hand-edit the emitted assets — edit here and re-run
 * `npm run brand`.
 */

// ── Palette ──────────────────────────────────────────────────────────────────
// `neon` is the identity palette (dark plate). `ink` is the on-parchment
// variant so the mark survives the app's warm-wood surfaces.
export const PALETTE = {
  neon: {
    primary: '#2FE9F2', // signal cyan — dog, ripples, outer ring
    primaryCore: '#C4FCFF', // inner tube highlight
    accent: '#FF8A2B', // alert orange — pin, broadcast arcs
    accentCore: '#FFD9A8',
    plate0: '#0A1A22', // plate radial centre
    plate1: '#04090D', // plate radial edge
    grid: '#2FE9F2',
  },
  ink: {
    primary: '#0E7C86',
    primaryCore: '#0E7C86',
    accent: '#C05C28',
    accentCore: '#C05C28',
    plate0: '#fffaf3',
    plate1: '#f5e8cc',
    grid: '#8a6a3a',
  },
};

export const MARK_VIEWBOX = '0 0 512 512';
export const WORDMARK_VIEWBOX = '-15 -15 700 190';

// ── Mark: low-poly dog head in profile ───────────────────────────────────────
export const DOG_OUTLINE =
  'M158 90 L184 186 L232 78 L258 190 L300 214 L360 250 L402 268 ' +
  'L390 288 L338 296 L300 330 L232 348 L176 316 L146 246 Z';

export const DOG_FACETS = [
  'M184 186 L258 190',
  'M258 190 L232 262 L300 214',
  'M184 186 L232 262',
  'M232 262 L360 250',
  'M232 262 L300 330',
  'M176 316 L232 262',
  'M146 246 L184 186',
];

export const DOG_EYE = 'M286 232 L306 226 L298 244 Z';
export const DOG_NOSE = { cx: 393, cy: 273, r: 4.5 };

// ── Mark: location pin ───────────────────────────────────────────────────────
export const PIN_OUTLINE =
  'M256 452 C214 396 212 386 212 368 A44 44 0 1 1 300 368 C300 386 298 396 256 452 Z';

export const PIN_RINGS = [
  { cx: 256, cy: 368, r: 21 },
  { cx: 256, cy: 368, r: 7.5 },
];

// Ground ripples beneath the pin point.
export const RIPPLES = [
  { cx: 256, cy: 458, rx: 58, ry: 12.5 },
  { cx: 256, cy: 461, rx: 86, ry: 18 },
];

// ── Mark: signal arcs ────────────────────────────────────────────────────────
// Cyan = passive relay mesh (encircling). Orange = active WEA broadcast (directional).
export const RELAY_ARCS = [
  'M158 426 A196 196 0 0 1 158 86',
  'M354 86 A196 196 0 0 1 354 426',
  'M137 375 A168 168 0 0 1 118 160',
  'M394 160 A168 168 0 0 1 394 352',
];

export const BROADCAST_ARCS = [
  'M338 31 A240 240 0 0 1 484 182',
  'M333 66 A205 205 0 0 1 449 186',
  'M325 101 A170 170 0 0 1 414 192',
  'M98 347 A182 182 0 0 1 85 194',
];

// ── Plate decoration ─────────────────────────────────────────────────────────
// Deterministic constellation — no RNG, so every emitted asset is byte-stable.
export const NODES = [
  { cx: 62, cy: 108, r: 3 }, { cx: 118, cy: 52, r: 2 }, { cx: 448, cy: 74, r: 4 },
  { cx: 486, cy: 132, r: 2.5 }, { cx: 42, cy: 292, r: 2 }, { cx: 470, cy: 330, r: 3 },
  { cx: 92, cy: 448, r: 2.5 }, { cx: 424, cy: 452, r: 2 }, { cx: 256, cy: 22, r: 2 },
];

export const NODE_LINKS = [
  'M62 108 L118 52', 'M448 74 L486 132', 'M486 132 L470 330',
  'M42 292 L92 448', 'M424 452 L470 330', 'M118 52 L256 22',
];

// ── Wordmark: T R A C E ──────────────────────────────────────────────────────
// Single-stroke skeletons rendered as neon tubes (wide dim stroke + narrow core).
// Letter colour alternates cyan/orange, mirroring the mark's dual-signal story.
export const WORDMARK = [
  { key: 'T', tone: 'primary', d: 'M20 15 H130 M75 15 V145' },
  { key: 'R', tone: 'accent', d: 'M155 145 V15 H213 A38 38 0 0 1 213 91 H155 M196 91 L250 145' },
  { key: 'A', tone: 'primary', d: 'M275 145 L328 15 L381 145 M297 100 H359' },
  // Open C: cap-height arc, large-arc so the aperture faces right (not a crescent).
  { key: 'C', tone: 'accent', d: 'M508 29 A65 65 0 1 0 508 131' },
  { key: 'E', tone: 'primary', d: 'M650 15 H560 V145 H650 M560 80 H630' },
];
