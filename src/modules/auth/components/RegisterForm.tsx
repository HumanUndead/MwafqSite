'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { getLocalizedRoute } from '@/i18n/routing';
import { Button } from '@/shared/components/ui/Button';
import { ROUTES } from '@/shared/constants/routes';
import { cn } from '@/shared/lib/cn';
import { useRegister } from '../hooks/useRegister';
import { getPasswordChecks, isStrongPassword } from '../passwordRules';
import { OtpModal } from './OtpModal';
import { AuthTextField } from './AuthTextField';
import type { RegisterDto } from '../types/auth.types';

function normalizePhoneInput(value: string): string {
  const digits = value.replace(/\D/g, '');

  if (digits.startsWith('966')) {
    return `0${digits.slice(3, 12)}`.slice(0, 10);
  }

  if (digits.startsWith('0')) {
    return digits.slice(0, 10);
  }

  if (digits.startsWith('5')) {
    return `0${digits}`.slice(0, 10);
  }

  return digits.slice(0, 10);
}

function formatPhonePreview(value: string): string {
  if (!value) {
    return '';
  }

  const first = value.slice(0, 3);
  const middle = value.slice(3, 6);
  const tail = value.slice(6, 10);

  return [first, middle, tail].filter(Boolean).join(' ');
}

function UserIcon() {
  return (
    <svg
      width='18'
      height='18'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' />
      <circle cx='12' cy='7' r='4' />
    </svg>
  );
}

function IdIcon() {
  return (
    <svg
      width='18'
      height='18'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <rect x='2' y='5' width='20' height='14' rx='2' ry='2' />
      <circle cx='9' cy='12' r='2.5' />
      <line x1='14' y1='10' x2='19' y2='10' />
      <line x1='14' y1='14' x2='17' y2='14' />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      width='18'
      height='18'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <path d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z' />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      width='18'
      height='18'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <path d='M8 2v4' />
      <path d='M16 2v4' />
      <rect x='3' y='4' width='18' height='18' rx='2' />
      <path d='M3 10h18' />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg
      width='16'
      height='16'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      aria-hidden='true'
    >
      <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
      <path d='M7 10l5-5 5 5' />
      <path d='M12 15V5' />
    </svg>
  );
}

function RequirementCheckIcon({ met }: { met: boolean }) {
  return (
    <span
      className={cn(
        'flex size-4 items-center justify-center rounded-[4px] border transition-colors',
        met
          ? 'border-emerald-500 bg-emerald-500 text-white'
          : 'border-[#cfd5e6] bg-white text-transparent'
      )}
      aria-hidden='true'
    >
      <svg
        width='10'
        height='10'
        viewBox='0 0 12 12'
        fill='none'
        stroke='currentColor'
        strokeWidth='2.2'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <path d='M2 6.5 4.7 9 10 3' />
      </svg>
    </span>
  );
}

