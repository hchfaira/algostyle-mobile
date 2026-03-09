/**
 * Wardrobe and garment-related types
 */

export type GarmentCategory = 'top' | 'bottom' | 'dress' | 'outerwear' | 'shoes' | 'accessory';

export interface GarmentAttributes {
  category: GarmentCategory;
  subcategory?: string;
  color_primary: string;
  color_hex?: string;
  color_secondary?: string;
  pattern: string;
  material?: string;
  formality: string;
  seasons: string[];
  confidence: number;
}

export interface GarmentItem {
  id: string;
  user_id: string;
  image_url?: string;
  attributes: GarmentAttributes;
  is_favorite: boolean;
  for_sale: boolean;
  tags: string[];
  times_worn: number;
  last_worn?: string;
  created_at: string;
}

// ─── Smart Add Suggestions ──────────────────────

export interface SmartSuggestion {
  id: string;
  category: GarmentCategory;
  subcategory: string;
  description: string;
  color_primary: string;
  color_hex: string;
  new_combinations: number;
  reason: string;
  tags: string[];
  quality_score: number;
  trend_score: number;
  durability_score: number;
}

export interface SmartSuggestionsResponse {
  suggestions: SmartSuggestion[];
  insight: string | null;
}

// ─── Closet Audit ───────────────────────────────

export interface FlaggedItem {
  garment: GarmentItem;
  verdicts: Array<'never_worn' | 'rarely_worn' | 'hard_to_combine'>;
  outfit_count: number;
  last_worn_label: string;
  restyle_ideas: string[];
  impact_message: string;
}

export interface ClosetAuditSummary {
  total_flagged: number;
  never_worn: number;
  rarely_worn: number;
  hard_to_combine: number;
}

export interface ClosetAuditResponse {
  flagged_items: FlaggedItem[];
  summary: ClosetAuditSummary;
}
