'use client';

import { useState } from 'react';
import { useTranslations } from '@/i18n/DictionaryProvider';
import { toast } from '@/shared/components/feedback/Toast';
import { getLocalizedAuthErrorMessage } from '../authError';
import { otpApi } from '../api/otpApi';

type Step = 'email' | 'otp' | 'done';

export function useForgotPassword() {
  const auth = useTranslations('auth');
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);

  const sendOtp = async (emailValue: string) => {
    setLoading(true);
    setError(null);
    try {
      await otpApi.send(emailValue);
      setEmail(emailValue);
      setIsOtpModalOpen(true);
      setStep('otp');
      toast.info(auth.forgotPassword.otpSent);
    } catch (err) {
      const message = getLocalizedAuthErrorMessage(
        err,
        auth,
        auth.forgotPassword.sendOtpFailed
      );
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (otp: string) => {
    setLoading(true);
    setError(null);
    try {
      await otpApi.verify(email, otp);
      setIsOtpModalOpen(false);
      setStep('done');
      toast.success(auth.forgotPassword.verifiedToast);
    } catch (err) {
      const message = getLocalizedAuthErrorMessage(
        err,
        auth,
        auth.forgotPassword.invalidOtp
      );
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const closeOtpModal = () => {
    setIsOtpModalOpen(false);
    setStep('email');
    setError(null);
  };

  const resendOtp = () => sendOtp(email);

  return {
    step,
    email,
    loading,
    error,
    isOtpModalOpen,
    sendOtp,
    verifyOtp,
    resendOtp,
    closeOtpModal,
  };
}
