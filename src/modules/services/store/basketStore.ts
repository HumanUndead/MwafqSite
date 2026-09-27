import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { registerSignOutHandler } from '@/shared/lib/signOutCleanup';

export interface BasketItem {
  id: number;
  /** Display name snapshot, in the locale it was added in. */
  name: string;
}

export interface BasketGroup extends BasketItem {
  serviceCount: number;
}

/**
 * An order holds EITHER one service group OR N individual services — never
 * both. Callers confirm with the user before replacing one with the other.
 */
interface BasketState {
  services: BasketItem[];
  serviceGroup: BasketGroup | null;
  toggleService: (item: BasketItem) => void;
  removeService: (id: number) => void;
  /** Replaces any services in the basket. Same id again deselects. */
  toggleServiceGroup: (group: BasketGroup) => void;
  setServiceGroup: (group: BasketGroup) => void;
  clearServiceGroup: () => void;
  clearServices: () => void;
  clear: () => void;
}

const initial = { services: [] as BasketItem[], serviceGroup: null };

export const useBasketStore = create<BasketState>()(
  persist(
    (set, get) => ({
      ...initial,
      toggleService: (item) => {
        const exists = get().services.some((entry) => entry.id === item.id);
        set({
          serviceGroup: null,
          services: exists
            ? get().services.filter((entry) => entry.id !== item.id)
            : [...get().services, item],
        });
      },
      removeService: (id) =>
        set({ services: get().services.filter((entry) => entry.id !== id) }),
      toggleServiceGroup: (group) =>
        set({
          services: [],
          serviceGroup: get().serviceGroup?.id === group.id ? null : group,
        }),
      setServiceGroup: (group) => set({ services: [], serviceGroup: group }),
      clearServiceGroup: () => set({ serviceGroup: null }),
      clearServices: () => set({ services: [] }),
      clear: () => set(initial),
    }),
    {
      name: 'basket-store',
      version: 1,
      storage: createJSONStorage(() => localStorage),
    }
  )
);

registerSignOutHandler(() => useBasketStore.getState().clear());

export function isBasketEmpty(state: {
  services: BasketItem[];
  serviceGroup: BasketGroup | null;
}): boolean {
  return state.services.length === 0 && !state.serviceGroup;
}
