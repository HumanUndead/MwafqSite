'use client'

import { useTranslations } from '@/i18n/DictionaryProvider'
import { RegisterForm } from '@/modules/auth'

export default function RegisterPage() {
  const auth = useTranslations('auth')

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">{auth.register.title}</h1>
      <RegisterForm />
    </div>
  )
}
