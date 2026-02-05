import { create } from 'zustand';
import type { UserProfile } from '../types/batch';
import { DEFAULT_USER_PROFILE } from '../types/batch';

const STORAGE_KEY = 'vico_user_profile';

/**
 * User Profile Store - persisted in localStorage (no auth)
 */
interface UserStore {
  profile: UserProfile;
  isLoaded: boolean;
  
  // Actions
  loadProfile: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setMonthlyTarget: (target: number) => void;
  resetProfile: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  profile: DEFAULT_USER_PROFILE,
  isLoaded: false,

  // Load profile from localStorage
  loadProfile: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as UserProfile;
        set({ profile: parsed, isLoaded: true });
      } else {
        set({ isLoaded: true });
      }
    } catch {
      console.warn('Failed to load user profile from localStorage');
      set({ isLoaded: true });
    }
  },

  // Update profile and save to localStorage
  updateProfile: (updates) => {
    set((state) => {
      const newProfile = { ...state.profile, ...updates };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
      } catch {
        console.warn('Failed to save user profile to localStorage');
      }
      return { profile: newProfile };
    });
  },

  // Set monthly target shorthand
  setMonthlyTarget: (target) => {
    set((state) => {
      const newProfile = { ...state.profile, monthlyTarget: target };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile));
      } catch {
        console.warn('Failed to save user profile to localStorage');
      }
      return { profile: newProfile };
    });
  },

  // Reset to default profile
  resetProfile: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      console.warn('Failed to remove user profile from localStorage');
    }
    set({ profile: DEFAULT_USER_PROFILE });
  },
}));
