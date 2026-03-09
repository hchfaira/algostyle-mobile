/**
 * Auth state slice
 */
import type { AuthResponse } from '../../types';

export interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  token: string | null;
  userName: string;

  setAuth: (auth: AuthResponse) => void;
  logout: () => void;
}

export const createAuthSlice = (set: any): AuthState => ({
  isAuthenticated: false,
  userId: null,
  token: null,
  userName: '',

  setAuth: (auth) =>
    set({
      isAuthenticated: true,
      userId: auth.user_id,
      token: auth.token,
      userName: auth.name,
    }),

  logout: () =>
    set({
      isAuthenticated: false,
      userId: null,
      token: null,
      userName: '',
    }),
});
