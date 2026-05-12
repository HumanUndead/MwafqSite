'use client'

import { useTranslations } from '@/i18n/DictionaryProvider'
import { ForgotPasswordView } from '@/modules/auth'

export default function ForgotPasswordPage() {
  const auth = useTranslations('auth')

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">{auth.forgotPassword.title}</h1>
      <ForgotPasswordView />
    </div>
  )
}
