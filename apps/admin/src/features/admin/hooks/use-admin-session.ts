'use client';

import { useEffect, useState } from 'react';
import { me, refresh } from '@/api/bo';
import { isApiSuccess } from '@/lib/api-response';

type SessionState = {
  loading: boolean;
  authenticated: boolean;
  username: string;
};

export function useAdminSession(): SessionState {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void (async () => {
        const meResponse = await me();
        const meUsername = (meResponse.data as { data?: { username?: string } })
          ?.data?.username;

        if (isApiSuccess(meResponse) && meUsername) {
          setUsername(meUsername);
          setAuthenticated(true);
          setLoading(false);
          return;
        }

        if (meResponse.status === 401) {
          const refreshResponse = await refresh();
          if (isApiSuccess(refreshResponse)) {
            const retryMeResponse = await me();
            const retryUsername = (
              retryMeResponse.data as { data?: { username?: string } }
            )?.data?.username;

            if (isApiSuccess(retryMeResponse) && retryUsername) {
              setUsername(retryUsername);
              setAuthenticated(true);
              setLoading(false);
              return;
            }
          }
        }

        setAuthenticated(false);
        setUsername('');
        setLoading(false);
      })();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  return {
    loading,
    authenticated,
    username,
  };
}
