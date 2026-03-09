/**
 * Marketplace-specific types and constants.
 */
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/theme';

// ─── Types ────────────────────────────────────────────────────
export type Source = 'all' | 'brand' | 'user';
export type Condition = 'all' | 'new' | 'like_new' | 'good' | 'used';
export type SortKey = 'recent' | 'price_asc' | 'price_desc' | 'popular';
export type Category = 'all' | 'top' | 'bottom' | 'dress' | 'outerwear' | 'shoes' | 'accessory';
export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | '36' | '37' | '38' | '39' | '40' | '41' | '42';

export interface ListingItem {
  id: string;
  title: string;
  brand: string;
  price: number;
  originalPrice?: number;
  category: Category;
  condition: Condition;
  source: Source;
  size: string;
  colorHex: string;
  colorName: string;
  isFavorited: boolean;
  sellerName?: string;
  sellerRating?: number;
  badge?: string;
}

// ─── Constants ────────────────────────────────────────────────
export const CATEGORIES: { key: Category; label: string; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
  { key: 'all',       label: 'All',         icon: 'grid-outline' },
  { key: 'top',       label: 'Tops',        icon: 'shirt-outline' },
  { key: 'bottom',    label: 'Bottoms',     icon: 'cut-outline' },
  { key: 'dress',     label: 'Dresses',     icon: 'rose-outline' },
  { key: 'outerwear', label: 'Coats',       icon: 'layers-outline' },
  { key: 'shoes',     label: 'Shoes',       icon: 'footsteps-outline' },
  { key: 'accessory', label: 'Accessories', icon: 'watch-outline' },
];

export const CONDITIONS: { key: Condition; label: string }[] = [
  { key: 'all',      label: 'Any condition' },
  { key: 'new',      label: 'Brand new' },
  { key: 'like_new', label: 'Like new' },
  { key: 'good',     label: 'Good' },
  { key: 'used',     label: 'Used' },
];

export const SORTS: { key: SortKey; label: string }[] = [
  { key: 'recent',     label: 'Newest first' },
  { key: 'price_asc',  label: 'Price: low → high' },
  { key: 'price_desc', label: 'Price: high → low' },
  { key: 'popular',    label: 'Most popular' },
];

export const SIZES: Size[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '37', '38', '39', '40', '41', '42'];

export const CONDITION_LABELS: Record<Condition, string> = {
  all: 'Any', new: 'New', like_new: 'Like New', good: 'Good', used: 'Used',
};

export const BADGE_COLORS: Record<string, string> = {
  'SALE': Colors.error,
  'NEW IN': Colors.accent,
  'TRENDING': Colors.accentWarm,
};

// ─── Helpers ──────────────────────────────────────────────────
export function formatPrice(p: number) {
  return `€${p}`;
}

export function activeFilterCount(
  source: Source,
  condition: Condition,
  minPrice: string,
  maxPrice: string,
  selectedSizes: string[],
  sort: SortKey,
): number {
  let n = 0;
  if (source !== 'all') n++;
  if (condition !== 'all') n++;
  if (minPrice || maxPrice) n++;
  if (selectedSizes.length > 0) n++;
  if (sort !== 'recent') n++;
  return n;
}

