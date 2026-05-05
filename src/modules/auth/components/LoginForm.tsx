'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider'
import { getLocalizedRoute } from '@/i18n/routing'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { ROUTES } from '@/shared/constants/routes'
import { useLogin } from '../hooks/useLogin'
import type { LoginDto } from '../types/auth.types'

export function LoginForm() {
  const locale = useLocale()
  const auth = useTranslations('auth')
  const { login, loading, error } = useLogin()
  const [form, setForm] = useState<LoginDto>({ email: '', password: '' })
  const [errors, setErrors] = useState<Partial<LoginDto>>({})

  const validate = (): boolean => {
    const next: Partial<LoginDto> = {}
    if (!form.email.includes('@')) next.email = auth.validation.invalidEmail
    if (form.password.length < 8) next.password = auth.validation.passwordMin
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    await login(form)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label={auth.fields.email}
        type="email"
        value={form.email}
        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
        error={errors.email}
        placeholder={auth.fields.emailPlaceholder}
        autoComplete="email"
      />
      <Input
        label={auth.fields.password}
        type="password"
        value={form.password}
        onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
        error={errors.password}
        placeholder={auth.fields.passwordPlaceholder}
        autoComplete="current-password"
      />

      <div className="flex justify-end">
        <Link
          href={getLocalizedRoute(locale, ROUTES.FORGOT_PASSWORD)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {auth.login.forgotPassword}
        </Link>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" loading={loading} className="w-full">
        {auth.login.submit}
      </Button>

      <p className="text-center text-sm text-gray-600">
        {auth.login.noAccount}{' '}
        <Link
          href={getLocalizedRoute(locale, ROUTES.REGISTER)}
          className="font-medium text-blue-600 hover:text-blue-800"
        >
          {auth.login.signUp}
        </Link>
      </p>
    </form>
  )
}
