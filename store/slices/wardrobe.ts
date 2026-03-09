/**
 * Wardrobe state slice
 */
import type { GarmentItem } from '../../types';

export interface WardrobeState {
  wardrobe: GarmentItem[];

  setWardrobe: (items: GarmentItem[]) => void;
  addGarment: (item: GarmentItem) => void;
  removeGarment: (id: string) => void;
}

export const createWardrobeSlice = (set: any): WardrobeState => ({
  wardrobe: [],

  setWardrobe: (items) => set({ wardrobe: items }),

  addGarment: (item) =>
    set((s: any) => ({ wardrobe: [...s.wardrobe, item] })),

  removeGarment: (id) =>
    set((s: any) => ({ wardrobe: s.wardrobe.filter((g: GarmentItem) => g.id !== id) })),
});
