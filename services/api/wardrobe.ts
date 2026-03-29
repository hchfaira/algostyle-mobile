/**
 * Wardrobe API endpoints
 */
import { BaseApiClient } from './base';
import type {
  GarmentItem,
  SmartSuggestionsResponse,
  ClosetAuditResponse,
  CapsuleScoreResponse,
  GarmentAnalysis,
  MissingPiecesResponse,
  CapsuleEvolutionResponse,
  SmartRemovalResponse,
} from '../../types';

export class WardrobeApiClient extends BaseApiClient {
  async getWardrobe(userId: string, filters?: Record<string, string>): Promise<GarmentItem[]> {
    const params = new URLSearchParams({ user_id: userId, ...filters });
    return this.request(`/api/v1/wardrobe/items?${params}`);
  }

  async addGarment(userId: string, category?: string): Promise<GarmentItem> {
    const params = new URLSearchParams({ user_id: userId });
    if (category) params.set('category', category);
    return this.request(`/api/v1/wardrobe/items?${params}`, {
      method: 'POST',
    });
  }

  async deleteGarment(userId: string, garmentId: string): Promise<void> {
    await this.request(`/api/v1/wardrobe/items/${garmentId}?user_id=${userId}`, {
      method: 'DELETE',
    });
  }

  async toggleFavorite(userId: string, garmentId: string): Promise<any> {
    return this.request(`/api/v1/wardrobe/items/${garmentId}/favorite?user_id=${userId}`, {
      method: 'POST',
    });
  }

  async getSmartSuggestions(userId: string): Promise<SmartSuggestionsResponse> {
    return this.request(`/api/v1/wardrobe/smart-suggestions?user_id=${userId}`);
  }

  async getClosetAudit(userId: string): Promise<ClosetAuditResponse> {
    return this.request(`/api/v1/wardrobe/audit?user_id=${userId}`);
  }

  // ─── Capsule Intelligence ─────────────────────────────────

  async getCapsuleScore(userId: string): Promise<CapsuleScoreResponse> {
    return this.request(`/api/v1/wardrobe/capsule-score?user_id=${userId}`);
  }

  async getGarmentAnalysis(userId: string, garmentId: string): Promise<GarmentAnalysis> {
    return this.request(`/api/v1/wardrobe/items/${garmentId}/analysis?user_id=${userId}`);
  }

  async getMissingPieces(userId: string, limit = 5): Promise<MissingPiecesResponse> {
    return this.request(`/api/v1/wardrobe/missing-pieces?user_id=${userId}&limit=${limit}`);
  }

  async getCapsuleEvolution(userId: string, days = 90): Promise<CapsuleEvolutionResponse> {
    return this.request(`/api/v1/wardrobe/capsule-evolution?user_id=${userId}&days=${days}`);
  }

  async getSmartRemoval(userId: string, profile = 'balanced'): Promise<SmartRemovalResponse> {
    return this.request(`/api/v1/wardrobe/smart-removal?user_id=${userId}&profile=${profile}`);
  }

  async listCustomOutfits(userId: string): Promise<{ outfits: any[]; total: number }> {
    return this.request(`/api/v1/outfits/list?user_id=${userId}`);
  }
}
