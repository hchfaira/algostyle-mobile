/**
 * Recommendations state slice
 */
import type { OutfitResult } from '../../types';

export interface RecommendationsState {
  outfits: OutfitResult[];
  isLoadingOutfits: boolean;

  setOutfits: (outfits: OutfitResult[]) => void;
  setLoadingOutfits: (loading: boolean) => void;
}

export const createRecommendationsSlice = (set: any): RecommendationsState => ({
  outfits: [],
  isLoadingOutfits: false,

  setOutfits: (outfits) => set({ outfits }),

  setLoadingOutfits: (loading) => set({ isLoadingOutfits: loading }),
});
