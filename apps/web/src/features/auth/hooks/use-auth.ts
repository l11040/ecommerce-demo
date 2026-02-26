'use client';

import { useAuthStore } from '../auth-store';

export function useAuth() {
  return useAuthStore((s) => ({
    user: s.user,
    isLoading: s.isLoading,
    isAuthenticated: !!s.user,
    logout: s.clearAuth,
    fetchMe: s.fetchMe,
  }));
}
