'use client';

import { useState } from 'react';
import { useTranslations } from '@/i18n/DictionaryProvider';
import { toast } from '@/shared/components/feedback/Toast';
import { Button } from '@/shared/components/ui/Button';
import { authApi } from '../api/authApi';
import {
  SSO_DEV_NETWORK_ENABLED,
  runSsoAuthorizeInBrowser,
} from '../ssoClient.dev';

export function LoginForm({ redirectTo }: { redirectTo?: string } = {}) {
  const auth = useTranslations('auth');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      // Dev: run from the browser so the request shows in the Network tab.
      // Prod: go through the server route so it stays hidden.
      const loginUrl = SSO_DEV_NETWORK_ENABLED
        ? await runSsoAuthorizeInBrowser()
        : (await authApi.ssoAuthorize()).data.loginUrl;

      if (loginUrl) {
        window.location.assign(loginUrl);
        return;
      }

      toast.error(auth.errors.loginFailed);
    } catch {
      toast.error(auth.errors.loginFailed);
    } finally {
      setLoading(false);
    }

    void redirectTo;
  };

  return (
    <div className='flex flex-col gap-4'>
      <Button
        type='button'
        onClick={handleLogin}
        loading={loading}
        variant='brand'
        size='lg'
        className='mt-2 w-full rounded-[14px] py-3 text-[15px]'
      >
        {auth.login.submit}
      </Button>

      {/* Sign-up link hidden — login only for now.
      <p className='text-center text-sm text-gray-600'>
        {auth.login.noAccount}{' '}
        <Link
          href={getLocalizedRoute(locale, ROUTES.REGISTER)}
          className='font-medium text-[#00a8f1] transition hover:text-[#0090d1]'
        >
          {auth.login.signUp}
        </Link>
      </p>
      */}
    </div>
  );
}
