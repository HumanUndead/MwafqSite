'use client';

import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { familyApi, familyQueryKeys } from '../api/familyApi';

/** Debounced (500 ms) user lookup for "link an existing account". */
export function useFamilyLookup(username: string) {
  const debounced = useDebounce(username.trim(), 500);
  const query = useQuery({
    queryKey: familyQueryKeys.lookup(debounced),
    queryFn: async () => (await familyApi.lookup(debounced)).data,
    enabled: debounced.length > 0,
    staleTime: 60 * 1000,
  });
  return {
    ...query,
    searched: debounced.length > 0,
    isSettling: username.trim() !== debounced,
  };
}
