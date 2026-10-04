import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { registerSignOutHandler } from '@/shared/lib/signOutCleanup';

/**
 * The family member bookings are made for (null = the signed-in user).
 * Defaults the checkout buyer and scopes the reservations list, like mobile.
 */
interface FamilySelectionState {
  selectedMemberId: string | null;
  setSelectedMemberId: (id: string | null) => void;
}

export const useFamilySelectionStore = create<FamilySelectionState>()(
  persist(
    (set) => ({
      selectedMemberId: null,
      setSelectedMemberId: (id) => set({ selectedMemberId: id }),
    }),
    {
      name: 'family-selection-store',
      storage: createJSONStorage(() => window.localStorage),
    }
  )
);

registerSignOutHandler(() =>
  useFamilySelectionStore.getState().setSelectedMemberId(null)
);
