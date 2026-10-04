import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { registerSignOutHandler } from '@/shared/lib/signOutCleanup';
import { FAVORITES_LIMIT } from '../catalog.shared';
import type { CatalogKind } from '../types/catalog.types';

type Favorites = Record<CatalogKind, number[]>;

interface FavoritesState extends Favorites {
  /** Returns false when adding would exceed the limit. */
  toggleFavorite: (kind: CatalogKind, id: number) => boolean;
  clear: () => void;
}

const initial: Favorites = { services: [], groups: [] };

/** Local-only favorites (there is no favorites API), capped per kind. */
export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ...initial,
      toggleFavorite: (kind, id) => {
        const list = get()[kind];
        if (list.includes(id)) {
          set({ [kind]: list.filter((entry) => entry !== id) } as Partial<Favorites>);
          return true;
        }
        if (list.length >= FAVORITES_LIMIT) return false;
        set({ [kind]: [...list, id] } as Partial<Favorites>);
        return true;
      },
      clear: () => set(initial),
    }),
    {
      name: 'favorites-store',
      version: 1,
      storage: createJSONStorage(() => window.localStorage),
    }
  )
);

registerSignOutHandler(() => useFavoritesStore.getState().clear());
