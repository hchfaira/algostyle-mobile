/**
 * Authentication API endpoints
 */
import { BaseApiClient } from './base';
import type { AuthResponse } from '../../types';

export class AuthApiClient extends BaseApiClient {
  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    return this.request('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async guestLogin(): Promise<AuthResponse> {
    return this.request('/api/v1/auth/guest', { method: 'POST' });
  }
}
