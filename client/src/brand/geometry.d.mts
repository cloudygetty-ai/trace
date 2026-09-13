/** Type surface for geometry.mjs — the brand's single source of truth. */

export type Tone = 'neon' | 'ink';
export type Channel = 'primary' | 'accent';

export interface Colours {
  primary: string;
  primaryCore: string;
  accent: string;
  accentCore: string;
  plate0: string;
  plate1: string;
  grid: string;
}

export interface Circle { cx: number; cy: number; r: number }
export interface Ellipse { cx: number; cy: number; rx: number; ry: number }
export interface Letter { key: string; tone: Channel; d: string }

export declare const PALETTE: Record<Tone, Colours>;
export declare const MARK_VIEWBOX: string;
export declare const WORDMARK_VIEWBOX: string;
export declare const DOG_OUTLINE: string;
export declare const DOG_FACETS: readonly string[];
export declare const DOG_EYE: string;
export declare const DOG_NOSE: Circle;
export declare const PIN_OUTLINE: string;
export declare const PIN_RINGS: readonly Circle[];
export declare const RIPPLES: readonly Ellipse[];
export declare const RELAY_ARCS: readonly string[];
export declare const BROADCAST_ARCS: readonly string[];
export declare const NODES: readonly Circle[];
export declare const NODE_LINKS: readonly string[];
export declare const WORDMARK: readonly Letter[];
