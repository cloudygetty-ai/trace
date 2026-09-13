/**
 * TRACE identity marks.
 *
 * Geometry lives in src/brand/geometry.mjs and is shared with
 * scripts/build-brand.mjs, so the runtime SVG and the emitted PNG/SVG assets
 * can never drift apart.
 *
 *   <TraceLogo variant="lockup" size={280} animated />   splash / onboarding
 *   <TraceMark size={32} tone="ink" />                   header on parchment
 *   <TraceWordmark size={140} tone="ink" />              nav title
 *
 * `tone="neon"` is the identity palette and needs a dark plate.
 * `tone="ink"`  is the on-parchment variant for the app's warm-wood surfaces.
 */
import { useId } from 'react';
import * as G from '../brand/geometry.mjs';
import type { Channel, Colours, Tone } from '../brand/geometry.mjs';

interface BaseProps {
  /** Rendered width in px. Height follows the mark's aspect ratio. */
  size?: number;
  tone?: Tone;
  /** Neon bloom. Disable below ~24px — the blur swallows the linework. */
  glow?: boolean;
  /** Pulses the broadcast arcs. Respects prefers-reduced-motion. */
  animated?: boolean;
  className?: string;
  title?: string;
}

const MIN_GLOW_PX = 24;

/** Vertical lockup composition — mirrored exactly by scripts/build-brand.mjs. */
const LOCKUP = {
  viewBox: '0 0 1024 880',
  ratio: 880 / 1024,
  mark: 'translate(256 40)',
  word: 'translate(113 610) scale(1.19)',
};

const WORDMARK_RATIO = 190 / 700;

