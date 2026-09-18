/* ── Admin Design System ──
   Single source of truth for all admin panel visual tokens.
   Import from: import { admin, cardStyle, badgeDot, ... } from './adminStyles';

   Border-radius scale: small=5px, medium=8px, large=12px
   Card treatment: subtle gradient border + soft inner glow
   Stat numbers: text-shadow for depth
   Consistent spacing rhythm
*/

import type { CSSProperties } from 'react';

// ── Radius Scale ──
export const R = { sm: 5, md: 8, lg: 12 } as const;

// ── Shared Card Style ──
// gradient border via background-clip trick + soft inner glow
export const cardStyle: CSSProperties = {
  borderRadius: R.lg,
  background: 'rgba(14, 22, 42, 0.6)',
  border: '1px solid transparent',
  backgroundImage: 'linear-gradient(rgba(14,22,42,0.6), rgba(14,22,42,0.6)), linear-gradient(135deg, rgba(100,160,240,0.12) 0%, rgba(100,160,240,0.02) 50%, rgba(100,160,240,0) 100%)',
  backgroundOrigin: 'border-box',
  backgroundClip: 'padding-box, border-box',
  boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.02), 0 1px 3px rgba(0,0,0,0.2)',
};

// ── Card variant: section wrapper ──
export const sectionCard: CSSProperties = {
  ...cardStyle,
  padding: '20px 22px',
};

// ── Card variant: clickable (summary cards, page rows) ──
export const clickableCard: CSSProperties = {
  ...cardStyle,
  textDecoration: 'none',
  color: '#e2e8f0',
  cursor: 'pointer',
  transition: 'border-color 200ms, box-shadow 200ms',
};

// ── Stat Value: subtle text-shadow for depth ──
export const statValue: CSSProperties = {
  fontSize: 28,
  fontWeight: 700,
  color: '#f0f4ff',
  textShadow: '0 0 20px rgba(74,155,255,0.15)',
  lineHeight: 1.1,
};

export const statValueLarge: CSSProperties = {
  ...statValue,
  fontSize: 32,
};

// ── Stat Label ──
export const statLabel: CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: '#7c8aa8',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};

// ── Stat Sub ──
export const statSub: CSSProperties = {
  fontSize: 11,
  color: '#5a6a84',
  marginTop: 4,
};

// ── Badge with dot indicator ──
export function badgeDotStyle(
  color: string,
  bg: string,
  border: string,
): CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '3px 10px',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    color,
    background: bg,
    border: `1px solid ${border}`,
    lineHeight: '16px',
  };
}

// Predefined badge variants
export const badges = {
  published: badgeDotStyle('#4ade80', 'rgba(74,222,128,0.1)', 'rgba(74,222,128,0.2)'),
  draft: badgeDotStyle('#94a3b8', 'rgba(148,163,184,0.08)', 'rgba(148,163,184,0.15)'),
  new: badgeDotStyle('#60a5fa', 'rgba(59,130,246,0.12)', 'rgba(59,130,246,0.25)'),
  replied: badgeDotStyle('#4ade80', 'rgba(34,197,94,0.12)', 'rgba(34,197,94,0.25)'),
  archived: badgeDotStyle('#94a3b8', 'rgba(148,163,184,0.1)', 'rgba(148,163,184,0.2)'),
  configured: badgeDotStyle('#4ade80', 'rgba(74,222,128,0.1)', 'rgba(74,222,128,0.2)'),
  defaultSeo: badgeDotStyle('#94a3b8', 'rgba(148,163,184,0.08)', 'rgba(148,163,184,0.15)'),
} as const;

