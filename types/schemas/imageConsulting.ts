/**
 * Image Consulting — TypeScript type definitions
 * Mirrors the Python ImageConsultingResult Pydantic model.
 */

export interface ColorPaletteRecommendation {
  best_colors: string[];
  good_colors: string[];
  colors_to_avoid: string[];
  neutral_colors: string[];
  accent_colors: string[];
  tips: string[];
}

export interface BodyShapeGuidance {
  body_shape: string;
  flattering_silhouettes: string[];
  good_patterns: string[];
  items_to_avoid: string[];
  styling_tips: string[];
  proportion_tips: string[];
}

export interface FaceShapeGuidance {
  face_shape: string;
  flattering_necklines: string[];
  flattering_collars: string[];
  earring_styles: string[];
  glasses_styles: string[];
  tips: string[];
}

export interface ImageConsultingResult {
  user_id: string;
  analyzed_at: string; // ISO date string

  // Core profile
  body_shape: string | null;
  face_shape: string | null;
  skin_tone: string | null;
  undertone: string | null;
  hair_color: string | null;
  contrast_level: string | null;
  visual_weight: string | null;
  color_season: string | null;

  // Sizes
  estimated_top_size: string | null;
  estimated_bottom_size: string | null;

  // Rich recommendations
  color_palette: ColorPaletteRecommendation | null;
  body_shape_guidance: BodyShapeGuidance | null;
  face_shape_guidance: FaceShapeGuidance | null;

  // AI / rule-based summary
  summary: string | null;

  overall_confidence: number;
}