/** Neon tube: a wide dim stroke for the halo, a narrow bright stroke for the core. */
function Tube({ d, c, core, w, opacity = 1 }: { d: string; c: string; core: string; w: number; opacity?: number }) {
  return (
    <>
      <path d={d} fill="none" stroke={c} strokeWidth={w} opacity={opacity} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke={core} strokeWidth={Math.max(w * 0.34, 1)} opacity={opacity * 0.9} strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
}

function Defs({ id, c, glow }: { id: string; c: Colours; glow: boolean }) {
  return (
    <defs>
      <radialGradient id={`${id}-plate`} cx="50%" cy="42%" r="72%">
        <stop offset="0%" stopColor={c.plate0} />
        <stop offset="100%" stopColor={c.plate1} />
      </radialGradient>
      <pattern id={`${id}-hex`} width="42" height="24.2" patternUnits="userSpaceOnUse">
        <path d="M0 12.1 L7 0 L21 0 L28 12.1 L21 24.2 L7 24.2 Z" fill="none" stroke={c.grid} strokeWidth="1" opacity=".5" />
      </pattern>
      {glow && (
        <filter id={`${id}-glow`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="7" result="b1" />
          <feGaussianBlur stdDeviation="18" result="b2" />
          <feMerge>
            <feMergeNode in="b2" />
            <feMergeNode in="b1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      )}
    </defs>
  );
}

function Constellation({ c }: { c: Colours }) {
  return (
    <>
      <g stroke={c.primary} strokeWidth="1" opacity=".16" fill="none">
        {G.NODE_LINKS.map((d, i) => <path key={i} d={d} />)}
      </g>
      <g fill={c.primary} opacity=".45">
        {G.NODES.map((n, i) => <circle key={i} {...n} />)}
      </g>
    </>
  );
}

/** The mark's linework, without viewport or plate — reused by mark and lockup. */
function MarkBody({ c, filter, animated }: { c: Colours; filter?: string; animated: boolean }) {
  return (
    <g filter={filter}>
      <g opacity=".55" className={animated ? 'trace-relay' : undefined}>
        {G.RELAY_ARCS.map((d, i) => <Tube key={i} d={d} c={c.primary} core={c.primaryCore} w={5} opacity={0.9} />)}
      </g>
      <g opacity=".75" className={animated ? 'trace-broadcast' : undefined}>
        {G.BROADCAST_ARCS.map((d, i) => <Tube key={i} d={d} c={c.accent} core={c.accentCore} w={5} opacity={0.9} />)}
      </g>
      <Tube d={G.DOG_OUTLINE} c={c.primary} core={c.primaryCore} w={7} />
      <g opacity=".8">
        {G.DOG_FACETS.map((d, i) => <Tube key={i} d={d} c={c.primary} core={c.primaryCore} w={4.5} />)}
      </g>
      <Tube d={G.DOG_EYE} c={c.primary} core={c.primaryCore} w={3.5} />
      <circle {...G.DOG_NOSE} fill={c.primaryCore} />
      <g opacity=".7" className={animated ? 'trace-ripple' : undefined}>
        {G.RIPPLES.map((r, i) => <ellipse key={i} {...r} fill="none" stroke={c.primary} strokeWidth="4" />)}
      </g>
      <Tube d={G.PIN_OUTLINE} c={c.accent} core={c.accentCore} w={8} />
      {G.PIN_RINGS.map((r, i) => (
        <g key={i}>
          <circle {...r} fill="none" stroke={c.accent} strokeWidth="7" />
          <circle {...r} fill="none" stroke={c.accentCore} strokeWidth="2.4" />
        </g>
      ))}
    </g>
  );
}

function WordmarkBody({ c, filter }: { c: Colours; filter?: string }) {
  return (
    <g filter={filter}>
      {G.WORDMARK.map((l) => (
        <Tube key={l.key} d={l.d} c={c[l.tone as Channel]} core={c[`${l.tone}Core` as keyof Colours]} w={13} />
      ))}
    </g>
  );
}

// ── Public marks ─────────────────────────────────────────────────────────────

export interface MarkProps extends BaseProps {
  /** Draw the dark rounded plate behind the mark. Off = transparent. */
  plate?: boolean;
}

export function TraceMark({
  size = 48, tone = 'neon', glow, plate = false, animated = false, className, title = 'TRACE',
}: MarkProps) {
  const id = useId().replace(/:/g, '');
  const c = G.PALETTE[tone];
  const withGlow = glow ?? size >= MIN_GLOW_PX;
  return (
    <svg viewBox={G.MARK_VIEWBOX} width={size} height={size} className={className} role="img" aria-label={title}>
      <Defs id={id} c={c} glow={withGlow} />
      {plate && (
        <>
          <rect width="512" height="512" rx="96" fill={`url(#${id}-plate)`} />
          <rect width="512" height="512" rx="96" fill={`url(#${id}-hex)`} opacity=".07" />
          <Constellation c={c} />
        </>
      )}
      <MarkBody c={c} filter={withGlow ? `url(#${id}-glow)` : undefined} animated={animated} />
    </svg>
  );
}

export function TraceWordmark({ size = 220, tone = 'neon', glow, className, title = 'TRACE' }: BaseProps) {
  const id = useId().replace(/:/g, '');
  const c = G.PALETTE[tone];
  const withGlow = glow ?? size >= 120;
  return (
    <svg viewBox={G.WORDMARK_VIEWBOX} width={size} height={size * WORDMARK_RATIO} className={className} role="img" aria-label={title}>
      <Defs id={id} c={c} glow={withGlow} />
      <WordmarkBody c={c} filter={withGlow ? `url(#${id}-glow)` : undefined} />
    </svg>
  );
}

export interface LogoProps extends MarkProps {
  variant?: 'lockup' | 'mark' | 'wordmark';
}

/** Vertical lockup: mark over wordmark. The splash/onboarding hero. */
export default function TraceLogo({ variant = 'lockup', size = 280, ...rest }: LogoProps) {
  // Hooks run before any early return — variant must not reorder them.
  const id = useId().replace(/:/g, '');

  if (variant === 'mark') return <TraceMark size={size} {...rest} />;
  if (variant === 'wordmark') return <TraceWordmark size={size} {...rest} />;

  const { tone = 'neon', glow, plate = false, animated = false, className, title = 'TRACE' } = rest;
  const c = G.PALETTE[tone];
  const withGlow = glow ?? true;
  const filter = withGlow ? `url(#${id}-glow)` : undefined;

  return (
    <svg viewBox={LOCKUP.viewBox} width={size} height={size * LOCKUP.ratio} className={className} role="img" aria-label={title}>
      <Defs id={id} c={c} glow={withGlow} />
      {plate && (
        <>
          <rect width="1024" height="880" fill={`url(#${id}-plate)`} />
          <rect width="1024" height="880" fill={`url(#${id}-hex)`} opacity=".07" />
        </>
      )}
      <g transform={LOCKUP.mark}>
        {plate && <Constellation c={c} />}
        <MarkBody c={c} filter={filter} animated={animated} />
      </g>
      <g transform={LOCKUP.word}>
        <WordmarkBody c={c} filter={filter} />
      </g>
    </svg>
  );
}
