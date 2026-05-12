'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider'
import { getLocalizedRoute } from '@/i18n/routing'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { ROUTES } from '@/shared/constants/routes'

interface Props {
  onSubmit: (email: string) => Promise<void>
  loading: boolean
  error: string | null
}

export function ForgotPasswordForm({ onSubmit, loading, error }: Props) {
  const locale = useLocale()
  const auth = useTranslations('auth')
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.includes('@')) {
      setEmailError(auth.validation.invalidEmail)
      return
    }
    setEmailError('')
    await onSubmit(email)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-sm text-gray-600">{auth.forgotPassword.description}</p>

      <Input
        label={auth.fields.email}
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        error={emailError}
        placeholder={auth.fields.emailPlaceholder}
        autoComplete="email"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" loading={loading} className="w-full">
        {auth.forgotPassword.submit}
      </Button>

      <p className="text-center text-sm text-gray-600">
        <Link
          href={getLocalizedRoute(locale, ROUTES.LOGIN)}
          className="font-medium text-blue-600 hover:text-blue-800"
        >
          {auth.forgotPassword.backToSignIn}
        </Link>
      </p>
    </form>
  )
}
