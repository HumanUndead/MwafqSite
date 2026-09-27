'use client';

import { useSearchParams } from 'next/navigation';
import { DEV_MODE_PARAM, isDeveloperMode } from '@/shared/lib/devMode';

/** Whether the current URL carries `?mode=developer`. */
export function useDeveloperMode(): boolean {
  const searchParams = useSearchParams();
  return isDeveloperMode(searchParams.get(DEV_MODE_PARAM));
}
