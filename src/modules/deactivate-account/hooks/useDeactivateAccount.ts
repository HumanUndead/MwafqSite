'use client';

import { useState } from 'react';
import type { Locale } from '@/i18n/config';
import { getLocalizedRoute } from '@/i18n/routing';
import { useTranslations } from '@/i18n/DictionaryProvider';
import { ROUTES } from '@/shared/constants/routes';
import { ApiError } from '@/shared/lib/http';
import type { User } from '@/shared/types/user.types';
import { deactivateAccountApi } from '../api/deactivateAccountApi';
import { isEmailIdentifier } from '../deactivateAccount.shared';
import type { DeactivateAccountStep } from '../types/deactivateAccount.types';

function isAuthRejection(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 401 || error.status === 403);
}

/** Non-2xx toasts fire globally; skip a field error for those + transport failures. */
function shouldShowFieldError(error: unknown): boolean {
  if (error instanceof ApiError) {
    return error.status !== 401 && error.status !== 403;
  }
  return false;
}

export function useDeactivateAccount(locale: Locale, initialIdentifier: string) {
  const auth = useTranslations('auth');

  const [step, setStep] = useState<DeactivateAccountStep>('identify');
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [password, setPassword] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const goToOtp = async (userName: string) => {
    await deactivateAccountApi.sendOtp(userName, locale);
    setIdentifier(userName);
    setStep('otp');
  };

  const submitIdentify = async () => {
    const trimmed = identifier.trim();
    setFieldError(null);

    if (!trimmed) {
      setFieldError(auth.validation.identityRequired);
      return;
    }

    setLoading(true);
    try {
      if (isEmailIdentifier(trimmed)) {
        const { data } = await deactivateAccountApi.login(trimmed, password, locale);
        if (!data.isSuccess) {
          setFieldError(auth.errors.loginFailed);
          return;
        }
      }

      await goToOtp(trimmed);
    } catch (error) {
      if (shouldShowFieldError(error)) {
        setFieldError(
          error instanceof ApiError ? error.message : auth.errors.loginFailed
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setOtpError(null);
    try {
      await deactivateAccountApi.sendOtp(identifier, locale);
    } catch {
      // Resend failures surface via the global toast; the OTP screen stays put.
    }
  };

  const verifyOtp = async (otp: string) => {
    setLoading(true);
    setOtpError(null);

    // Defensive reset — guarantee no stale token survives into this attempt.
    setToken(null);
    setUser(null);

    try {
      const { data: verifyData } = await deactivateAccountApi.verifyOtp(
        identifier,
        otp,
        locale
      );
      setToken(verifyData.token);

      try {
        const { data: userData } = await deactivateAccountApi.getUser(verifyData.token);
        setUser(userData);
        setStep('confirm');
        setIsConfirmOpen(true);
      } catch (userError) {
        if (isAuthRejection(userError)) {
          // Token was rejected as unauthorized — roll back.
          setToken(null);
        }
        setOtpError(
          userError instanceof ApiError ? userError.message : auth.otp.title
        );
      }
    } catch (error) {
      setOtpError(error instanceof ApiError ? error.message : auth.forgotPassword.invalidOtp);
    } finally {
      setLoading(false);
    }
  };

  const closeConfirm = () => {
    setIsConfirmOpen(false);
  };

  const confirmDeactivate = async () => {
    if (!token) {
      return;
    }

    setLoading(true);
    setStep('deactivating');

    try {
      await deactivateAccountApi.deactivate(token, locale);
      redirectToResult('success');
    } catch {
      redirectToResult('error');
    }
  };

  const redirectToResult = (status: 'success' | 'error') => {
    const target = new URL(
      getLocalizedRoute(locale, ROUTES.DEACTIVATE_ACCOUNT_RESULT),
      window.location.origin
    );
    target.searchParams.set('status', status);
    window.location.href = target.toString();
  };

  return {
    step,
    identifier,
    setIdentifier,
    password,
    setPassword,
    isEmail: isEmailIdentifier(identifier),
    loading,
    fieldError,
    otpError,
    isConfirmOpen,
    user,
    submitIdentify,
    resendOtp,
    verifyOtp,
    closeConfirm,
    confirmDeactivate,
  };
}
