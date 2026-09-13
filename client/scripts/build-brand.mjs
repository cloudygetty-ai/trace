/**
 * Emits every static TRACE brand asset from src/brand/geometry.mjs.
 *
 *   node scripts/build-brand.mjs
 *
 * Outputs (all generated — do not hand-edit):
 *   public/brand/trace-mark.svg        512  mark, dark plate
 *   public/brand/trace-mark-flat.svg   512  mark, no plate (transparent)
 *   public/brand/trace-wordmark.svg    660  wordmark only
 *   public/brand/trace-lockup.svg     1024  mark + wordmark, dark plate
 *   public/favicon.svg                 512  mark, no glow (legible at 16px)
 *   public/icon-{192,512}.png                PWA icons
 *   public/apple-touch-icon.png        180
 *   public/icon-maskable-512.png       512  20% safe-zone padding
 *   public/og-image.png               1200x630  social card
 *
 * PNGs need a Chromium binary: CHROME_BIN, else the Playwright cache, else
 * the system chromium. Missing binary = SVGs still emitted, PNGs skipped.
 */
import { mkdirSync, writeFileSync, rmSync, existsSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as G from '../src/brand/geometry.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUB = join(ROOT, 'public');
const BRAND = join(PUB, 'brand');
const TMP = join(ROOT, '.brand-tmp');

// ── SVG fragment builders ────────────────────────────────────────────────────

const defs = (c, glow) => `
  <defs>
    <radialGradient id="plate" cx="50%" cy="42%" r="72%">
      <stop offset="0%" stop-color="${c.plate0}"/>
      <stop offset="100%" stop-color="${c.plate1}"/>
    </radialGradient>
    <pattern id="hex" width="42" height="24.2" patternUnits="userSpaceOnUse">
      <path d="M0 12.1 L7 0 L21 0 L28 12.1 L21 24.2 L7 24.2 Z" fill="none"
            stroke="${c.grid}" stroke-width="1" opacity=".5"/>
    </pattern>
    ${glow ? `<filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="7" result="b1"/>
      <feGaussianBlur stdDeviation="18" result="b2"/>
      <feMerge><feMergeNode in="b2"/><feMergeNode in="b1"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>` : ''}
  </defs>`;

const plate = (r) => `
  <rect x="0" y="0" width="512" height="512" rx="${r}" fill="url(#plate)"/>
  <rect x="0" y="0" width="512" height="512" rx="${r}" fill="url(#hex)" opacity=".07"/>`;

const constellation = (c) => `
  <g stroke="${c.primary}" stroke-width="1" opacity=".16" fill="none">
    ${G.NODE_LINKS.map((d) => `<path d="${d}"/>`).join('')}
  </g>
  <g fill="${c.primary}" opacity=".45">
    ${G.NODES.map((n) => `<circle cx="${n.cx}" cy="${n.cy}" r="${n.r}"/>`).join('')}
  </g>`;

/** Neon tube = wide dim halo stroke + narrow bright core, same path. */
const tube = (d, colour, core, w, opacity = 1) => `
  <path d="${d}" fill="none" stroke="${colour}" stroke-width="${w}" opacity="${opacity}"
        stroke-linecap="round" stroke-linejoin="round"/>
  <path d="${d}" fill="none" stroke="${core}" stroke-width="${Math.max(w * 0.34, 1)}"
        opacity="${opacity * 0.9}" stroke-linecap="round" stroke-linejoin="round"/>`;

const markBody = (c, { glow = true } = {}) => `
  <g ${glow ? 'filter="url(#glow)"' : ''}>
    <g opacity=".55">${G.RELAY_ARCS.map((d) => tube(d, c.primary, c.primaryCore, 5, 0.9)).join('')}</g>
    <g opacity=".75">${G.BROADCAST_ARCS.map((d) => tube(d, c.accent, c.accentCore, 5, 0.9)).join('')}</g>
    ${tube(G.DOG_OUTLINE, c.primary, c.primaryCore, 7)}
    <g opacity=".8">${G.DOG_FACETS.map((d) => tube(d, c.primary, c.primaryCore, 4.5)).join('')}</g>
    ${tube(G.DOG_EYE, c.primary, c.primaryCore, 3.5)}
    <circle cx="${G.DOG_NOSE.cx}" cy="${G.DOG_NOSE.cy}" r="${G.DOG_NOSE.r}" fill="${c.primaryCore}"/>
    <g opacity=".7">${G.RIPPLES.map((r) =>
      `<ellipse cx="${r.cx}" cy="${r.cy}" rx="${r.rx}" ry="${r.ry}" fill="none"
                stroke="${c.primary}" stroke-width="4"/>`).join('')}</g>
    ${tube(G.PIN_OUTLINE, c.accent, c.accentCore, 8)}
    ${G.PIN_RINGS.map((r) =>
      `<circle cx="${r.cx}" cy="${r.cy}" r="${r.r}" fill="none" stroke="${c.accent}" stroke-width="7"/>
       <circle cx="${r.cx}" cy="${r.cy}" r="${r.r}" fill="none" stroke="${c.accentCore}" stroke-width="2.4"/>`).join('')}
  </g>`;

const wordmarkBody = (c, { glow = true } = {}) => `
  <g ${glow ? 'filter="url(#glow)"' : ''}>
    ${G.WORDMARK.map((l) =>
      tube(l.d, c[l.tone], c[`${l.tone}Core`], 13)).join('')}
  </g>`;

const svg = (viewBox, w, h, inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${w}" height="${h}" role="img" aria-label="TRACE">${inner}\n</svg>\n`;

// ── Asset definitions ────────────────────────────────────────────────────────

const c = G.PALETTE.neon;
const ink = G.PALETTE.ink;

// Vertical lockup composition — mirrored exactly by TraceLogo in Logo.tsx.
const LOCKUP = {
  viewBox: '0 0 1024 880',
  mark: 'translate(256 40)',
  word: 'translate(113 610) scale(1.19)',
};

const ASSETS = {
  'brand/trace-mark.svg': svg(G.MARK_VIEWBOX, 512, 512,
    defs(c, true) + plate(96) + constellation(c) + markBody(c)),

  'brand/trace-mark-flat.svg': svg(G.MARK_VIEWBOX, 512, 512,
    defs(c, true) + markBody(c)),

  'brand/trace-wordmark.svg': svg(G.WORDMARK_VIEWBOX, 700, 190,
    defs(c, true) + wordmarkBody(c)),

  'brand/trace-lockup.svg': svg(LOCKUP.viewBox, 1024, 880,
    defs(c, true) +
    `<rect width="1024" height="880" fill="url(#plate)"/>
     <rect width="1024" height="880" fill="url(#hex)" opacity=".07"/>
     <g transform="${LOCKUP.mark}">${constellation(c)}${markBody(c)}</g>
     <g transform="${LOCKUP.word}">${wordmarkBody(c)}</g>`),

  // Favicon: no glow, no constellation — survives 16px.
  'favicon.svg': svg(G.MARK_VIEWBOX, 512, 512,
    defs(c, false) + plate(112) + markBody(c, { glow: false })),

  // Ink tone: flat, no bloom — for the app's warm parchment surfaces and print.
  'brand/trace-mark-ink.svg': svg(G.MARK_VIEWBOX, 512, 512,
    defs(ink, false) + markBody(ink, { glow: false })),

  'brand/trace-wordmark-ink.svg': svg(G.WORDMARK_VIEWBOX, 700, 190,
    defs(ink, false) + wordmarkBody(ink, { glow: false })),
};

// [output, sourceSvg, width, height, pad%, pageBackground]
const RASTERS = [
  ['icon-192.png', 'brand/trace-mark.svg', 192, 192, 0, 'transparent'],
  ['icon-512.png', 'brand/trace-mark.svg', 512, 512, 0, 'transparent'],
  ['apple-touch-icon.png', 'brand/trace-mark.svg', 180, 180, 0, 'transparent'],
  ['icon-maskable-512.png', 'brand/trace-mark.svg', 512, 512, 20, c.plate1],
  ['og-image.png', 'brand/trace-lockup.svg', 1200, 630, 4, c.plate1],
];

// ── Emit SVGs ────────────────────────────────────────────────────────────────

mkdirSync(BRAND, { recursive: true });
for (const [rel, body] of Object.entries(ASSETS)) {
  writeFileSync(join(PUB, rel), body);
  console.log(`  svg  public/${rel}`);
}

// ── Rasterise ────────────────────────────────────────────────────────────────

function findChrome() {
  if (process.env.CHROME_BIN && existsSync(process.env.CHROME_BIN)) return process.env.CHROME_BIN;
  const cache = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers';
  if (existsSync(cache)) {
    for (const dir of readdirSync(cache)) {
      const p = join(cache, dir, 'chrome-linux', 'chrome');
      if (dir.startsWith('chromium') && existsSync(p)) return p;
    }
  }
  for (const p of ['/usr/bin/chromium', '/usr/bin/chromium-browser', '/usr/bin/google-chrome']) {
    if (existsSync(p)) return p;
  }
  return null;
}

const chrome = findChrome();
if (!chrome) {
  console.warn('  ⚠ no chromium found — PNG icons skipped (set CHROME_BIN)');
  process.exit(0);
}

mkdirSync(TMP, { recursive: true });
for (const [out, src, w, h, pad, bg] of RASTERS) {
  const page = join(TMP, `${out}.html`);
  const inset = (pad / 100) * Math.min(w, h);
  writeFileSync(page, `<!doctype html><meta charset="utf-8">
<style>
  html,body{margin:0;padding:0;background:transparent}
  body{width:${w}px;height:${h}px;display:flex;align-items:center;justify-content:center;
       background:${bg}}
  img{width:${w - inset * 2}px;height:${h - inset * 2}px;object-fit:contain}
</style><img src="file://${join(PUB, src)}">`);

  execFileSync(chrome, [
    '--headless=new', '--disable-gpu', '--no-sandbox', '--hide-scrollbars',
    '--force-device-scale-factor=1', '--default-background-color=00000000',
    '--allow-file-access-from-files',
    `--window-size=${w},${h}`,
    `--screenshot=${join(PUB, out)}`,
    `file://${page}`,
  ], { stdio: 'pipe' });
  console.log(`  png  public/${out}  ${w}x${h}`);
}
rmSync(TMP, { recursive: true, force: true });
