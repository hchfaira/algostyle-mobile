/**
 * Auth state slice
 */
import type { AuthResponse } from '../../types';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const AUTH_TOKEN_KEY = 'auth_token';
const AUTH_USER_ID_KEY = 'auth_user_id';
const AUTH_USER_NAME_KEY = 'auth_user_name';

// expo-secure-store is not supported on web — fall back to localStorage
const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      try { return localStorage.getItem(key); } catch { return null; }
    }
    return SecureStore.getItemAsync(key);
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      try { localStorage.setItem(key, value); } catch {}
      return;
    }
    return SecureStore.setItemAsync(key, value);
  },
  async deleteItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      try { localStorage.removeItem(key); } catch {}
      return;
    }
    return SecureStore.deleteItemAsync(key);
  },
};

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
    storage.setItem(AUTH_TOKEN_KEY, auth.token).catch(err =>
      console.error('Failed to save token:', err)
    );
    storage.setItem(AUTH_USER_ID_KEY, auth.user_id).catch(err =>
      console.error('Failed to save user_id:', err)
    );
    storage.setItem(AUTH_USER_NAME_KEY, auth.name).catch(err =>
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
    storage.deleteItem(AUTH_TOKEN_KEY).catch(err =>
      console.error('Failed to clear token:', err)
    );
    storage.deleteItem(AUTH_USER_ID_KEY).catch(err =>
      console.error('Failed to clear user_id:', err)
    );
    storage.deleteItem(AUTH_USER_NAME_KEY).catch(err =>
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
      const token = await storage.getItem(AUTH_TOKEN_KEY);
      const userId = await storage.getItem(AUTH_USER_ID_KEY);
      const userName = await storage.getItem(AUTH_USER_NAME_KEY);

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