function PasswordRequirementList({
  requirements,
}: {
  requirements: Array<{ label: string; met: boolean }>;
}) {
  return (
    <ul className='mt-2 grid gap-2 rounded-[14px] border border-[#d9ddea] bg-[#f8f9fc] p-3 sm:grid-cols-2'>
      {requirements.map((requirement) => (
        <li key={requirement.label} className='flex items-center gap-2'>
          <RequirementCheckIcon met={requirement.met} />
          <span
            className={cn(
              'text-xs',
              requirement.met ? 'text-[#1e2364]' : 'text-[#6b7196]'
            )}
          >
            {requirement.label}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function RegisterForm({ onComplete }: { onComplete?: () => void }) {
  const locale = useLocale();
  const auth = useTranslations('auth');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const {
    register,
    loading,
    error,
    verifyOtp,
    closeOtpModal,
    resendOtp,
    isOtpModalOpen,
    verificationTarget,
    step,
  } = useRegister(onComplete);
  const [form, setForm] = useState<RegisterDto>({
    firstName: '',
    lastName: '',
    identityNumber: '',
    phoneNumber: '',
    dateOfBirth: '',
    password: '',
    confirmPassword: '',
    image: null,
  });
  const [errors, setErrors] = useState<Partial<RegisterDto>>({});
  const passwordChecks = getPasswordChecks(form.password);
  const passwordsMatch =
    form.password.length > 0 && form.password === form.confirmPassword;

  const validate = (): boolean => {
    const next: Partial<RegisterDto> = {};
    if (form.firstName.trim().length < 2)
      next.firstName = auth.validation.nameMin;
    if (form.lastName.trim().length < 2)
      next.lastName = auth.validation.nameMin;
    if (!/^\d{10}$/.test(form.identityNumber))
      next.identityNumber = auth.validation.identityNumberLength;
    if (!/^05\d{8}$/.test(form.phoneNumber))
      next.phoneNumber = auth.validation.invalidSaudiPhone;
    if (!isStrongPassword(form.password))
      next.password = auth.validation.passwordWeak;
    if (form.password !== form.confirmPassword)
      next.confirmPassword = auth.validation.passwordMismatch;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await register(form);
  };

  const updateField =
    (key: keyof RegisterDto) => (e: ChangeEvent<HTMLInputElement>) => {
      const value =
        key === 'phoneNumber'
          ? normalizePhoneInput(e.target.value)
          : key === 'identityNumber'
            ? e.target.value.replace(/\D/g, '').slice(0, 10)
            : e.target.value;

      setForm((current) => ({ ...current, [key]: value }));
      setErrors((current) => {
        if (!current[key] && key !== 'password' && key !== 'confirmPassword') {
          return current;
        }

        const next = { ...current };
        delete next[key];

        if (key === 'password' || key === 'confirmPassword') {
          delete next.password;
          delete next.confirmPassword;
        }

        return next;
      });
    };

  const selectedFileName = form.image?.name ?? auth.fields.uploadHint;

  if (step === 'done') {
    return (
      <div className='flex flex-col items-center gap-4 text-center'>
        <div className='flex size-16 items-center justify-center rounded-full bg-[#e8f6fd] text-[#1e2364]'>
          <svg
            width='30'
            height='30'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2.3'
            strokeLinecap='round'
            strokeLinejoin='round'
            aria-hidden='true'
          >
            <path d='M20 6 9 17l-5-5' />
          </svg>
        </div>
        <h3 className='text-2xl font-bold text-[#1e2364]'>
          {auth.register.doneTitle}
        </h3>
        <p className='max-w-[320px] text-sm leading-6 text-[#6b7196]'>
          {auth.register.doneDescription}
        </p>
        <Link
          href={getLocalizedRoute(locale, ROUTES.LOGIN)}
          className='text-sm font-semibold text-[#00a8f1] transition hover:text-[#0090d1]'
        >
          {auth.register.signIn}
        </Link>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4' noValidate>
        <div className='grid gap-4 sm:grid-cols-2'>
          <AuthTextField
            label={auth.fields.firstName}
            value={form.firstName}
            onChange={updateField('firstName')}
            error={errors.firstName}
            placeholder={auth.fields.firstNamePlaceholder}
            autoComplete='given-name'
            icon={<UserIcon />}
          />

          <AuthTextField
            label={auth.fields.lastName}
            value={form.lastName}
            onChange={updateField('lastName')}
            error={errors.lastName}
            placeholder={auth.fields.lastNamePlaceholder}
            autoComplete='family-name'
            icon={<UserIcon />}
          />
        </div>

        <AuthTextField
          label={auth.fields.identityNumber}
          value={form.identityNumber}
          onChange={updateField('identityNumber')}
          error={errors.identityNumber}
          placeholder={auth.fields.identityNumberPlaceholder}
          inputMode='numeric'
          autoComplete='off'
          icon={<IdIcon />}
        />

        <AuthTextField
          label={auth.fields.phoneNumber}
          value={formatPhonePreview(form.phoneNumber)}
          onChange={updateField('phoneNumber')}
          error={errors.phoneNumber}
          placeholder={auth.fields.phoneNumberPlaceholder}
          inputMode='tel'
          autoComplete='tel-national'
          icon={<PhoneIcon />}
        />

        <AuthTextField
          label={auth.fields.dateOfBirth}
          value={form.dateOfBirth}
          onChange={updateField('dateOfBirth')}
          type='date'
          icon={<CalendarIcon />}
          hint={auth.fields.dateOfBirthHint}
          max={new Date().toISOString().slice(0, 10)}
        />

        <div>
          <AuthTextField
            label={auth.fields.password}
            value={form.password}
            onChange={updateField('password')}
            error={errors.password}
            placeholder={auth.fields.passwordPlaceholder}
            type='password'
            autoComplete='new-password'
          />
          <PasswordRequirementList
            requirements={[
              {
                label: auth.validation.passwordMin,
                met: passwordChecks.minLength,
              },
              {
                label: auth.validation.passwordUppercase,
                met: passwordChecks.uppercase,
              },
              {
                label: auth.validation.passwordLowercase,
                met: passwordChecks.lowercase,
              },
              {
                label: auth.validation.passwordNumber,
                met: passwordChecks.number,
              },
              {
                label: auth.validation.passwordSpecial,
                met: passwordChecks.special,
              },
            ]}
          />
        </div>

        <div>
          <AuthTextField
            label={auth.fields.confirmPassword}
            value={form.confirmPassword}
            onChange={updateField('confirmPassword')}
            error={errors.confirmPassword}
            placeholder={auth.fields.passwordPlaceholder}
            type='password'
            autoComplete='new-password'
          />
          <PasswordRequirementList
            requirements={[
              { label: auth.validation.passwordMatch, met: passwordsMatch },
            ]}
          />
        </div>

        <div className='flex flex-col gap-1.5'>
          <label className='px-1 text-[13px] font-bold tracking-[-0.01em] text-[#1e2364]'>
            {auth.fields.profileImage}
          </label>
          <div className='flex min-h-[52px] items-center justify-between gap-3 rounded-[14px] border border-[#d9ddea] bg-white px-3.5 py-2'>
            <div className='min-w-0'>
              <p
                className={cn(
                  'truncate text-sm font-medium',
                  form.image ? 'text-[#1e2364]' : 'text-[#a3a8c4]'
                )}
              >
                {selectedFileName}
              </p>
              <p className='mt-1 text-xs text-[#6b7196]'>
                {auth.fields.profileImageHint}
              </p>
            </div>
            <Button
              type='button'
              variant='outline'
              size='sm'
              shape='pill'
              className='shrink-0 border-[#1e2364] text-[#1e2364] hover:bg-[#1e2364] hover:text-white'
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadIcon />
              {form.image ? auth.fields.changeImage : auth.fields.uploadImage}
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type='file'
            accept='image/*'
            className='hidden'
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              setForm((current) => ({ ...current, image: file }));
            }}
          />
        </div>

        {error ? <p className='text-sm text-red-600'>{error}</p> : null}

        <Button
          type='submit'
          loading={loading}
          variant='brand'
          size='lg'
          className='mt-2 w-full rounded-[14px] py-3 text-[15px]'
        >
          {auth.register.submit}
        </Button>

        <p className='text-center text-sm text-[#6b7196]'>
          {auth.register.alreadyHaveAccount}{' '}
          <Link
            href={getLocalizedRoute(locale, ROUTES.LOGIN)}
            className='font-semibold text-[#00a8f1] transition hover:text-[#0090d1]'
          >
            {auth.register.signIn}
          </Link>
        </p>
      </form>

      <OtpModal
        open={isOtpModalOpen}
        destinationLabel={verificationTarget ?? ''}
        loading={loading}
        error={error}
        onVerify={verifyOtp}
        onResend={resendOtp}
        onClose={closeOtpModal}
      />
    </>
  );
}
