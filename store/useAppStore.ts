/**
 * Unified Zustand store — aggregates all state slices
 */
import { create } from 'zustand';
import { createAuthSlice, type AuthState } from './slices/auth';
import { createProfileSlice, type ProfileState } from './slices/profile';
import { createWardrobeSlice, type WardrobeState } from './slices/wardrobe';
import { createRecommendationsSlice, type RecommendationsState } from './slices/recommendations';
import { createOutfitsSlice, type OutfitsState } from './slices/outfits';
import { createChatSlice, type ChatState } from './slices/chat';
import { createImageConsultingSlice, type ImageConsultingState } from './slices/imageConsulting';

export type AppState = AuthState &
  ProfileState &
  WardrobeState &
  RecommendationsState &
  OutfitsState &
  ChatState &
  ImageConsultingState & {
    logout: () => void;
  };

export const useAppStore = create<AppState>((set, get) => ({
  ...createAuthSlice(set),
  ...createProfileSlice(set),
  ...createWardrobeSlice(set),
  ...createRecommendationsSlice(set),
  ...createOutfitsSlice(set, get),
  ...createChatSlice(set),
  ...createImageConsultingSlice(set),

  // Global logout that resets all slices
  logout: () =>
    set({
      // Auth
      isAuthenticated: false,
      userId: null,
      token: null,
      userName: '',
      // Profile
      profile: null,
      isOnboarded: false,
      // Wardrobe
      wardrobe: [],
      // Recommendations
      outfits: [],
      isLoadingOutfits: false,
      // Custom Outfits
      customOutfits: [],
      // Chat
      chatMessages: [],
      chatSessionId: null,
      // Image Consulting
      consultingResult: null,
      isLoadingConsulting: false,
      consultingError: null,
    }),
}));
