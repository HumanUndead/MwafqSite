'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider'
import { getLocalizedRoute } from '@/i18n/routing'
import { toast } from '@/shared/components/feedback/Toast'
import { ROUTES } from '@/shared/constants/routes'
import { authApi } from '../api/authApi'
import { useAuthStore } from '../store/authStore'
import type { LoginDto } from '../types/auth.types'

export function useLogin() {
  const locale = useLocale()
  const auth = useTranslations('auth')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const setUser = useAuthStore(s => s.setUser)
  const router = useRouter()

  const login = async (data: LoginDto) => {
    setLoading(true)
    setError(null)
    try {
      const response = await authApi.login(data)
      setUser(response.data.user)
      toast.success(auth.login.welcomeBack)
      router.push(getLocalizedRoute(locale, ROUTES.DASHBOARD))
    } catch (err) {
      const message = err instanceof Error ? err.message : auth.errors.loginFailed
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return { login, loading, error }
}
