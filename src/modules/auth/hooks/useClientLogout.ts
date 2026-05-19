'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../store/authStore';

export function useClientLogout() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const router = useRouter();

  async function logout() {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await authApi.logout();
    } finally {
      clearAuth();
      setIsLoggingOut(false);
      router.refresh();
    }
  }

  return { logout, isLoggingOut };
}
