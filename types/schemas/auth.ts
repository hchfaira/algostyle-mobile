/**
 * Auth-related TypeScript types
 */

export type UserRole = 'user' | 'stylist' | 'business';

export interface AuthResponse {
  user_id: string;
  token: string;
  name: string;
  email: string;
  role: UserRole;
  is_onboarded: boolean;
}
