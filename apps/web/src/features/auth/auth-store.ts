'use client';

import { create } from 'zustand';
import { me } from '@/api/fo';
import type { Me200 } from '@/api/fo';
import type { AuthUser } from './types';

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  setUser: (user: AuthUser) => void;
  clearAuth: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  setUser: (user) => set({ user }),

  clearAuth: () => set({ user: null }),

  fetchMe: async () => {
    try {
      set({ isLoading: true });
      const result = (await me()) as unknown as Me200;
      if (result.success) {
        set({ user: result.data });
      } else {
        set({ user: null });
      }
    } catch {
      set({ user: null });
    } finally {
      set({ isLoading: false });
    }
  },
}));

if (typeof window !== 'undefined') {
  useAuthStore.getState().fetchMe();
}
