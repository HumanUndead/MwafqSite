'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { getLocalizedRoute } from '@/i18n/routing';
import { toast } from '@/shared/components/feedback/Toast';
import { ROUTES } from '@/shared/constants/routes';
import { getLocalizedAuthErrorMessage } from '../authError';
import { otpApi } from '../api/otpApi';
import { useAuthStore } from '../store/authStore';
import { validateLoginValues } from '../loginForm.shared';

/**
 * Direct login with an identity number and a 4-digit OTP. The verify route
 * sets both auth cookies, so a successful verify leaves the user signed in.
 */
export function useOtpLogin(redirectTo?: string) {
  const locale = useLocale();
  const auth = useTranslations('auth');
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  const [userName, setUserName] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);

  const sendOtp = async () => {
    const trimmed = userName.trim();
    if (Object.keys(validateLoginValues({ userName: trimmed })).length > 0) {
      setFieldError(auth.errors.identityRequired);
      return;
    }

    setFieldError(null);
    setError(null);
    setLoading(true);
    try {
      await otpApi.sendUserNameOtp(trimmed);
      setIsOtpModalOpen(true);
      toast.success(auth.login.otpSent);
    } catch (err) {
      const message = getLocalizedAuthErrorMessage(
        err,
        auth,
        auth.errors.loginFailed
      );
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (otp: string) => {
    setError(null);
    setLoading(true);
    try {
      const response = await otpApi.verifyUserNameOtp(userName.trim(), otp);
      setUser(response.data.user);
      setIsOtpModalOpen(false);
      router.push(redirectTo ?? getLocalizedRoute(locale, ROUTES.HOME));
      router.refresh();
    } catch (err) {
      const message = getLocalizedAuthErrorMessage(
        err,
        auth,
        auth.register.invalidOtp
      );
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setError(null);
    setLoading(true);
    try {
      await otpApi.resendUserNameOtp(userName.trim());
      toast.success(auth.login.otpSent);
    } catch (err) {
      const message = getLocalizedAuthErrorMessage(
        err,
        auth,
        auth.errors.loginFailed
      );
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    userName,
    setUserName,
    fieldError,
    error,
    loading,
    isOtpModalOpen,
    closeOtpModal: () => {
      setIsOtpModalOpen(false);
      setError(null);
    },
    sendOtp,
    verifyOtp,
    resendOtp,
  };
}
