/**
 * The TRACE missing-dog poster.
 *
 * One layout, two renditions from the same model:
 *   signal — neon HUD on a dark plate. For screens: broadcast, social, DMs.
 *   print  — high contrast on white. For paper: ink-light, legible at arm's
 *            length, phone number readable from across a street.
 *
 * Rendered as HTML rather than SVG so web fonts resolve during print/PDF
 * export; an SVG serialised to canvas loses every external font.
 *
 * Fixed 4:5 aspect (1080x1350) — the ratio that survives both a flyer and a
 * social feed. The board scales via CSS custom property `--u`, so every size
 * below is a fraction of the poster width and the layout holds at any render
 * size from a phone preview to a full sheet.
 */
import { TraceMark, TraceWordmark } from './Logo';
import type { Tone } from '../brand/geometry.mjs';
import { formatLastSeen, telHref, type PosterModel } from '../lib/poster';

export type Rendition = 'signal' | 'print';

interface Props {
  model: PosterModel;
  rendition?: Rendition;
  /** Poster width in px. Height follows the 4:5 ratio. */
  width?: number;
  className?: string;
}

/** Notched corners — the HUD frame motif, cut rather than rounded. */
const NOTCH = (n: string) =>
  `polygon(${n} 0, 100% 0, 100% calc(100% - ${n}), calc(100% - ${n}) 100%, 0 100%, 0 ${n})`;

/** Surface tokens for one rendition. Both renditions fill the same contract. */
interface PosterTheme {
  plate: string;
  ink: string;
  dim: string;
  line: string;
  fill: string;
  accent: string;
  accentInk: string;
  signal: string;
  tone: Tone;
}

/** Small caps label, used wherever a field is named. Never wraps. */
const LABEL: React.CSSProperties = {
  fontSize: 'calc(var(--u) * .019)',
  letterSpacing: '.12em',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
};

const THEME: Record<Rendition, PosterTheme> = {
  signal: {
    plate: '#04090D',
    ink: '#DFF7FA',
    dim: '#6E949C',
    line: 'rgba(47,233,242,.30)',
    fill: 'rgba(47,233,242,.05)',
    accent: '#FF8A2B',
    accentInk: '#04090D',
    signal: '#2FE9F2',
    tone: 'neon',
  },
  print: {
    plate: '#FFFFFF',
    ink: '#0A1116',
    dim: '#5C6B72',
    line: 'rgba(10,17,22,.28)',
    fill: 'rgba(10,17,22,.03)',
    accent: '#D2540F',
    accentInk: '#FFFFFF',
    signal: '#0E7C86',
    tone: 'ink',
  },
};

function Row({ label, value, sub, t, strong }: {
  label: string; value: string; sub?: string; t: PosterTheme; strong?: boolean;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 'calc(var(--u) * .022)', padding: 'calc(var(--u) * .0105) 0' }}>
      <span style={{
        flex: '0 0 calc(var(--u) * .22)', fontSize: 'calc(var(--u) * .019)', letterSpacing: '.12em',
        textTransform: 'uppercase', color: t.dim, fontWeight: 500, whiteSpace: 'nowrap',
      }}>{label}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{
          display: 'block', fontSize: `calc(var(--u) * ${strong ? '.036' : '.029'})`,
          fontWeight: strong ? 700 : 600, color: t.ink, lineHeight: 1.15,
        }}>{value}</span>
        {sub && (
          <span style={{ display: 'block', fontSize: 'calc(var(--u) * .021)', color: t.dim, lineHeight: 1.3 }}>
            {sub}
          </span>
        )}
      </span>
    </div>
  );
}

