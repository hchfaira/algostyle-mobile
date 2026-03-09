/**
 * Recommendation and outfit scoring types
 */

import type { GarmentItem } from './wardrobe';

export type Occasion = 'casual' | 'business' | 'formal' | 'date' | 'party' | 'wedding' | 'interview' | 'sport' | 'travel' | 'beach';
export type ScoringProfile = 'default' | 'minimalist' | 'creative' | 'business' | 'casual';

export interface OutfitScore {
  overall: number;
  color_harmony: number;
  formality_match: number;
  occasion_fit: number;
  pattern_mixing: number;
  proportion: number;
  season_fit: number;
  creativity: number;
}

export interface OutfitResult {
  id: string;
  rank: number;
  name: string;
  garments: GarmentItem[];
  score: OutfitScore;
  explanation_brief?: string;
  explanation_detailed?: string;
  catalogue_image_url?: string;
}

export interface RecommendationResponse {
  outfits: OutfitResult[];
  total_combinations: number;
  processing_time_ms: number;
}
