'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { getLocalizedRoute } from '@/i18n/routing';
import { ROUTES } from '@/shared/constants/routes';
import { useForgotPassword } from '../hooks/useForgotPassword';
import { ForgotPasswordForm } from './ForgotPasswordForm';
import { OtpModal } from './OtpModal';

export function ForgotPasswordView() {
  const locale = useLocale();
  const auth = useTranslations('auth');
  const {
    step,
    email,
    loading,
    error,
    isOtpModalOpen,
    sendOtp,
    verifyOtp,
    resendOtp,
    closeOtpModal,
  } = useForgotPassword();

  if (step === 'done') {
    return (
      <div className='flex flex-col items-center gap-4 text-center'>
        <div className='flex size-16 items-center justify-center rounded-full bg-green-100 text-3xl'>
          ✓
        </div>
        <h2 className='text-xl font-semibold text-gray-900'>
          {auth.forgotPassword.doneTitle}
        </h2>
        <p className='text-sm text-gray-600'>
          {auth.forgotPassword.doneDescription}
        </p>
        <Link
          href={getLocalizedRoute(locale, ROUTES.LOGIN)}
          className='mt-2 text-sm font-medium text-blue-600 hover:text-blue-800'
        >
          {auth.forgotPassword.backToSignIn}
        </Link>
      </div>
    );
  }

  return (
    <>
      <ForgotPasswordForm onSubmit={sendOtp} loading={loading} error={error} />
      <OtpModal
        open={isOtpModalOpen}
        destinationLabel={email}
        loading={loading}
        error={error}
        onVerify={verifyOtp}
        onResend={resendOtp}
        onClose={closeOtpModal}
      />
    </>
  );
}
