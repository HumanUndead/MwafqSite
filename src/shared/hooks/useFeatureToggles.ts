'use client';

import { useQuery } from '@tanstack/react-query';
import { http } from '@/shared/lib/http';
import {
  isFeatureEnabled,
  type FeatureToggleItem,
  type FeatureToggleKey,
} from '@/shared/lib/featureToggles.shared';

const FEATURE_TOGGLES_KEY = ['feature-toggles'] as const;

/** Dashboard toggles. Reads as enabled until loaded or on failure. */
export function useFeatureToggle(key: FeatureToggleKey): boolean {
  const { data } = useQuery({
    queryKey: FEATURE_TOGGLES_KEY,
    queryFn: async () =>
      (await http.get<FeatureToggleItem[] | null>('/api/general/feature-toggles'))
        .data,
    staleTime: 5 * 60 * 1000,
  });
  return isFeatureEnabled(data, key);
}
