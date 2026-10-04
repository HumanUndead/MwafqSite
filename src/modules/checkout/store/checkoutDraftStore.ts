import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { registerSignOutHandler } from '@/shared/lib/signOutCleanup';
import {
  CHECKOUT_DRAFT_TTL_MS,
  EMPTY_CHECKOUT_STATE,
  fromIsoDate,
  startOfToday,
} from '../checkout.shared';
import type {
  CheckoutAppointment,
  CheckoutCourseSelection,
  CheckoutFacility,
  CheckoutServiceSelection,
  CheckoutState,
  CheckoutStepId,
} from '../types/checkout.types';

interface CheckoutDraftState extends CheckoutState {
  /** Which basket this draft belongs to (`g:<id>` / `s:<ids>`). */
  basketKey: string | null;
  stepId: CheckoutStepId;
  savedAt: string | null;
  /**
   * Resume the draft when it matches the basket and has not expired;
   * otherwise start over from this basket.
   */
  begin: (basketKey: string, service: CheckoutServiceSelection) => void;
  setOwner: (ownerId: string) => void;
  /** Changing the facility resets the appointment and the course. */
  setFacility: (facility: CheckoutFacility | null) => void;
  setAppointment: (appointment: Partial<CheckoutAppointment>) => void;
  setCourse: (course: Partial<CheckoutCourseSelection>) => void;
  markStep: (stepId: CheckoutStepId) => void;
  reset: () => void;
}

const initial = {
  ...EMPTY_CHECKOUT_STATE,
  basketKey: null as string | null,
  stepId: 'family' as CheckoutStepId,
  savedAt: null as string | null,
};

const now = () => new Date().toISOString();

const STEP_ORDER: CheckoutStepId[] = ['family', 'facility', 'time', 'course', 'confirm'];

export const useCheckoutDraftStore = create<CheckoutDraftState>()(
  persist(
    (set, get) => ({
      ...initial,
      begin: (basketKey, service) => {
        const draft = get();
        const age = draft.savedAt
          ? Date.now() - new Date(draft.savedAt).getTime()
          : Infinity;
        const resumable =
          draft.basketKey === basketKey && age <= CHECKOUT_DRAFT_TTL_MS;

        if (!resumable) {
          set({ ...initial, basketKey, service, savedAt: now() });
          return;
        }

        // A chosen date in the past can't be booked: drop it and step back.
        const date = draft.appointment.dateChosen;
        if (date && fromIsoDate(date) < startOfToday()) {
          const pastTime =
            STEP_ORDER.indexOf(draft.stepId) > STEP_ORDER.indexOf('time');
          set({
            service,
            appointment: { selectedSlots: [] },
            stepId: pastTime ? 'time' : draft.stepId,
            savedAt: now(),
          });
          return;
        }
        set({ service, savedAt: now() });
      },
      setOwner: (ownerId) => set({ ownerId, savedAt: now() }),
      setFacility: (facility) =>
        set({
          facility,
          appointment: { selectedSlots: [] },
          course: { selectedCertified: false, selectedSadad: false },
          savedAt: now(),
        }),
      setAppointment: (appointment) =>
        set({
          appointment: { ...get().appointment, ...appointment },
          savedAt: now(),
        }),
      setCourse: (course) =>
        set({ course: { ...get().course, ...course }, savedAt: now() }),
      markStep: (stepId) => set({ stepId, savedAt: now() }),
      reset: () => set(initial),
    }),
    {
      name: 'checkout-draft-store',
      version: 1,
      storage: createJSONStorage(() => window.localStorage),
    }
  )
);

registerSignOutHandler(() => useCheckoutDraftStore.getState().reset());

export function basketKeyOf(basket: {
  services: { id: number }[];
  serviceGroup: { id: number } | null;
}): string | null {
  if (basket.serviceGroup) return `g:${basket.serviceGroup.id}`;
  if (basket.services.length === 0) return null;
  return `s:${basket.services
    .map((item) => item.id)
    .sort((a, b) => a - b)
    .join(',')}`;
}
