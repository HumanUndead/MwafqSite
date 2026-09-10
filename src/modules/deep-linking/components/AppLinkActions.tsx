'use client';

import { useEffect, useState } from 'react';
import {
  APP_STORE_URL,
  buildAndroidIntentUrl,
  detectMobilePlatform,
  PLAY_STORE_URL,
  type MobilePlatform,
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

export function AppLinkActions({ labels }: Props) {
  const [platform, setPlatform] = useState<MobilePlatform>('other');
  const [intentUrl, setIntentUrl] = useState<string | null>(null);

  useEffect(() => {
    const detected = detectMobilePlatform(
      navigator.userAgent,
      navigator.maxTouchPoints
    );

    setPlatform(detected);

    if (detected === 'android') {
      setIntentUrl(buildAndroidIntentUrl(window.location.href));
    }
  }, []);

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
