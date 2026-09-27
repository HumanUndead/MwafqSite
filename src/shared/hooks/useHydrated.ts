'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/**
 * false during SSR and the hydration pass, true afterwards. Gate UI that
 * reads persisted (localStorage) stores to avoid hydration mismatches.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
