'use client';

import { useShallow } from 'zustand/react/shallow';
import { useAuthStore } from '../auth-store';

export function useAuth() {
  return useAuthStore(
    useShallow((s) => ({
      user: s.user,
      isLoading: s.isLoading,
      isAuthenticated: !!s.user,
      logout: s.clearAuth,
      fetchMe: s.fetchMe,
    })),
  );
}
