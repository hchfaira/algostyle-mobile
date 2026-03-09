/**
 * Profile API endpoints
 */
import { BaseApiClient } from './base';
import type { UserProfile } from '../../types';

export class ProfileApiClient extends BaseApiClient {
  async getProfile(userId: string): Promise<UserProfile> {
    return this.request(`/api/v1/onboarding/profile/${userId}`);
  }

  async updateProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
    return this.request(`/api/v1/onboarding/profile/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async completeOnboarding(userId: string): Promise<{ status: string }> {
    return this.request(`/api/v1/onboarding/complete/${userId}`, {
      method: 'POST',
    });
  }
}
