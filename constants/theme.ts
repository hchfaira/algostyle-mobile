/**
 * AlgoStyle — Design Tokens & Theme
 * ASOS-inspired: bold black & white, editorial fashion, clean typography
 */

export const Colors = {
  // ─── Core Palette ───────────────────────────────
  background: '#FFFFFF',         // Pure white — clean fashion canvas
  surface: '#FFFFFF',            // Card background — white
  surfaceLight: '#F8F8F8',       // Elevated surface — barely grey
  surfaceGlass: 'rgba(0,0,0,0.04)', // Subtle hover/press state

  // ─── Text ───────────────────────────────────────
  textPrimary: '#2D2D2D',       // Near-black — high contrast
  textSecondary: '#666666',      // Medium grey — supporting text
  textMuted: '#999999',          // Light grey — captions / hints
  textOnAccent: '#FFFFFF',       // White on dark buttons

  // ─── Accent Colors ─────────────────────────────
  accent: '#2D2D2D',             // Black — primary CTA (ASOS style)
  accentSecondary: '#2D2D2D',    // Same black — no gradient needed
  accentTertiary: '#018849',     // ASOS green — for success states
  accentWarm: '#FF5722',         // Bold orange — sale / promo

  // ─── Gradients ─────────────────────────────────
  gradientStart: '#2D2D2D',
  gradientEnd: '#2D2D2D',
  gradientSubtle: ['#FFFFFF', '#F8F8F8'] as const,

  // ─── Borders ───────────────────────────────────
  border: '#EEEEEE',
  borderFocus: '#2D2D2D',

  // ─── Status ────────────────────────────────────
  success: '#018849',            // ASOS green
  error: '#D01345',              // Bold red
  warning: '#FF8800',            // Orange
  info: '#0770CF',               // Blue

  // ─── Category Colors ──────────────────────────
  categoryTop: '#2D2D2D',
  categoryBottom: '#525252',
  categoryDress: '#D01345',
  categoryOuterwear: '#525252',
  categoryShoes: '#2D2D2D',
  categoryAccessory: '#0770CF',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 20,
  full: 9999,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 22,
  xxl: 28,
  xxxl: 34,
  hero: 42,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  black: '800' as const,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  }),
};
