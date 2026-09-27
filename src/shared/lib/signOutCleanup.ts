/**
 * User-scoped client state that must not survive a sign-out (basket,
 * favorites, checkout draft…). Stores register an in-memory reset; their
 * persisted keys are also removed in case the store was never loaded.
 */
const USER_SCOPED_STORAGE_KEYS = [
  'basket-store',
  'favorites-store',
  'checkout-draft-store',
  'family-selection-store',
] as const;

const handlers = new Set<() => void>();

export function registerSignOutHandler(handler: () => void): () => void {
  handlers.add(handler);
  return () => handlers.delete(handler);
}

export function clearUserScopedState() {
  handlers.forEach((handler) => {
    try {
      handler();
    } catch {
      // A failing reset must not block sign-out.
    }
  });
  try {
    USER_SCOPED_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  } catch {
    // Storage may be unavailable (private mode); nothing to clear.
  }
}
