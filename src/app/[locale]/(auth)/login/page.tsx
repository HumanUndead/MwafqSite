'use client'

import { useTranslations } from '@/i18n/DictionaryProvider'
import { LoginForm } from '@/modules/auth'

export default function LoginPage() {
  const auth = useTranslations('auth')

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">{auth.login.title}</h1>
      <LoginForm />
    </div>
  )
}
