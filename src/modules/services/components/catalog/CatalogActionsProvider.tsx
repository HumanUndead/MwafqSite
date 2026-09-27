'use client';

import { useRouter } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { getLocalizedRoute } from '@/i18n/routing';
import { useAuthStore } from '@/modules/auth/store/authStore';
import { toast } from '@/shared/components/feedback/Toast';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { ROUTES } from '@/shared/constants/routes';
import { getAuthTokenFromDocumentCookie } from '@/shared/lib/authCookie';
import { interpolate } from '@/shared/lib/interpolate';
import { FAVORITES_LIMIT } from '../../catalog.shared';
import {
  useBasketStore,
  type BasketGroup,
  type BasketItem,
} from '../../store/basketStore';
import { useFavoritesStore } from '../../store/favoritesStore';
import type { CatalogKind } from '../../types/catalog.types';

interface CatalogActions {
  toggleService: (item: BasketItem) => void;
  toggleGroup: (group: BasketGroup) => void;
  /** Select a group (never toggles off) and go to checkout. */
  bookGroup: (group: BasketGroup) => void;
  toggleFavorite: (kind: CatalogKind, id: number) => void;
  continueToCheckout: () => void;
}

type PendingConfirm =
  | { kind: 'replaceGroup'; item: BasketItem; groupName: string }
  | {
      kind: 'replaceServices';
      group: BasketGroup;
      count: number;
      thenCheckout: boolean;
    }
  | { kind: 'signIn' };

const Context = createContext<CatalogActions | null>(null);

export function useCatalogActions(): CatalogActions {
  const ctx = useContext(Context);
  if (!ctx) {
    throw new Error('useCatalogActions must be used within CatalogActionsProvider');
  }
  return ctx;
}

/**
 * Owns the basket exclusivity confirmations (group ⇄ services), the
 * favorites limit and the sign-in gate before checkout.
 */
export function CatalogActionsProvider({ children }: { children: ReactNode }) {
  const t = useTranslations('catalog');
  const locale = useLocale();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const checkoutPath = getLocalizedRoute(locale, ROUTES.CHECKOUT);

  const continueToCheckout = useCallback(() => {
    // The auth store fills in after a background check; the token cookie
    // is the immediate signal right after signing in.
    const signedIn = isAuthenticated || !!getAuthTokenFromDocumentCookie();
    if (signedIn) {
      router.push(checkoutPath);
      return;
    }
    setPending({ kind: 'signIn' });
  }, [checkoutPath, isAuthenticated, router]);

  const toggleService = useCallback((item: BasketItem) => {
    const { serviceGroup, services, toggleService: toggle } =
      useBasketStore.getState();
    const inBasket = services.some((entry) => entry.id === item.id);
    if (serviceGroup && !inBasket) {
      setPending({ kind: 'replaceGroup', item, groupName: serviceGroup.name });
      return;
    }
    toggle(item);
  }, []);

  const applyGroup = useCallback(
    (group: BasketGroup, mode: 'toggle' | 'book') => {
      const store = useBasketStore.getState();
      if (mode === 'book') {
        store.setServiceGroup(group);
        toast.success(t.bookingStarted);
        continueToCheckout();
      } else {
        store.toggleServiceGroup(group);
      }
    },
    [continueToCheckout, t.bookingStarted]
  );

  const requestGroup = useCallback(
    (group: BasketGroup, mode: 'toggle' | 'book') => {
      const { services } = useBasketStore.getState();
      if (services.length > 0) {
        setPending({
          kind: 'replaceServices',
          group,
          count: services.length,
          thenCheckout: mode === 'book',
        });
        return;
      }
      applyGroup(group, mode);
    },
    [applyGroup]
  );

  const toggleFavorite = useCallback(
    (kind: CatalogKind, id: number) => {
      const ok = useFavoritesStore.getState().toggleFavorite(kind, id);
      if (!ok) {
        toast.info(interpolate(t.favoritesLimit, { count: FAVORITES_LIMIT }));
      }
    },
    [t.favoritesLimit]
  );

  const value = useMemo<CatalogActions>(
    () => ({
      toggleService,
      toggleGroup: (group) => requestGroup(group, 'toggle'),
      bookGroup: (group) => requestGroup(group, 'book'),
      toggleFavorite,
      continueToCheckout,
    }),
    [continueToCheckout, requestGroup, toggleFavorite, toggleService]
  );

  const close = () => setPending(null);

  function confirm() {
    if (!pending) return;
    // Close first: the action below may open the sign-in prompt.
    setPending(null);
    if (pending.kind === 'replaceGroup') {
      useBasketStore.getState().toggleService(pending.item);
    } else if (pending.kind === 'replaceServices') {
      applyGroup(pending.group, pending.thenCheckout ? 'book' : 'toggle');
    } else {
      const loginPath = getLocalizedRoute(locale, ROUTES.LOGIN);
      router.push(`${loginPath}?redirect=${encodeURIComponent(checkoutPath)}`);
    }
  }

  return (
    <Context.Provider value={value}>
      {children}
      <ConfirmDialog
        open={pending !== null}
        title={
          pending?.kind === 'replaceGroup'
            ? t.replace.groupTitle
            : pending?.kind === 'replaceServices'
              ? t.replace.servicesTitle
              : t.signIn.title
        }
        message={
          pending?.kind === 'replaceGroup'
            ? interpolate(t.replace.groupMessage, { name: pending.groupName })
            : pending?.kind === 'replaceServices'
              ? interpolate(t.replace.servicesMessage, {
                  name: pending.group.name,
                  count: pending.count,
                })
              : t.signIn.message
        }
        confirmLabel={
          pending?.kind === 'signIn' ? t.signIn.confirm : t.replace.replace
        }
        cancelLabel={
          pending?.kind === 'signIn' ? t.signIn.cancel : t.replace.keep
        }
        onConfirm={confirm}
        onCancel={close}
      />
    </Context.Provider>
  );
}
