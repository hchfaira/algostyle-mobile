/**
 * Image Consulting state slice
 */
import type { ImageConsultingResult } from '../../types/schemas/imageConsulting';

export interface ImageConsultingState {
  consultingResult: ImageConsultingResult | null;
  isLoadingConsulting: boolean;
  consultingError: string | null;

  setConsultingResult: (result: ImageConsultingResult | null) => void;
  setLoadingConsulting: (loading: boolean) => void;
  setConsultingError: (error: string | null) => void;
}

export const createImageConsultingSlice = (set: any): ImageConsultingState => ({
  consultingResult: null,
  isLoadingConsulting: false,
  consultingError: null,

  setConsultingResult: (result) => set({ consultingResult: result }),
  setLoadingConsulting: (loading) => set({ isLoadingConsulting: loading }),
  setConsultingError: (error) => set({ consultingError: error }),
});
