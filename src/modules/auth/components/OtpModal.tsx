'use client';

import { X } from 'lucide-react';
import { useEffect, useId, useState, type FormEvent } from 'react';
import { useTranslations } from '@/i18n/DictionaryProvider';
import { Button } from '@/shared/components/ui/Button';
import { Modal } from '@/shared/components/ui/Modal';
import { OtpInput } from '@/shared/components/ui/OtpInput';
import { useCountdown } from '@/shared/hooks/useCountdown';

interface Props {
  open: boolean;
  destinationLabel: string;
  loading: boolean;
  error: string | null;
  onVerify: (otp: string) => Promise<void>;
  onResend?: () => Promise<void>;
  onClose: () => void;
}

const OTP_LENGTH = 4;

export function OtpModal({
  open,
  destinationLabel,
  loading,
  error,
  onVerify,
  onResend,
  onClose,
}: Props) {
  const auth = useTranslations('auth');
  const titleId = useId();
  const errorId = useId();
  const [otp, setOtp] = useState('');
  const { seconds, isRunning, start } = useCountdown(60);
  const formattedTime = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

  useEffect(() => {
    if (open) {
      start();
    }
  }, [open, start]);

  const verify = (code: string) => {
    if (code.length === OTP_LENGTH && !loading) void onVerify(code);
  };

  // Submit as soon as the last digit is in; the button stays for retries.
  const handleChange = (next: string) => {
    setOtp(next);
    if (next.length === OTP_LENGTH && otp.length !== OTP_LENGTH) verify(next);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    verify(otp);
  };

  const handleResend = async () => {
    if (!onResend) {
      return;
    }

    setOtp('');
    await onResend();
    start();
  };

  const handleClose = () => {
    setOtp('');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      ariaLabelledBy={titleId}
      className='max-w-[420px] rounded-2xl p-6 sm:p-7'
    >
      <div className='flex items-start justify-between gap-4'>
        <h2 id={titleId} className='text-[20px] font-bold leading-7 text-[#1e2364]'>
          {auth.otp.title}
        </h2>
        <Button
          type='button'
          variant='productText'
          size='compact'
          onClick={handleClose}
          aria-label={auth.otp.close}
          className='-me-2 -mt-1 w-9 px-0 text-[#6b7196] hover:bg-[#f3f4f8] hover:text-[#1e2364]'
        >
          <X className='size-5' aria-hidden />
        </Button>
      </div>

      <p className='mt-2 text-[14px] leading-6 text-[#6b7196]'>
        {auth.otp.description}{' '}
        <bdi className='font-semibold text-[#1e2364]'>{destinationLabel}</bdi>
      </p>
      <Button
        type='button'
        variant='productText'
        size='compact'
        onClick={handleClose}
        className='-ms-3.5 mt-1'
      >
        {auth.otp.changeId}
      </Button>

      <form onSubmit={handleSubmit} className='mt-5 flex flex-col gap-5'>
        <div className='flex flex-col gap-2'>
          <OtpInput
            length={OTP_LENGTH}
            value={otp}
            onChange={handleChange}
            error={!!error}
            errorId={errorId}
            disabled={loading}
            autoFocus
            getDigitLabel={(i) =>
              auth.otp.digitLabel
                .replace('{{n}}', String(i + 1))
                .replace('{{total}}', String(OTP_LENGTH))
            }
          />
          {error ? (
            <p id={errorId} role='alert' className='text-center text-[13.5px] font-semibold text-red-700'>
              {error}
            </p>
          ) : null}
        </div>

        <Button
          type='submit'
          variant='product'
          size='control'
          loading={loading}
          disabled={otp.length !== OTP_LENGTH}
          className='w-full'
        >
          {auth.otp.verify}
        </Button>
      </form>

      {onResend ? (
        <div className='mt-4 flex min-h-9 items-center justify-center text-[13.5px] text-[#6b7196]'>
          {isRunning ? (
            <span aria-live='off'>
              {auth.otp.resendIn
                .replace('{{seconds}}', formattedTime)
                .replace('{{time}}', formattedTime)}
            </span>
          ) : (
            <Button
              type='button'
              variant='productText'
              size='compact'
              disabled={loading}
              onClick={() => void handleResend()}
            >
              {auth.otp.resend}
            </Button>
          )}
        </div>
      ) : null}
    </Modal>
  );
}
