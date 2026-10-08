'use client';

import { useTranslations } from '@/i18n/DictionaryProvider';
import { Button } from '@/shared/components/ui/Button';
import { useOtpLogin } from '../hooks/useOtpLogin';
import { AuthTextField } from './AuthTextField';
import { OtpModal } from './OtpModal';

/** ID + OTP login: enter the ID, get a code, confirm it in the modal. */
export function LoginForm({ redirectTo }: { redirectTo?: string } = {}) {
  const auth = useTranslations('auth');
  const otpLogin = useOtpLogin(redirectTo);

  return (
    <>
      <form
        noValidate
        className='flex flex-col gap-5'
        onSubmit={(event) => {
          event.preventDefault();
          void otpLogin.sendOtp();
        }}
      >
        <AuthTextField
          label={auth.fields.identityNumber}
          hint={auth.fields.identityNumberPlaceholder}
          value={otpLogin.userName}
          onChange={(event) => otpLogin.setUserName(event.target.value)}
          error={otpLogin.fieldError ?? undefined}
          aria-invalid={otpLogin.fieldError ? true : undefined}
          aria-required
          inputMode='numeric'
          autoComplete='username'
          dir='ltr'
          inputClassName='text-start text-[15px] tracking-wide rtl:text-end'
        />
        <Button
          type='submit'
          loading={otpLogin.loading}
          variant='product'
          size='control'
          className='w-full'
        >
          {auth.login.sendCode}
        </Button>
      </form>

      <OtpModal
        open={otpLogin.isOtpModalOpen}
        destinationLabel={otpLogin.userName}
        loading={otpLogin.loading}
        error={otpLogin.error}
        onVerify={otpLogin.verifyOtp}
        onResend={otpLogin.resendOtp}
        onClose={otpLogin.closeOtpModal}
      />
    </>
  );
}
