/**
 * Custom outfit builder types
 */

import type { GarmentItem } from './wardrobe';

export interface VirtualTryOnResult {
  id: string;
  outfitId: string;
  imageUrl: string;
  userPhotoUrl: string;
  createdAt: string;
  modelType: 'diffusion' | 'ar'; // diffusion or AR-based
}

export interface CustomOutfit {
  id: string;
  name: string;
  description?: string;
  garments: GarmentItem[];
  createdAt: string;
  updatedAt: string;
  isPublic?: boolean;
  // NEW: Context for outfit detail cards
  occasion?: string;
  date?: string; // e.g., "Mar 15, 2026"
  location?: string;
  styleMood?: string;
  // NEW: Virtual try-on tracking
  virtualTryOns: VirtualTryOnResult[];
  hasVirtualTryOn?: boolean;
  lastTryOnImageUrl?: string;
  // NEW: Social/Sharing metadata
  sharedToPeople?: boolean;
  shareDetails?: {
    sharedAt: string;
    sharedBy: string; // userId
    sharedWith?: string[]; // user IDs who can see it
  };
}

export interface CreateCustomOutfitRequest {
  name: string;
  description?: string;
  garmentIds: string[];
  isPublic?: boolean;
  occasion?: string;
  date?: string;
  location?: string;
  styleMood?: string;
}

export interface CustomOutfitResponse {
  success: boolean;
  outfit: CustomOutfit;
  message?: string;
}

export interface VirtualTryOnRequest {
  outfitId: string;
  userPhotoUrl?: string; // URL to user's photo for try-on
  modelType?: 'diffusion' | 'ar'; // defaults to 'diffusion'
}

export interface VirtualTryOnResponse {
  success: boolean;
  tryOn: VirtualTryOnResult;
  message?: string;
}
