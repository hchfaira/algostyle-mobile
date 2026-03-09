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

export const CATEGORIES: { key: GarmentCategory | 'all'; label: string }[] = [
  { key: 'all',        label: 'All' },
  { key: 'top',        label: 'Tops' },
  { key: 'bottom',     label: 'Bottoms' },
  { key: 'dress',      label: 'Dresses' },
  { key: 'outerwear',  label: 'Outercoats' },
  { key: 'shoes',      label: 'Shoes' },
  { key: 'accessory',  label: 'Accessories' },
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
