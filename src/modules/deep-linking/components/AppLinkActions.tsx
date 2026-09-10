'use client';

import { useAppHandoff } from '@/modules/deep-linking/hooks/useAppHandoff';
import {
  APP_STORE_URL,
  PLAY_STORE_URL,
} from '@/modules/deep-linking/lib/appLinkUrls';
import { buttonVariants } from '@/shared/lib/variants';

export interface AppLinkActionLabels {
  openInApp: string;
  playStore: string;
  appStore: string;
}

interface Props {
  labels: AppLinkActionLabels;
}

interface AppLinkAction {
  href: string;
  label: string;
  /** `intent://` must stay in the same tab; store links open externally. */
  external: boolean;
}

/**
 * Manual retry for the handoff `useAppHandoff` already attempted on mount —
 * for browsers that swallow it (Firefox on Android ignores `intent://`) and
 * for the desktop case, which has no handoff at all.
 */
export function AppLinkActions({ labels }: Props) {
  const { platform, intentUrl } = useAppHandoff();

  const actions: AppLinkAction[] = [];

  if (intentUrl) {
    actions.push({ href: intentUrl, label: labels.openInApp, external: false });
  }
  if (platform !== 'ios') {
    actions.push({
      href: PLAY_STORE_URL,
      label: labels.playStore,
      external: true,
    });
  }
  if (APP_STORE_URL && platform !== 'android') {
    actions.push({
      href: APP_STORE_URL,
      label: labels.appStore,
      external: true,
    });
  }

  if (actions.length === 0) {
    return null;
  }

  return (
    <div className='flex w-full flex-wrap justify-center gap-3'>
      {actions.map((action, index) => (
        <a
          key={action.href}
          href={action.href}
          className={buttonVariants({
            variant: index === 0 ? 'brand' : 'brandOutline',
            size: 'hero',
            shape: 'pill',
          })}
          {...(action.external
            ? { target: '_blank', rel: 'noreferrer' }
            : null)}
        >
          {action.label}
        </a>
      ))}
    </div>
  );
}
