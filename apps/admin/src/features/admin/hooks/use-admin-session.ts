'use client';

import { useEffect, useState } from 'react';
import { me, refresh } from '@/api/bo';

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

        if (meResponse.status === 200 && meResponse.data.success) {
          setUsername(meResponse.data.data.username);
          setAuthenticated(true);
          setLoading(false);
          return;
        }

        if (meResponse.status === 401) {
          const refreshResponse = await refresh();
          if (refreshResponse.status === 200 && refreshResponse.data.success) {
            const retryMeResponse = await me();
            if (retryMeResponse.status === 200 && retryMeResponse.data.success) {
              setUsername(retryMeResponse.data.data.username);
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
