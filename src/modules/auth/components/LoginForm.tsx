'use client'

import Link from 'next/link'
import { useActionState, useState, type ChangeEvent, type FormEvent } from 'react'
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider'
import { getLocalizedRoute } from '@/i18n/routing'
import { Button } from '@/shared/components/ui/Button'
import { Input } from '@/shared/components/ui/Input'
import { ROUTES } from '@/shared/constants/routes'
import {
  initialLoginActionState,
  type LoginActionState,
  type LoginFieldName,
  type LoginValues,
  validateLoginValues,
} from '../loginForm.shared'
import { submitLogin } from '../server/loginAction'

export function LoginForm() {
  const locale = useLocale()
  const auth = useTranslations('auth')
  const [state, formAction, pending] = useActionState(submitLogin, initialLoginActionState)
  const [form, setForm] = useState<LoginValues>({ email: '', password: '' })
  const [clientFieldErrors, setClientFieldErrors] = useState<LoginActionState['fieldErrors']>({})
  const [clientFormError, setClientFormError] = useState<LoginActionState['formError']>()
  const [dismissedServerFieldErrors, setDismissedServerFieldErrors] = useState<
    Partial<Record<LoginFieldName, true>>
  >({})
  const [dismissedServerFormError, setDismissedServerFormError] = useState(false)

  const updateField = (key: keyof LoginValues) => (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setForm(current => ({ ...current, [key]: value }))
    setClientFieldErrors(current => {
      if (!current[key]) {
        return current
      }

      const next = { ...current }
      delete next[key]
      return next
    })
    setClientFormError(undefined)
    setDismissedServerFieldErrors(current => ({ ...current, [key]: true }))
    setDismissedServerFormError(true)
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    const nextFieldErrors = validateLoginValues(form)
    setDismissedServerFieldErrors({})
    setDismissedServerFormError(false)

    if (Object.keys(nextFieldErrors).length === 0) {
      setClientFieldErrors({})
      setClientFormError(undefined)
      return
    }

    e.preventDefault()
    setClientFieldErrors(nextFieldErrors)
    setClientFormError(undefined)
  }

  const fieldErrors: LoginActionState['fieldErrors'] = {
    email: clientFieldErrors.email ?? (
      dismissedServerFieldErrors.email ? undefined : state.fieldErrors.email
    ),
    password: clientFieldErrors.password ?? (
      dismissedServerFieldErrors.password ? undefined : state.fieldErrors.password
    ),
  }
  const formError = clientFormError ?? (dismissedServerFormError ? undefined : state.formError)

  return (
    <form action={formAction} noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input type="hidden" name="locale" value={locale} />
      <Input
        label={auth.fields.email}
        name="email"
        type="email"
        value={form.email}
        onChange={updateField('email')}
        error={fieldErrors.email ? auth.validation[fieldErrors.email] : undefined}
        placeholder={auth.fields.emailPlaceholder}
        autoComplete="email"
      />
      <Input
        label={auth.fields.password}
        name="password"
        type="password"
        value={form.password}
        onChange={updateField('password')}
        error={fieldErrors.password ? auth.validation[fieldErrors.password] : undefined}
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

      {formError && <p className="text-sm text-red-600">{auth.errors[formError]}</p>}

      <Button type="submit" loading={pending} className="w-full">
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
