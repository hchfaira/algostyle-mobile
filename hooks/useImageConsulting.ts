/**
 * useImageConsulting — Async state for image consulting analysis
 */
import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';

import { api } from '../services/api';
import { useAppStore } from '../store/useAppStore';
import type { ImageConsultingResult } from '../types';

// ─── Dev mock ──────────────────────────────────────────────────
// Set to false once the real backend /image-consulting endpoint is live.
const USE_MOCK = false;

const MOCK_RESULT: ImageConsultingResult = {
  user_id: 'mock-user',
  analyzed_at: new Date().toISOString(),

  body_shape: 'hourglass',
  face_shape: 'oval',
  skin_tone: 'light_medium',
  undertone: 'warm',
  hair_color: 'dark_brown',
  contrast_level: 'medium_high',
  visual_weight: 'balanced',
  color_season: 'Warm Autumn',

  estimated_top_size: 'S / 36',
  estimated_bottom_size: 'S / 38',

  color_palette: {
    best_colors: ['terracotta', 'burnt_orange', 'camel', 'olive', 'rust', 'gold', 'warm_brown', 'cream', 'teal', 'forest_green'],
    good_colors: ['burgundy', 'mustard', 'copper', 'chocolate', 'sage'],
    colors_to_avoid: ['icy_blue', 'silver', 'fuchsia', 'black', 'cool_grey'],
    neutral_colors: ['camel', 'warm_beige', 'cream', 'off_white'],
    accent_colors: ['rust', 'gold', 'teal'],
    tips: [
      'Wear warm, earthy tones close to your face to enhance your natural glow.',
      'Use rich jewel tones like teal or deep olive as statement pieces.',
      'Avoid cool, icy colours — they can wash out your warm complexion.',
    ],
  },

  body_shape_guidance: {
    body_shape: 'hourglass',
    flattering_silhouettes: ['fitted_waist', 'wrap_dresses', 'belted_coats', 'pencil_skirts'],
    good_patterns: ['small_florals', 'vertical_stripes', 'tonal_prints', 'abstract'],
    items_to_avoid: ['boxy_tops', 'oversized_blazers', 'drop_waist_dresses', 'shapeless_tunics'],
    styling_tips: [
      'Define your waist with belts, wrap tops, or fitted blazers.',
      'Choose bottoms that skim your hips without adding bulk.',
      'Fitted tailoring works beautifully on your proportions.',
    ],
    proportion_tips: [
      'Keep top and bottom proportions balanced — avoid extreme volume on both.',
      'Midi skirts and dresses elongate your silhouette elegantly.',
    ],
  },

  face_shape_guidance: {
    face_shape: 'oval',
    flattering_necklines: ['v_neck', 'scoop_neck', 'square_neck', 'off_shoulder'],
    flattering_collars: ['shirt_collar', 'revere_collar', 'notched_lapel'],
    earring_styles: ['hoops', 'drop_earrings', 'studs', 'chandelier'],
    glasses_styles: ['square', 'rectangular', 'geometric', 'cat_eye'],
    tips: [
      'Oval faces suit almost any neckline — use it to your advantage.',
      'Angular earrings add definition and structure.',
    ],
  },

  summary:
    'You are a Warm Autumn — rich, earthy tones and defined silhouettes work beautifully with your warm undertones and balanced hourglass shape. Embrace terracotta, olive, and camel as your signature palette while keeping your waist as your style anchor.',

  overall_confidence: 0.87,
};
// ──────────────────────────────────────────────────────────────

export function useImageConsulting() {
  const {
    userId, profile,
    consultingResult, isLoadingConsulting, consultingError,
    setConsultingResult, setLoadingConsulting, setConsultingError,
  } = useAppStore();

  const [showModal, setShowModal] = useState(false);

  // Load cached result on mount
  useEffect(() => {
    if (USE_MOCK || !userId || consultingResult) return;
    (async () => {
      try {
        setLoadingConsulting(true);
        const result = await api.getImageConsultingResult(userId);
        setConsultingResult(result);
      } catch {
        // 404 = no result yet — fine, show empty state
      } finally {
        setLoadingConsulting(false);
      }
    })();
  }, [userId]);

  const handleAnalyze = useCallback(
    async (imageUri: string, heightCm: number | undefined, weightKg: number | undefined) => {
      if (!userId && !USE_MOCK) {
        Alert.alert('Not logged in', 'Please log in to run the analysis.');
        return;
      }
      setShowModal(false);
      setLoadingConsulting(true);
      setConsultingError(null);

      if (USE_MOCK) {
        // Simulate a realistic loading delay
        await new Promise(r => setTimeout(r, 1800));
        setConsultingResult(MOCK_RESULT);
        setLoadingConsulting(false);
        return;
      }

      try {
        const result = await api.analyzeImageConsulting(userId!, imageUri, heightCm, weightKg);
        setConsultingResult(result);
      } catch (err: any) {
        const msg = err?.message ?? 'Analysis failed. Please try again.';
        setConsultingError(msg);
        Alert.alert(
          'Analysis failed',
          msg.includes('fetch') || msg.includes('Network')
            ? 'Cannot reach the server. Make sure the backend is running on ' +
              require('../constants/config').API_BASE_URL
            : msg,
        );
      } finally {
        setLoadingConsulting(false);
      }
    },
    [userId],
  );

  // In mock mode: skip the photo modal, run analysis directly.
  const openModal = () => {
    if (USE_MOCK) {
      handleAnalyze('mock://photo', undefined, undefined);
      return;
    }
    if (!userId) {
      Alert.alert('Not signed in', 'Please sign in or continue as guest to use Image Consulting.');
      return;
    }
    setShowModal(true);
  };

  return {
    userId,
    profile,
    consultingResult,
    isLoadingConsulting,
    consultingError,
    showModal,
    setShowModal,
    openModal,
    handleAnalyze,
  };
}
