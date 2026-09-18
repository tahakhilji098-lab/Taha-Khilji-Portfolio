/* ─── Motion Design Tokens ─────────────────────────────────────────────
   Single source of truth for the portfolio's motion system: durations,
   easing curves, springs, reveal distances, stagger intervals and
   viewport settings. Backwards compatible with the legacy values in
   src/motion/primitives.tsx — new sections consume tokens instead of
   magic numbers. */

export type Easing = [number, number, number, number];

/* ─── Durations (seconds) ─── */
export const durations = {
  instant: 0.16,
  micro: 0.22,
  fast: 0.32,
  standard: 0.48,
  reveal: 0.72,
  cinematic: 1.0,
  slowCinematic: 1.2,
} as const;

/* ─── Easing Curves (cubic-bezier) ─── */
export const easings = {
  premium: [0.22, 1, 0.36, 1] as const,
  soft: [0.16, 1, 0.3, 1] as const,
  standard: [0.4, 0, 0.2, 1] as const,
  entrance: [0.16, 1, 0.3, 1] as const,
  exit: [0.7, 0, 0.84, 0] as const,
} as const;

/* ─── Springs ─── */
export type SpringConfig = {
  type: 'spring';
  stiffness: number;
  damping: number;
  mass: number;
};

export const springs = {
  micro: { type: 'spring', stiffness: 420, damping: 32, mass: 0.55 },
  snappy: { type: 'spring', stiffness: 340, damping: 30, mass: 0.7 },
  smooth: { type: 'spring', stiffness: 220, damping: 28, mass: 0.85 },
  soft: { type: 'spring', stiffness: 120, damping: 24, mass: 1 },
} as const satisfies Record<string, SpringConfig>;

/* ─── Reveal Distances (px) ─── */
export const distances = {
  small: 12,
  medium: 24,
  large: 44,
  cinematic: 64,
} as const;

/* ─── Stagger Intervals (seconds between children) ─── */
export const staggers = {
  tight: 0.045,
  standard: 0.075,
  editorial: 0.11,
} as const;

/* ─── Viewport Settings ───
   All major reveals run once — never replays while scrolling up and down.
   The bottom margin lets animations complete before elements reach the
   viewport centre while scrolling downward. */
export const viewports = {
  standard: { once: true, amount: 0.22, margin: '0px 0px -8% 0px' as const },
  early: { once: true, amount: 0.12, margin: '0px 0px 12% 0px' as const },
  deep: { once: true, amount: 0.35, margin: '0px 0px -8% 0px' as const },
} as const;

/* ─── Reduced Motion ─── */
export const reducedMotion = {
  duration: durations.instant,
  ease: 'linear' as const,
} as const;