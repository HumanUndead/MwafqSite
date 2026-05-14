'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider'
import { getLocalizedRoute } from '@/i18n/routing'
import { toast } from '@/shared/components/feedback/Toast'
import { ROUTES } from '@/shared/constants/routes'
import { getLocalizedAuthErrorMessage } from '../authError'
import { authApi } from '../api/authApi'
import { otpApi } from '../api/otpApi'
import { useAuthStore } from '../store/authStore'
import type { RegisterDto } from '../types/auth.types'

type RegisterStep = 'form' | 'otp' | 'done'

export function useRegister() {
  const locale = useLocale()
  const auth = useTranslations('auth')
  const router = useRouter()
  const setUser = useAuthStore(s => s.setUser)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<RegisterStep>('form')
  const [verificationTarget, setVerificationTarget] = useState<string | null>(null)
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false)

  const register = async (data: RegisterDto) => {
    setLoading(true)
    setError(null)
    try {
      const response = await authApi.register(data)
      setVerificationTarget(response.data.userName)
      setIsOtpModalOpen(true)
      setStep('otp')
      toast.success(auth.register.success)
    } catch (err) {
      const message = getLocalizedAuthErrorMessage(err, auth, auth.errors.registrationFailed)
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async (otp: string) => {
    if (!verificationTarget) {
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await otpApi.verifyUserNameOtp(verificationTarget, otp)
      setUser(response.data.user)
      setIsOtpModalOpen(false)
      setStep('done')
      toast.success(auth.register.verifiedSuccess)
      router.push(getLocalizedRoute(locale, ROUTES.HOME))
      router.refresh()
    } catch (err) {
      const message = getLocalizedAuthErrorMessage(err, auth, auth.register.invalidOtp)
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const closeOtpModal = () => {
    setIsOtpModalOpen(false)
    setError(null)
  }

  const resendOtp = async () => {
    if (!verificationTarget) {
      return
    }

    setLoading(true)
    setError(null)
    try {
      await otpApi.resendUserNameOtp(verificationTarget)
      toast.success(auth.register.otpSent)
    } catch (err) {
      const message = getLocalizedAuthErrorMessage(err, auth, auth.errors.registrationFailed)
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return {
    step,
    loading,
    error,
    register,
    verifyOtp,
    closeOtpModal,
    resendOtp,
    isOtpModalOpen,
    verificationTarget,
  }
}
