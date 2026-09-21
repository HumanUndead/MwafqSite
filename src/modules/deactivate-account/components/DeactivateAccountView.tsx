'use client';

import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { OtpModal } from '@/modules/auth';
import { useDeactivateAccount } from '../hooks/useDeactivateAccount';
import { ConfirmDeactivateDialog } from './ConfirmDeactivateDialog';
import { IdentifyForm } from './IdentifyForm';

interface Props {
  initialIdentifier: string;
}

export function DeactivateAccountView({ initialIdentifier }: Props) {
  const locale = useLocale();
  const auth = useTranslations('auth');
  const {
    step,
    identifier,
    setIdentifier,
    password,
    setPassword,
    isEmail,
    loading,
    fieldError,
    otpError,
    isConfirmOpen,
    submitIdentify,
    resendOtp,
    verifyOtp,
    closeConfirm,
    confirmDeactivate,
  } = useDeactivateAccount(locale, initialIdentifier);

  return (
    <>
      {step === 'identify' ? (
        <IdentifyForm
          identifier={identifier}
          onIdentifierChange={setIdentifier}
          password={password}
          onPasswordChange={setPassword}
          isEmail={isEmail}
          loading={loading}
          fieldError={fieldError}
          onSubmit={submitIdentify}
        />
      ) : null}

      <OtpModal
        open={step === 'otp'}
        destinationLabel={identifier}
        loading={loading}
        error={otpError}
        onVerify={verifyOtp}
        onResend={resendOtp}
        onClose={() => window.history.back()}
      />

      <ConfirmDeactivateDialog
        open={isConfirmOpen && (step === 'confirm' || step === 'deactivating')}
        loading={step === 'deactivating'}
        onConfirm={confirmDeactivate}
        onClose={closeConfirm}
      />

      {step === 'confirm' || step === 'deactivating' ? (
        <p className='text-center text-sm text-gray-600'>
          {auth.deactivateAccount.identityVerified}
        </p>
      ) : null}
    </>
  );
}
