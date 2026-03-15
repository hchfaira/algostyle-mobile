/**
 * Wardrobe constants, types and helpers
 */
import { Dimensions } from 'react-native';
import { Spacing } from '../../constants/theme';
import type { GarmentCategory } from '../../types';

export { CATEGORY_EMOJI } from '../common/constants';

const { width: SCREEN_W } = Dimensions.get('window');
export const CARD_GAP = 16;
export const CARD_WIDTH = (SCREEN_W - Spacing.lg * 2 - CARD_GAP) / 2;

// Row card: 3 visible at once with padding
export const ROW_CARD_GAP = 10;
export const ROW_CARD_WIDTH = (SCREEN_W - Spacing.lg * 2 - ROW_CARD_GAP * 2) / 3;

export const CATEGORIES: { key: GarmentCategory | 'all'; label: string }[] = [
  { key: 'all',        label: 'All' },
  { key: 'top',        label: 'Tops' },
  { key: 'bottom',     label: 'Bottoms' },
  { key: 'dress',      label: 'Dresses' },
  { key: 'outerwear',  label: 'Outercoats' },
  { key: 'shoes',      label: 'Shoes' },
  { key: 'accessory',  label: 'Accessories' },
];

// Categories shown as browsable sections (no "All")
export const BROWSABLE_CATEGORIES: { key: GarmentCategory; label: string; icon: string; emoji: string }[] = [
  { key: 'top',       label: 'Tops',        icon: 'shirt-outline',     emoji: '👕' },
  { key: 'bottom',    label: 'Bottoms',     icon: 'resize-outline',    emoji: '👖' },
  { key: 'dress',     label: 'Dresses',     icon: 'woman-outline',     emoji: '👗' },
  { key: 'outerwear', label: 'Outercoats',  icon: 'snow-outline',      emoji: '🧥' },
  { key: 'shoes',     label: 'Shoes',       icon: 'footsteps-outline', emoji: '👟' },
  { key: 'accessory', label: 'Accessories', icon: 'watch-outline',     emoji: '💍' },
];

export const CATEGORY_ICONS: Record<string, string> = {
  top: 'shirt-outline',
  bottom: 'resize-outline',
  dress: 'woman-outline',
  shoes: 'footsteps-outline',
  accessory: 'watch-outline',
  outerwear: 'snow-outline',
};

export const ADD_MENU_ITEMS: { cat?: string; label: string }[] = [
  { cat: undefined,    label: 'Auto Detect' },
  { cat: 'top',        label: 'Top' },
  { cat: 'bottom',     label: 'Bottom' },
  { cat: 'dress',      label: 'Dress' },
  { cat: 'outerwear',  label: 'Outerwear' },
  { cat: 'shoes',      label: 'Shoes' },
  { cat: 'accessory',  label: 'Accessory' },
];

export function formatFormality(f: string): string {
  const MAP: Record<string, string> = {
    casual: 'Casual',
    smart_casual: 'Smart Casual',
    business_casual: 'Business Casual',
    formal: 'Formal',
    black_tie: 'Black Tie',
  };
  return MAP[f] || f.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