// ── Table shared styles ──
export const table: Record<string, CSSProperties> = {
  wrap: {
    ...cardStyle,
    overflow: 'hidden',
    padding: 0,
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th: {
    padding: '10px 16px',
    textAlign: 'left',
    fontWeight: 600,
    color: '#7c8aa8',
    background: 'rgba(14, 22, 42, 0.5)',
    borderBottom: '1px solid rgba(100, 160, 240, 0.08)',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  tr: {
    borderBottom: '1px solid rgba(100, 160, 240, 0.05)',
    transition: 'background 150ms',
  },
  td: {
    padding: '12px 16px',
    color: '#c8d2e0',
    verticalAlign: 'middle',
  },
};

// ── Button shared styles ──
export const btn = {
  primary: {
    padding: '9px 18px',
    borderRadius: R.md,
    border: 'none',
    background: 'linear-gradient(135deg, #267dff, #579dff)',
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
    transition: 'opacity 150ms',
  },
  ghost: {
    padding: '6px 14px',
    borderRadius: R.sm,
    border: '1px solid rgba(100, 160, 240, 0.15)',
    background: 'transparent',
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 150ms',
  },
  danger: {
    padding: '6px 14px',
    borderRadius: R.sm,
    border: '1px solid rgba(248, 113, 113, 0.2)',
    background: 'transparent',
    color: '#f87171',
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 150ms',
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
    borderRadius: R.sm,
    background: 'rgba(100,160,240,0.06)',
    border: '1px solid rgba(100,160,240,0.08)',
    color: '#7c8aa8',
    cursor: 'pointer',
    padding: 0,
    fontSize: 13,
    transition: 'all 150ms',
  } as CSSProperties,
};

// ── Search Input ──
export const searchInput: CSSProperties = {
  flex: 1,
  padding: '9px 12px',
  border: 'none',
  outline: 'none',
  background: 'transparent',
  color: '#e2e8f0',
  fontSize: 13,
};

export const searchWrap: CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  padding: '0 12px',
  borderRadius: R.md,
  background: 'rgba(14,22,42,0.5)',
  border: '1px solid rgba(100,160,240,0.1)',
};

// ── Page Header (consistent across all pages) ──
export const pageHeader: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: 24,
};

export const pageTitle: CSSProperties = {
  margin: 0,
  fontSize: 22,
  fontWeight: 600,
  color: '#f0f4ff',
};

export const pageSub: CSSProperties = {
  margin: '4px 0 0',
  fontSize: 13,
  color: '#7c8aa8',
};

// ── Empty state ──
export const emptyState: CSSProperties = {
  ...cardStyle,
  padding: '64px 24px',
  textAlign: 'center',
  borderStyle: 'dashed',
  backgroundImage: 'none',
  borderColor: 'rgba(100, 160, 240, 0.12)',
  backgroundColor: 'rgba(14, 22, 42, 0.4)',
};

// ── Modal ──
export const modal = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(4px)',
  } as CSSProperties,
  content: {
    width: '100%',
    maxWidth: 420,
    padding: '28px 32px',
    borderRadius: R.lg,
    background: 'rgba(14, 22, 42, 0.95)',
    border: '1px solid rgba(100, 160, 240, 0.12)',
    boxShadow: '0 24px 64px rgba(0, 0, 0, 0.5)',
  } as CSSProperties,
};

// ── Chart gradient bar ──
export const chartBar: CSSProperties = {
  width: '100%',
  minHeight: 2,
  borderRadius: '3px 3px 0 0',
  background: 'linear-gradient(to top, #1d4ed8, #60a5fa)',
  transition: 'height 300ms ease',
  boxShadow: '0 0 8px rgba(96,165,250,0.2)',
};

// ── Input ──
export const input: CSSProperties = {
  padding: '10px 14px',
  borderRadius: R.md,
  border: '1px solid rgba(100, 160, 240, 0.12)',
  background: 'rgba(6, 12, 28, 0.7)',
  color: '#e2e8f0',
  fontSize: 14,
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 150ms',
};

// ── Loading ──
export const loading: CSSProperties = {
  padding: 48,
  color: '#7c8aa8',
  fontSize: 14,
};
