/**
 * Image Consulting constants & helpers
 */

// ─── Colour name → hex approximations for swatches ──────────
export const COLOR_HEX: Record<string, string> = {
  coral: '#FF6B6B', peach: '#FFCBA4', gold: '#FFD700', olive: '#808000',
  terracotta: '#C0713A', warm_brown: '#8B4513', cream: '#FFFDD0', rust: '#B7410E',
  mustard: '#FFDB58', camel: '#C19A6B', ivory: '#FFFFF0', warm_red: '#C0392B',
  salmon: '#FA8072', amber: '#FFBF00', navy: '#001F5B', royal_blue: '#4169E1',
  emerald: '#50C878', purple: '#800080', cool_pink: '#FF69B4', silver: '#C0C0C0',
  charcoal: '#36454F', white: '#FFFFFF', black: '#000000', burgundy: '#800020',
  plum: '#DDA0DD', teal: '#008080', lavender: '#E6E6FA', blue: '#0000FF',
  jade: '#00A86B', dusty_pink: '#D4A5A5', soft_white: '#F8F8F0', medium_gray: '#9E9E9E',
  beige: '#F5F5DC', taupe: '#483C32', fuchsia: '#FF00FF', true_red: '#CC0000',
  icy_pink: '#FFB6C1', sage: '#BCB88A', mauve: '#E0B0FF', cool_gray: '#95A5A6',
  tan: '#D2B48C', chocolate: '#7B3F00', warm_gray: '#9E9E9E',
};

export function colorHex(name: string): string {
  const key = name.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_');
  return COLOR_HEX[key] ?? '#DDDDDD';
}