// ─── Mock data ────────────────────────────────────────────────
export const MOCK_LISTINGS: ListingItem[] = [
  { id: '1',  title: 'Oversized Wool Coat',         brand: 'COS',        price: 189, originalPrice: 250, category: 'outerwear', condition: 'new',      source: 'brand',  size: 'M',  colorHex: '#3D3D3D', colorName: 'Charcoal',   isFavorited: false, badge: 'SALE' },
  { id: '2',  title: 'High-Rise Straight Jeans',    brand: '@maya_wears', price: 35,                      category: 'bottom',    condition: 'like_new', source: 'user',   size: '38', colorHex: '#6B7FA3', colorName: 'Indigo',     isFavorited: false, sellerName: 'Maya', sellerRating: 4.8 },
  { id: '3',  title: 'Linen Relaxed Shirt',         brand: 'Arket',      price: 79,                      category: 'top',       condition: 'new',      source: 'brand',  size: 'S',  colorHex: '#E8DCC8', colorName: 'Sand',       isFavorited: false, badge: 'NEW IN' },
  { id: '4',  title: 'Leather Chelsea Boots',       brand: '@karim.fit',  price: 68,  originalPrice: 120, category: 'shoes',     condition: 'good',     source: 'user',   size: '42', colorHex: '#1A1A1A', colorName: 'Black',      isFavorited: false, sellerName: 'Karim', sellerRating: 4.5 },
  { id: '5',  title: 'Knit Midi Dress',             brand: 'Sandro',     price: 145,                     category: 'dress',     condition: 'new',      source: 'brand',  size: 'M',  colorHex: '#C4A882', colorName: 'Camel',      isFavorited: true,  badge: 'TRENDING' },
  { id: '6',  title: 'Slim Chino Trousers',         brand: '@lea_mode',   price: 28,                      category: 'bottom',    condition: 'used',     source: 'user',   size: '36', colorHex: '#C8BEA8', colorName: 'Stone',      isFavorited: false, sellerName: 'Léa', sellerRating: 4.2 },
  { id: '7',  title: 'Merino Roll-Neck',            brand: 'Uniqlo',     price: 49,                      category: 'top',       condition: 'new',      source: 'brand',  size: 'L',  colorHex: '#2D2D2D', colorName: 'Black',      isFavorited: false },
  { id: '8',  title: 'Statement Gold Necklace',     brand: '@style_sara', price: 22,  originalPrice: 45,  category: 'accessory', condition: 'like_new', source: 'user',   size: 'ONE',colorHex: '#D4AF37', colorName: 'Gold',       isFavorited: false, sellerName: 'Sara', sellerRating: 5.0 },
  { id: '9',  title: 'Wide-Leg Linen Trousers',     brand: 'Massimo D.', price: 89,                      category: 'bottom',    condition: 'new',      source: 'brand',  size: 'S',  colorHex: '#F0EBE0', colorName: 'Ecru',       isFavorited: false, badge: 'NEW IN' },
  { id: '10', title: 'Puffer Gilet',                brand: '@rami.shop',  price: 44,  originalPrice: 75,  category: 'outerwear', condition: 'good',     source: 'user',   size: 'L',  colorHex: '#4A4A4A', colorName: 'Slate',      isFavorited: false, sellerName: 'Rami', sellerRating: 4.6 },
  { id: '11', title: 'Tailored Blazer',             brand: 'Zara',       price: 99,  originalPrice: 129, category: 'outerwear', condition: 'new',      source: 'brand',  size: 'M',  colorHex: '#1A1A1A', colorName: 'Black',      isFavorited: false, badge: 'SALE' },
  { id: '12', title: 'Slip Midi Skirt',             brand: '@hana.closet',price: 18,                      category: 'bottom',    condition: 'like_new', source: 'user',   size: '38', colorHex: '#D4B5C8', colorName: 'Blush',      isFavorited: false, sellerName: 'Hana', sellerRating: 4.9 },
  { id: '13', title: 'Suede Loafers',               brand: 'Mango',      price: 65,                      category: 'shoes',     condition: 'new',      source: 'brand',  size: '40', colorHex: '#A0785A', colorName: 'Tan',        isFavorited: false },
  { id: '14', title: 'Cashmere Crewneck',           brand: '@ali.looks',  price: 55,  originalPrice: 180, category: 'top',       condition: 'good',     source: 'user',   size: 'M',  colorHex: '#7B9E87', colorName: 'Sage',       isFavorited: false, sellerName: 'Ali', sellerRating: 4.7 },
  { id: '15', title: 'Mini Crossbody Bag',          brand: 'COS',        price: 79,                      category: 'accessory', condition: 'new',      source: 'brand',  size: 'ONE',colorHex: '#2D2D2D', colorName: 'Black',      isFavorited: false, badge: 'TRENDING' },
  { id: '16', title: 'Denim Trucker Jacket',        brand: '@nour.style', price: 38,                      category: 'outerwear', condition: 'used',     source: 'user',   size: 'S',  colorHex: '#5B7A9A', colorName: 'Blue Denim', isFavorited: false, sellerName: 'Nour', sellerRating: 4.3 },
];
