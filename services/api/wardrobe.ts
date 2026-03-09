/**
 * Wardrobe API endpoints
 */
import { BaseApiClient } from './base';
import type { GarmentItem, SmartSuggestionsResponse, ClosetAuditResponse } from '../../types';

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
}
