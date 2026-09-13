/**
 * Poster data model.
 *
 * Pure — no React, no fetch. Turns the /api/poster/:dogId payload into exactly
 * what a poster needs to render, and is honest about what is missing: a lost
 * pet poster without a contact number is worse than no poster, so absent
 * fields surface as gaps the owner can fix, never as invented placeholders.
 */

export interface PosterModel {
  name: string;
  breed: string;
  age: string;
  color: string;
  photoUrl: string | null;
  chipId: string | null;
  lastSeenPlace: string | null;
  lastSeenAt: Date | null;
  /** Formatted for display, e.g. "$200". Null when no reward is offered. */
  reward: string | null;
  contact: string;
  contactName: string;
  reportUrl: string;
}

/** Everything a poster is missing before it is worth printing. */
export interface PosterGaps {
  contact: boolean;
  photo: boolean;
  lastSeen: boolean;
}

const DASH = '—';

export function formatReward(cents: unknown): string | null {
  const n = typeof cents === 'number' ? cents : Number(cents);
  if (!Number.isFinite(n) || n <= 0) return null;
  const dollars = n / 100;
  return dollars % 1 === 0 ? `$${dollars.toLocaleString()}` : `$${dollars.toFixed(2)}`;
}

export function formatLastSeen(at: Date | null): string {
  if (!at) return DASH;
  return at.toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

/** Digits-only tel: href. Returns null when there is nothing dialable. */
export function telHref(contact: string): string | null {
  const digits = contact.replace(/[^\d+]/g, '');
  return digits.length >= 7 ? `tel:${digits}` : null;
}

function parseDate(v: unknown): Date | null {
  if (typeof v !== 'string') return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

function text(v: unknown, fallback = DASH): string {
  return typeof v === 'string' && v.trim() ? v.trim() : fallback;
}

/** Normalise the API payload. Tolerates a partial or absent report. */
export function toPosterModel(payload: any): PosterModel {
  const dog = payload?.dog ?? {};
  const report = payload?.report ?? null;

  return {
    name: text(dog.name, 'Unnamed'),
    breed: text(dog.breed),
    age: text(dog.age),
    color: text(dog.color),
    photoUrl: typeof dog.photo_url === 'string' && dog.photo_url ? dog.photo_url : null,
    chipId: typeof dog.chip_id === 'string' && dog.chip_id ? dog.chip_id : null,
    lastSeenPlace: typeof report?.last_seen_label === 'string' && report.last_seen_label.trim()
      ? report.last_seen_label.trim() : null,
    lastSeenAt: parseDate(report?.created_at),
    reward: formatReward(report?.reward_cents),
    contact: text(payload?.contact, ''),
    contactName: text(payload?.contact_name, ''),
    reportUrl: text(payload?.sighting_url, ''),
  };
}

export function posterGaps(m: PosterModel): PosterGaps {
  return {
    contact: !telHref(m.contact),
    photo: !m.photoUrl,
    lastSeen: !m.lastSeenPlace,
  };
}

/** Short share text for SMS, Web Share, and social captions. */
export function shareText(m: PosterModel): string {
  const where = m.lastSeenPlace ? ` near ${m.lastSeenPlace}` : '';
  const reward = m.reward ? ` ${m.reward} reward.` : '';
  return `LOST DOG: ${m.name}, ${m.breed}${where}.${reward} Sightings: ${m.reportUrl}`;
}
