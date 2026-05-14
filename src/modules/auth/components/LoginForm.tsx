'use client'

import Link from 'next/link'
import { useState, type ChangeEvent, type FormEvent } from 'react'
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider'
import { getLocalizedRoute } from '@/i18n/routing'
import { ROUTES } from '@/shared/constants/routes'
import { Button } from '@/shared/components/ui/Button'
import { useLogin } from '../hooks/useLogin'
import { OtpModal } from './OtpModal'
import { AuthTextField } from './AuthTextField'

interface LoginValues {
  userName: string
}

function UserNameIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
      <circle cx="9" cy="12" r="2.5" />
      <line x1="14" y1="10" x2="19" y2="10" />
      <line x1="14" y1="14" x2="17" y2="14" />
    </svg>
  )
}

export function LoginForm() {
  const locale = useLocale()
  const auth = useTranslations('auth')
  const { login, loading, error, verifyOtp, closeOtpModal, resendOtp, isOtpModalOpen, otpDestinationLabel } = useLogin()
  const [form, setForm] = useState<LoginValues>({ userName: '' })
  const [fieldError, setFieldError] = useState<string>()

  const updateField = (key: keyof LoginValues) => (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trimStart()
    setForm(current => ({ ...current, [key]: value }))
    if (key === 'userName' && fieldError) {
      setFieldError(undefined)
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!form.userName.trim()) {
      setFieldError(auth.validation.identityRequired)
      return
    }

    setFieldError(undefined)
    await login({ userName: form.userName.trim() })
  }

  return (
    <>
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        <AuthTextField
          label={auth.fields.identityNumber}
          value={form.userName}
          onChange={updateField('userName')}
          error={fieldError}
          placeholder={auth.fields.identityNumberPlaceholder}
          autoComplete="username"
          icon={<UserNameIcon />}
        />

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <Button
          type="submit"
          loading={loading}
          variant="brand"
          size="lg"
          className="mt-2 w-full rounded-[14px] py-3 text-[15px]"
        >
          {auth.login.submit}
        </Button>

        <p className="text-center text-sm text-gray-600">
          {auth.login.noAccount}{' '}
          <Link
            href={getLocalizedRoute(locale, ROUTES.REGISTER)}
            className="font-medium text-[#00a8f1] transition hover:text-[#0090d1]"
          >
            {auth.login.signUp}
          </Link>
        </p>
      </form>

      <OtpModal
        open={isOtpModalOpen}
        destinationLabel={otpDestinationLabel ?? ''}
        loading={loading}
        error={error}
        onVerify={verifyOtp}
        onResend={resendOtp}
        onClose={closeOtpModal}
      />
    </>
  )
}
