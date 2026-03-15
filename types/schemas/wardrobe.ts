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

// ─── Capsule Score ──────────────────────────────

export interface CapsuleScoreBreakdown {
  versatility: number;
  colour_cohesion: number;
  occasion_coverage: number;
  season_balance: number;
}

export interface CapsuleOpportunity {
  type: string;
  label: string;
  impact: string;
}

export interface CapsuleScoreResponse {
  score: number;
  grade: string;
  grade_label: string;
  breakdown: CapsuleScoreBreakdown;
  total_items: number;
  tip: string;
  top_opportunities: CapsuleOpportunity[];
}

// ─── Garment Analysis ───────────────────────────

export interface GarmentAnalysis {
  garment_id: string;
  name: string;
  versatility_score: number;
  compatibility_score: number;
  outfit_count: number;
  impact_score: number;
  seasons: string[];
  season_count: number;
  is_neutral: boolean;
  formality: string;
  times_worn: number;
  tags: string[];
  verdict: string;
  verdict_color: string;
}

// ─── Missing Pieces ─────────────────────────────

export interface MissingPiece {
  category: string;
  subcategory: string;
  reason: string;
  roi: number;
  price_estimate: string;
  color_hex: string;
  outfits_unlocked: number;
}

export interface MissingPiecesResponse {
  missing_pieces: MissingPiece[];
  total_recommendations: number;
  insight: string;
}

// ─── Capsule Evolution ──────────────────────────

export interface EvolutionSnapshot {
  days_ago: number;
  score: number;
  items_count: number;
}

export interface CapsuleEvolutionResponse {
  snapshots: EvolutionSnapshot[];
  trend: 'improving' | 'stable' | 'declining' | 'flat';
  improvement: number;
  current_score: number;
  period_days: number;
}

// ─── Smart Removal ──────────────────────────────

export interface RemovalCandidate {
  garment: GarmentItem;
  risk_score: number;
  reasons: string[];
  outfit_count: number;
  removal_impact: 'safe' | 'low' | 'medium' | 'high';
  restyle_ideas: string[];
}

export interface SmartRemovalResponse {
  candidates: RemovalCandidate[];
  total_candidates: number;
  profile: string;
  current_count: number;
  target_count: number;
  summary: string;
}

// ─── Sort Scores ────────────────────────────────

export type SortMode = 'default' | 'versatility' | 'redundancy' | 'seasonal' | 'impact';

export interface GarmentSortScore {
  garment_id: string;
  versatility_score: number;   // 0-100, higher = more outfits
  redundancy_score: number;    // 0-100, higher = more duplicates in wardrobe
  seasonal_score: number;      // 0-100, higher = more season-relevant right now
  impact_score: number;        // 0-100, higher = more outfits lost if removed
  redundancy_label?: string;   // e.g. "Similar to 2 other tops"
  seasonal_label?: string;     // e.g. "Autumn-ready" | "Adaptable" | "Store away"
}

export interface WardrobeSortScoresResponse {
  scores: GarmentSortScore[];
  current_season: string;
}

// ─── Capsule Generate (by context) ─────────────

export type CapsuleOccasion = 'work' | 'weekend' | 'evening' | 'travel';
export type CapsuleSeason   = 'spring' | 'summer' | 'autumn' | 'winter';

export interface CapsuleGenerateRequest {
  occasion?: CapsuleOccasion;
  season?: CapsuleSeason;
}

export interface CapsuleGenerateResponse {
  context_label: string;       // e.g. "Summer Weekend"
  items: GarmentItem[];        // selected capsule items from wardrobe
  score: CapsuleScoreResponse; // cohesion score for this capsule
  missing: MissingPiece[];     // top gaps to complete the capsule
  combination_count: number;   // total outfits possible
  insight: string;             // 1-sentence AI summary
}
