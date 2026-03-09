/**
 * Recommendation API endpoints
 */
import { BaseApiClient } from './base';
import type { RecommendationResponse, Occasion, ScoringProfile } from '../../types';

export class RecommendationApiClient extends BaseApiClient {
  async getRecommendations(config: {
    occasion?: Occasion;
    scoring_profile?: ScoringProfile;
    top_k?: number;
  }): Promise<RecommendationResponse> {
    return this.request('/api/v1/recommend/outfits', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }
}
