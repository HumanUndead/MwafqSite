'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/modules/auth/api/authApi';
import { useAuthStore } from '@/modules/auth/store/authStore';
import { getAuthTokenFromDocumentCookie } from '@/shared/lib/authCookie';
import {
  authSessionCookieName,
  authTokenCookieName,
} from '@/modules/auth/session.shared';
import { cookies } from '@/shared/lib/cookies';

export function TokenValidator() {
  const setUser = useAuthStore((s) => s.setUser);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const { data: user, isError } = useQuery({
    queryKey: ['auth', 'session'],
    queryFn: async () => {
      const token = getAuthTokenFromDocumentCookie();
      if (!token) return null;
      const res = await authApi.getUserByToken();
      return res.data;
    },
    staleTime: Infinity,
    retry: false,
  });

  useEffect(() => {
    if (user) {
      setUser(user);
    }
  }, [user, setUser]);

  useEffect(() => {
    if (!isError) return;

    cookies.remove(authTokenCookieName);
    cookies.remove(authSessionCookieName);
    clearAuth();
  }, [isError, clearAuth]);

  return null;
}
