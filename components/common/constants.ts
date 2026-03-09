/**
 * Common utilities and helper functions for components
 */

export const CATEGORY_EMOJI: Record<string, string> = {
  top: '👕',
  bottom: '👖',
  dress: '👗',
  outerwear: '🧥',
  shoes: '👟',
  accessory: '💍',
};

export const OCCASION_EMOJI: Record<string, string> = {
  casual: '🎽',
  business: '💼',
  formal: '🎩',
  date: '❤️',
  party: '🎉',
  wedding: '💒',
  interview: '🤝',
  sport: '⚽',
  travel: '✈️',
  beach: '🏖️',
};

export const SCORE_LABELS: Record<string, { label: string; color: string }> = {
  color_harmony: { label: 'Color Harmony', color: '#2D2D2D' },
  formality_match: { label: 'Formality', color: '#525252' },
  occasion_fit: { label: 'Occasion Fit', color: '#2D2D2D' },
  pattern_mixing: { label: 'Pattern Mixing', color: '#525252' },
  proportion: { label: 'Proportion', color: '#2D2D2D' },
  season_fit: { label: 'Season Fit', color: '#525252' },
  creativity: { label: 'Creativity', color: '#2D2D2D' },
};
