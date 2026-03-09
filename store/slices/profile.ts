/**
 * Profile state slice
 */
import type { UserProfile } from '../../types';

export interface ProfileState {
  profile: UserProfile | null;
  isOnboarded: boolean;

  setProfile: (profile: UserProfile) => void;
}

export const createProfileSlice = (set: any): ProfileState => ({
  profile: null,
  isOnboarded: false,

  setProfile: (profile) =>
    set({ profile, isOnboarded: profile.is_onboarded }),
});
