'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider'
import { getLocalizedRoute } from '@/i18n/routing'
import { toast } from '@/shared/components/feedback/Toast'
import { ROUTES } from '@/shared/constants/routes'
import { authApi } from '../api/authApi'
import { useAuthStore } from '../store/authStore'
import type { RegisterDto } from '../types/auth.types'

export function useRegister() {
  const locale = useLocale()
  const auth = useTranslations('auth')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const setUser = useAuthStore(s => s.setUser)
  const router = useRouter()

  const register = async (data: RegisterDto) => {
    setLoading(true)
    setError(null)
    try {
      const response = await authApi.register(data)
      setUser(response.data.user)
      toast.success(auth.register.success)
      router.push(getLocalizedRoute(locale, ROUTES.DASHBOARD))
    } catch (err) {
      const message = err instanceof Error ? err.message : auth.errors.registrationFailed
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return { register, loading, error }
}
