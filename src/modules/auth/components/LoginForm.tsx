'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { toast } from '@/shared/components/feedback/Toast';
import { Button } from '@/shared/components/ui/Button';
import { MWAFQ_REGISTER_URL } from '@/shared/constants/config';
import { authApi } from '../api/authApi';

export function LoginForm({ redirectTo }: { redirectTo?: string } = {}) {
  const auth = useTranslations('auth');
  const locale = useLocale();
  const [loading, setLoading] = useState(false);

  const handleRegister = () => {
    window.location.assign(MWAFQ_REGISTER_URL);
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      // Server route runs the PKCE + Authorize request (client id/secret stay
      // server-side); we only get back the hosted SSO login URL to redirect to.
      const { loginUrl } = (await authApi.ssoAuthorize()).data;

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

      <Button
        type='button'
        onClick={handleRegister}
        variant='outline'
        size='lg'
        className='w-full rounded-[14px] py-3 text-[15px]'
      >
        {locale === 'ar' ? 'التسجيل عبر موفق' : 'Register with Mwafq'}
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
