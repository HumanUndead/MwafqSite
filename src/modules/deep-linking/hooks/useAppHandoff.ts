'use client';

import { useEffect, useSyncExternalStore } from 'react';
import {
  buildAndroidIntentUrl,
  detectMobilePlatform,
  resolveAppHandoffUrl,
  type MobilePlatform,
} from '@/modules/deep-linking/lib/appLinkUrls';

/** Scoped per path so a second shared link still gets its own attempt. */
const ATTEMPT_KEY_PREFIX = 'mwafq:app-handoff:';

export interface AppHandoff {
  platform: MobilePlatform;
  /** Android only — the manual retry behind the "Open in the app" button. */
  intentUrl: string | null;
}

/**
 * Fires the app handoff as soon as an `/app/*` page mounts, so a shared link
 * lands in the app instead of on a card the visitor has to tap through.
 *
 * The attempt runs once per path per tab: without the guard, tapping back out
 * of the store re-triggers it and traps the visitor on the page.
 */
export function useAppHandoff(): AppHandoff {
  const platform = useClientValue(readPlatform, 'other' as MobilePlatform);
  const currentUrl = useClientValue(readCurrentUrl, '');

  useEffect(() => {
    const target = resolveAppHandoffUrl(platform, window.location.href);
    if (!target || !claimAttempt(window.location.pathname)) return;

    window.location.replace(target);
  }, [platform]);

  return {
    platform,
    intentUrl:
      platform === 'android' && currentUrl
        ? buildAndroidIntentUrl(currentUrl)
        : null,
  };
}

/**
 * Browser-only value that renders as `serverValue` on the server and during
 * hydration, then settles on the real one. `useSyncExternalStore` rather than
 * `useState` + `useEffect`, which would set state inside an effect.
 */
function useClientValue<T>(read: () => T, serverValue: T): T {
  return useSyncExternalStore(subscribeNever, read, () => serverValue);
}

/** The values never change within a page load, so nothing to subscribe to. */
function subscribeNever(): () => void {
  return () => {};
}

function readPlatform(): MobilePlatform {
  return detectMobilePlatform(navigator.userAgent, navigator.maxTouchPoints);
}

function readCurrentUrl(): string {
  return window.location.href;
}

/** `false` when this path was already attempted in this tab. */
function claimAttempt(pathname: string): boolean {
  const key = `${ATTEMPT_KEY_PREFIX}${pathname}`;

  try {
    if (sessionStorage.getItem(key)) return false;
    sessionStorage.setItem(key, '1');
  } catch {
    // Private mode / blocked storage: attempt once, without the back guard.
  }

  return true;
}
