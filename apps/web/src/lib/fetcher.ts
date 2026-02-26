import { useAuthStore } from '@/features/auth/auth-store';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:40003';

let refreshPromise: Promise<boolean> | null = null;

async function attemptRefresh(): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/fo/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      useAuthStore.getState().clearAuth();
      return false;
    }

    return true;
  } catch {
    useAuthStore.getState().clearAuth();
    return false;
  }
}

export interface ApiError extends Error {
  status: number;
  body: unknown;
}

export const fetcher = async <T>(input: RequestInfo, init?: RequestInit): Promise<T> => {
  const url = typeof input === 'string' ? `${BASE_URL}${input}` : input;

  let response = await fetch(url, { ...init, credentials: 'include' });

  if (response.status === 401) {
    if (!refreshPromise) {
      refreshPromise = attemptRefresh().finally(() => {
        refreshPromise = null;
      });
    }

    const refreshed = await refreshPromise;

    if (refreshed) {
      response = await fetch(url, { ...init, credentials: 'include' });
    }
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const error = new Error(
      errorBody?.message ?? `API error: ${response.status}`,
    ) as ApiError;
    error.status = response.status;
    error.body = errorBody;
    throw error;
  }

  return response.json() as Promise<T>;
};

export default fetcher;
