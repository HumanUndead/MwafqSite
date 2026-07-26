import { create } from 'zustand';

/**
 * Lets an immersive, full-viewport section (e.g. the B2B "Our Product"
 * pinned scroll-chapters) hide the fixed marketing header while it is on
 * screen, so the navbar does not overlap or clip the pinned content.
 *
 * Ref-counted so nested/sibling sections can each request hiding without
 * one un-hiding while another still needs it.
 */
interface HeaderVisibilityState {
  hiddenCount: number;
  hidden: boolean;
  requestHide: () => void;
  releaseHide: () => void;
}

export const useHeaderVisibilityStore = create<HeaderVisibilityState>((set) => ({
  hiddenCount: 0,
  hidden: false,
  requestHide: () =>
    set((s) => {
      const hiddenCount = s.hiddenCount + 1;
      return { hiddenCount, hidden: hiddenCount > 0 };
    }),
  releaseHide: () =>
    set((s) => {
      const hiddenCount = Math.max(0, s.hiddenCount - 1);
      return { hiddenCount, hidden: hiddenCount > 0 };
    }),
}));
