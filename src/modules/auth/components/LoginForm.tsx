'use client';

import { useTranslations } from '@/i18n/DictionaryProvider';
import { Button } from '@/shared/components/ui/Button';
import { useOtpLogin } from '../hooks/useOtpLogin';
import { AuthTextField } from './AuthTextField';
import { OtpModal } from './OtpModal';

/** ID + OTP login. Mwafq SSO buttons removed. */
export function LoginForm({ redirectTo }: { redirectTo?: string } = {}) {
  const auth = useTranslations('auth');
  const otpLogin = useOtpLogin(redirectTo);

  return (
    <div className='flex flex-col gap-4'>
      <form
        className='flex flex-col gap-3'
        onSubmit={(event) => {
          event.preventDefault();
          void otpLogin.sendOtp();
        }}
      >
        <AuthTextField
          label={auth.fields.identityNumber}
          value={otpLogin.userName}
          onChange={(event) => otpLogin.setUserName(event.target.value)}
          error={otpLogin.fieldError ?? undefined}
          inputMode='numeric'
          autoComplete='username'
        />
        <Button
          type='submit'
          loading={otpLogin.loading}
          variant='brand'
          size='lg'
          className='w-full rounded-[14px] py-3 text-[15px]'
        >
          {auth.login.title}
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
    </div>
  );
}