export default function PosterCard({ model, rendition = 'signal', width = 360, className }: Props) {
  const t = THEME[rendition];
  const neon = rendition === 'signal';
  const dialable = telHref(model.contact);

  return (
    <div
      className={`trace-poster${className ? ` ${className}` : ''}`}
      style={{
        // --u drives every dimension: the poster is resolution-independent.
        ['--u' as string]: `${width}px`,
        width, height: width * 1.25,
        background: neon
          ? `radial-gradient(120% 90% at 50% 18%, #0A1A22 0%, ${t.plate} 70%)`
          : t.plate,
        color: t.ink,
        fontFamily: '"Chakra Petch", "DM Mono", ui-monospace, monospace',
        position: 'relative', overflow: 'hidden',
        padding: 'calc(var(--u) * .045)',
        display: 'flex', flexDirection: 'column', gap: 'calc(var(--u) * .018)',
      }}
    >
      {/* HUD substrate — screens only. Paper gets no texture and no bloom. */}
      {neon && (
        <svg viewBox="0 0 1080 1350" preserveAspectRatio="none" aria-hidden
             style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: .5 }}>
          <defs>
            <pattern id="pc-hex" width="42" height="24.2" patternUnits="userSpaceOnUse">
              <path d="M0 12.1 L7 0 L21 0 L28 12.1 L21 24.2 L7 24.2 Z" fill="none" stroke="#2FE9F2" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="1080" height="1350" fill="url(#pc-hex)" opacity=".10" />
          <g stroke="#2FE9F2" strokeWidth="3" fill="none" opacity=".45">
            <path d="M14 70 V14 H70" /><path d="M1010 14 H1066 V70" />
            <path d="M1066 1280 V1336 H1010" /><path d="M70 1336 H14 V1280" />
          </g>
        </svg>
      )}

      {/* Masthead */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', flex: '0 0 auto' }}>
        <TraceWordmark size={width * 0.26} tone={t.tone} glow={false} />
        <span style={{
          fontSize: 'calc(var(--u) * .0195)', letterSpacing: '.2em', textTransform: 'uppercase', color: t.dim,
        }}>Relay · Alert · Recover</span>
      </header>

      {/* Alert banner — the one element that must read from across a street. */}
      <div style={{
        background: t.accent, color: t.accentInk, clipPath: NOTCH('calc(var(--u) * .028)'),
        padding: 'calc(var(--u) * .018) calc(var(--u) * .032)', position: 'relative', flex: '0 0 auto',
      }}>
        <p style={{ fontSize: 'calc(var(--u) * .05)', fontWeight: 700, letterSpacing: '.04em', lineHeight: 1 }}>
          ALERT: LOST DOG
        </p>
        <p style={{ fontSize: 'calc(var(--u) * .022)', letterSpacing: '.14em', textTransform: 'uppercase', opacity: .85, marginTop: 'calc(var(--u) * .006)' }}>
          {model.reward ? `${model.reward} reward · urgent recovery` : 'Urgent recovery'}
        </p>
      </div>

      {/* Subject */}
      <div style={{ position: 'relative', flex: '0 0 auto' }}>
        <p style={{ fontSize: 'calc(var(--u) * .092)', fontWeight: 700, lineHeight: .95, letterSpacing: '-.01em' }}>
          {model.name.toUpperCase()}
        </p>
      </div>

      {/* Photo — the HUD viewport. Falls back to the mark, never to an emoji. */}
      <div style={{
        // Absorbs the slack, but never collapses to a sliver on a tall body.
        flex: '1 1 0', minHeight: 'calc(var(--u) * .20)', position: 'relative',
        border: `calc(var(--u) * .006) solid ${t.line}`, background: t.fill,
        clipPath: NOTCH('calc(var(--u) * .046)'),
        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
      }}>
        {model.photoUrl ? (
          <img src={model.photoUrl} alt={model.name}
               style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ textAlign: 'center', padding: 'calc(var(--u) * .02)' }}>
            <TraceMark size={width * 0.22} tone={t.tone} glow={neon} />
            <p style={{ fontSize: 'calc(var(--u) * .019)', letterSpacing: '.14em', textTransform: 'uppercase', color: t.dim, marginTop: 'calc(var(--u) * .014)' }}>
              No photo on file
            </p>
          </div>
        )}
      </div>

      {/* Identification */}
      <div style={{ position: 'relative', flex: '0 0 auto' }}>
        <Row label="Breed / Age" value={`${model.breed}, ${model.age}`} t={t} />
        <Row label="Markings" value={model.color} t={t} />
        <Row
          label="Last seen"
          value={model.lastSeenPlace ?? 'Location not recorded'}
          sub={model.lastSeenAt ? formatLastSeen(model.lastSeenAt) : undefined}
          t={t}
          strong
        />
      </div>

      {/* Contact — the poster's entire job. A gap here is stated, not faked. */}
      <div style={{
        border: `calc(var(--u) * .006) solid ${dialable ? t.accent : t.line}`,
        clipPath: NOTCH('calc(var(--u) * .028)'),
        padding: 'calc(var(--u) * .021) calc(var(--u) * .028)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        gap: 'calc(var(--u) * .02)', position: 'relative', flex: '0 0 auto',
      }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ ...LABEL, color: t.dim }}>
            {dialable ? `Call or text${model.contactName ? ` ${model.contactName}` : ''}` : 'No contact number'}
          </p>
          <p style={{
            fontSize: 'calc(var(--u) * .05)', fontWeight: 700, lineHeight: 1.1,
            color: dialable ? t.ink : t.dim,
            // A phone number must never break; the fallback prompt may wrap.
            whiteSpace: dialable ? 'nowrap' : 'normal',
          }}>
            {dialable ? model.contact : 'Add one in Settings'}
          </p>
          <p style={{ fontSize: 'calc(var(--u) * .018)', color: t.dim, lineHeight: 1.3 }}>
            Do not chase · call first
          </p>
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p style={{ ...LABEL, color: t.dim }}>Report a sighting</p>
          {/* TODO[high]: render reportUrl as a QR code — a printed poster is
              scanned far more often than it is typed. Needs an encoder dep. */}
          <p style={{ fontSize: 'calc(var(--u) * .026)', fontWeight: 600, color: t.signal, lineHeight: 1.2 }}>
            {model.reportUrl.replace(/^https?:\/\//, '')}
          </p>
          {model.chipId && (
            <p style={{ fontSize: 'calc(var(--u) * .018)', color: t.dim, lineHeight: 1.3 }}>
              Chip {model.chipId}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
