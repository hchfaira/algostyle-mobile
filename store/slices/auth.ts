/**
 * Auth state slice
 */
import type { AuthResponse } from '../../types';
import * as SecureStore from 'expo-secure-store';

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_ID_KEY = 'auth_user_id';
const AUTH_USER_NAME_KEY = 'auth_user_name';

export interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  token: string | null;
  userName: string;
  isRestoring: boolean;

  setAuth: (auth: AuthResponse) => void;
  logout: () => void;
  restoreAuth: () => Promise<void>;
}

export const createAuthSlice = (set: any): AuthState => ({
  isAuthenticated: false,
  userId: null,
  token: null,
  userName: '',
  isRestoring: true,

  setAuth: (auth) => {
    // Save to secure storage
    SecureStore.setItemAsync(AUTH_TOKEN_KEY, auth.token).catch(err =>
      console.error('Failed to save token:', err)
    );
    SecureStore.setItemAsync(AUTH_USER_ID_KEY, auth.user_id).catch(err =>
      console.error('Failed to save user_id:', err)
    );
    SecureStore.setItemAsync(AUTH_USER_NAME_KEY, auth.name).catch(err =>
      console.error('Failed to save user name:', err)
    );

    set({
      isAuthenticated: true,
      userId: auth.user_id,
      token: auth.token,
      userName: auth.name,
      isRestoring: false,
    });
  },

  logout: () => {
    // Clear secure storage
    SecureStore.deleteItemAsync(AUTH_TOKEN_KEY).catch(err =>
      console.error('Failed to clear token:', err)
    );
    SecureStore.deleteItemAsync(AUTH_USER_ID_KEY).catch(err =>
      console.error('Failed to clear user_id:', err)
    );
    SecureStore.deleteItemAsync(AUTH_USER_NAME_KEY).catch(err =>
      console.error('Failed to clear user name:', err)
    );

    set({
      isAuthenticated: false,
      userId: null,
      token: null,
      userName: '',
      isRestoring: false,
    });
  },

  restoreAuth: async () => {
    try {
      const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      const userId = await SecureStore.getItemAsync(AUTH_USER_ID_KEY);
      const userName = await SecureStore.getItemAsync(AUTH_USER_NAME_KEY);

      if (token && userId) {
        set({
          isAuthenticated: true,
          token,
          userId,
          userName: userName || '',
          isRestoring: false,
        });
      } else {
        set({ isRestoring: false });
      }
    } catch (error) {
      console.error('Failed to restore auth:', error);
      set({ isRestoring: false });
    }
  },
});
