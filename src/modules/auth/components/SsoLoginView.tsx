'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { getLocalizedRoute } from '@/i18n/routing';
import { hasLocale, localeCookieName, type Locale } from '@/i18n/config';
import { ROUTES } from '@/shared/constants/routes';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../store/authStore';

type Status = 'loading' | 'success' | 'error';

/** Read the user's preferred locale from the cookie (client-side). */
function readPreferredLocale(): Locale | null {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${localeCookieName}=([^;]+)`)
  );
  const value = match ? decodeURIComponent(match[1]) : null;
  return value && hasLocale(value) ? value : null;
}

/**
 * SSO callback page. The browser always lands on `/en/ssologin` (the fixed
 * redirectUri). For UX we bounce to the user's language (`/ar/ssologin`) if it
 * differs, then exchange `?code=<AuthorizationCode>` for tokens via our server
 * route (client secret + tokens stay server-side) and send the user to profile.
 */
export function SsoLoginView() {
  const t = useTranslations('auth');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((s) => s.setUser);
  const code = searchParams.get('code');
  // No code in the URL → nothing to exchange, start in the error state.
  const [status, setStatus] = useState<Status>(code ? 'loading' : 'error');
  const exchanged = useRef(false);

  useEffect(() => {
    // Guard against React strict-mode double-invoke — the code is one-time-use.
    if (!code || exchanged.current) {
      return;
    }

    // UX only: match the visible URL locale to the user's language, then let
    // the exchange run on the destination page (the code carries in the query).
    const preferred = readPreferredLocale();
    if (preferred && preferred !== locale) {
      const target = getLocalizedRoute(preferred, ROUTES.SSO_LOGIN);
      router.replace(`${target}?code=${encodeURIComponent(code)}`);
      return;
    }

    exchanged.current = true;

    // Server route exchanges the code (client secret + tokens stay server-side)
    // and returns the user built from the JWT.
    authApi
      .ssoToken(code)
      .then((res) => {
        const user = res.data.user ?? null;
        if (user) {
          setUser(user);
        }
        setStatus('success');
        const profile = getLocalizedRoute(locale, ROUTES.PERSONAL_INFO);
        router.replace(profile);
        router.refresh();
      })
      .catch(() => setStatus('error'));
  }, [code, locale, router, setUser]);

  return (
    <div className='flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 text-center'>
      {status === 'loading' && (
        <span
          className='size-12 animate-spin rounded-full border-4 border-[#00a8f1] border-t-transparent'
          role='status'
          aria-label={t.ssoLogin.loadingTitle}
        />
      )}
      {status === 'success' && (
        <CheckCircle2 className='size-16 text-[#00a8f1]' aria-hidden='true' />
      )}
      {status === 'error' && (
        <AlertCircle className='size-16 text-red-500' aria-hidden='true' />
      )}

      <div className='space-y-2'>
        <h1 className='text-2xl font-semibold text-[#1e2364]'>
          {status === 'error'
            ? t.ssoLogin.errorTitle
            : status === 'success'
              ? t.ssoLogin.successTitle
              : t.ssoLogin.loadingTitle}
        </h1>
        <p className='text-sm text-gray-600'>
          {status === 'error'
            ? t.ssoLogin.errorSubtitle
            : status === 'success'
              ? t.ssoLogin.successSubtitle
              : t.ssoLogin.loadingSubtitle}
        </p>
      </div>

      {status === 'error' && (
        <Link
          href={getLocalizedRoute(locale, ROUTES.LOGIN)}
          className='font-medium text-[#00a8f1] transition hover:text-[#0090d1]'
        >
          {t.ssoLogin.retry}
        </Link>
      )}
    </div>
  );
}
