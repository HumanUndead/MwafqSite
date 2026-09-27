import 'server-only';

import { cache } from 'react';
import { upstreamRequest } from '@/shared/lib/upstream';
import {
  isFeatureEnabled,
  type FeatureToggleItem,
  type FeatureToggleKey,
} from './featureToggles.shared';

/** Dashboard B2C feature toggles; null when the list cannot be loaded. */
export const getFeatureToggles = cache(
  async (): Promise<FeatureToggleItem[] | null> => {
    try {
      const value = await upstreamRequest<
        FeatureToggleItem[] | { data?: FeatureToggleItem[] }
      >({
        method: 'GET',
        path: '/api/General/B2CManagement/List',
      });
      if (Array.isArray(value)) return value;
      return Array.isArray(value?.data) ? value.data : null;
    } catch {
      return null;
    }
  }
);

export async function isFeatureOn(key: FeatureToggleKey): Promise<boolean> {
  return isFeatureEnabled(await getFeatureToggles(), key);
}
