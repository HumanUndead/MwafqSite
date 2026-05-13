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
import type { LoginDto } from '../types/auth.types'

function maskPhoneNumber(value: string | null | undefined): string | null {
  const digits = value?.replace(/\D/g, '') ?? ''

  if (digits.length < 4) {
    return null
  }

  return `•••• ${digits.slice(-4)}`
}

export function useLogin() {
  const locale = useLocale()
  const auth = useTranslations('auth')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false)
  const [verificationTarget, setVerificationTarget] = useState<string | null>(null)
  const [otpDestinationLabel, setOtpDestinationLabel] = useState<string | null>(null)
  const setUser = useAuthStore(s => s.setUser)
  const router = useRouter()

  const login = async (data: LoginDto) => {
    setLoading(true)
    setError(null)
    try {
      const response = await authApi.login(data)
      setVerificationTarget(response.data.userName)
      setOtpDestinationLabel(maskPhoneNumber(response.data.phoneNumber))
      setIsOtpModalOpen(true)
      toast.success(auth.login.otpSent)
    } catch (err) {
      const message = getLocalizedAuthErrorMessage(err, auth, auth.errors.loginFailed)
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
      toast.success(auth.login.welcomeBack)
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
      toast.success(auth.login.otpSent)
    } catch (err) {
      const message = getLocalizedAuthErrorMessage(err, auth, auth.errors.loginFailed)
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return {
    login,
    loading,
    error,
    verifyOtp,
    closeOtpModal,
    resendOtp,
    isOtpModalOpen,
    verificationTarget,
    otpDestinationLabel,
  }
}
