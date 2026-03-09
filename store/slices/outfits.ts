/**
 * Custom outfits state slice
 */
import type { CustomOutfit, VirtualTryOnResult } from '../../types';

export interface OutfitsState {
  customOutfits: CustomOutfit[];
  isLoadingOutfits: boolean;
  virtualTryOns: Record<string, VirtualTryOnResult>; // map of outfitId -> tryOnResult

  setCustomOutfits: (outfits: CustomOutfit[]) => void;
  addCustomOutfit: (outfit: CustomOutfit) => void;
  removeCustomOutfit: (outfitId: string) => void;
  updateCustomOutfit: (outfitId: string, updates: Partial<CustomOutfit>) => void;
  setLoadingOutfits: (loading: boolean) => void;
  
  // Virtual try-on methods
  addVirtualTryOn: (outfitId: string, tryOnResult: VirtualTryOnResult) => void;
  getVirtualTryOn: (outfitId: string) => VirtualTryOnResult | undefined;
  hasVirtualTryOn: (outfitId: string) => boolean;
}

export const createOutfitsSlice = (set: any, get: any): OutfitsState => ({
  customOutfits: [],
  isLoadingOutfits: false,
  virtualTryOns: {},

  setCustomOutfits: (outfits) => set({ customOutfits: outfits }),

  addCustomOutfit: (outfit) =>
    set((state: OutfitsState) => ({
      customOutfits: [...state.customOutfits, outfit],
    })),

  removeCustomOutfit: (outfitId) =>
    set((state: OutfitsState) => ({
      customOutfits: state.customOutfits.filter((o) => o.id !== outfitId),
    })),

  updateCustomOutfit: (outfitId, updates) =>
    set((state: OutfitsState) => ({
      customOutfits: state.customOutfits.map((o) =>
        o.id === outfitId ? { ...o, ...updates } : o
      ),
    })),

  setLoadingOutfits: (loading) => set({ isLoadingOutfits: loading }),

  addVirtualTryOn: (outfitId, tryOnResult) =>
    set((state: OutfitsState) => ({
      virtualTryOns: {
        ...state.virtualTryOns,
        [outfitId]: tryOnResult,
      },
      // Also update the outfit to mark it as having a try-on
      customOutfits: state.customOutfits.map((o) =>
        o.id === outfitId
          ? {
              ...o,
              virtualTryOns: [...(o.virtualTryOns || []), tryOnResult],
              hasVirtualTryOn: true,
              lastTryOnImageUrl: tryOnResult.imageUrl,
            }
          : o
      ),
    })),

  getVirtualTryOn: (outfitId) => {
    const state = get();
    return state.virtualTryOns[outfitId];
  },

  hasVirtualTryOn: (outfitId) => {
    const state = get();
    return !!state.virtualTryOns[outfitId];
  },
});
