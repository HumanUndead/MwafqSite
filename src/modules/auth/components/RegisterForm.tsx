'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider'
import { getLocalizedRoute } from '@/i18n/routing'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { ROUTES } from '@/shared/constants/routes'
import { useRegister } from '../hooks/useRegister'
import type { RegisterDto } from '../types/auth.types'

export function RegisterForm() {
  const locale = useLocale()
  const auth = useTranslations('auth')
  const { register, loading, error } = useRegister()
  const [form, setForm] = useState<RegisterDto>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Partial<RegisterDto>>({})

  const validate = (): boolean => {
    const next: Partial<RegisterDto> = {}
    if (form.name.length < 2) next.name = auth.validation.nameMin
    if (!form.email.includes('@')) next.email = auth.validation.invalidEmail
    if (form.password.length < 8) next.password = auth.validation.passwordMin
    if (form.password !== form.confirmPassword) next.confirmPassword = auth.validation.passwordMismatch
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    await register(form)
  }

  const field = (key: keyof RegisterDto) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value })),
    error: errors[key],
  })

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label={auth.fields.fullName}
        placeholder={auth.fields.namePlaceholder}
        autoComplete="name"
        {...field('name')}
      />
      <Input
        label={auth.fields.email}
        type="email"
        placeholder={auth.fields.emailPlaceholder}
        autoComplete="email"
        {...field('email')}
      />
      <Input
        label={auth.fields.password}
        type="password"
        placeholder={auth.fields.passwordPlaceholder}
        autoComplete="new-password"
        {...field('password')}
      />
      <Input
        label={auth.fields.confirmPassword}
        type="password"
        placeholder={auth.fields.passwordPlaceholder}
        autoComplete="new-password"
        {...field('confirmPassword')}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" loading={loading} className="w-full">
        {auth.register.submit}
      </Button>

      <p className="text-center text-sm text-gray-600">
        {auth.register.alreadyHaveAccount}{' '}
        <Link
          href={getLocalizedRoute(locale, ROUTES.LOGIN)}
          className="font-medium text-blue-600 hover:text-blue-800"
        >
          {auth.register.signIn}
        </Link>
      </p>
    </form>
  )
}
