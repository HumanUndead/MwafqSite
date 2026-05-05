'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from '@/i18n/DictionaryProvider'
import { Button } from '@/shared/components/ui/Button'
import { Modal } from '@/shared/components/ui/Modal'
import { OtpInput } from '@/shared/components/ui/OtpInput'
import { useCountdown } from '@/shared/hooks/useCountdown'

interface Props {
  open: boolean
  email: string
  loading: boolean
  error: string | null
  onVerify: (otp: string) => Promise<void>
  onResend: () => Promise<void>
  onClose: () => void
}

export function OtpModal({ open, email, loading, error, onVerify, onResend, onClose }: Props) {
  const auth = useTranslations('auth')
  const [otp, setOtp] = useState('')
  const { seconds, isRunning, start } = useCountdown(60)

  useEffect(() => {
    if (open) {
      start()
    }
  }, [open, start])

  const handleVerify = () => {
    if (otp.length === 6) void onVerify(otp)
  }

  const handleResend = async () => {
    setOtp('')
    await onResend()
    start()
  }

  const handleClose = () => {
    setOtp('')
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title={auth.otp.title}>
      <div className="flex flex-col gap-5">
        <p className="text-center text-sm text-gray-600">
          {auth.otp.description} <span className="font-medium text-gray-900">{email}</span>
        </p>

        <OtpInput value={otp} onChange={setOtp} error={!!error} disabled={loading} />

        {error && <p className="text-center text-sm text-red-600">{error}</p>}

        <Button
          onClick={handleVerify}
          loading={loading}
          disabled={otp.length !== 6}
          className="w-full"
        >
          {auth.otp.verify}
        </Button>

        <div className="text-center text-sm text-gray-500">
          {isRunning ? (
            <span>{auth.otp.resendIn.replace('{{seconds}}', String(seconds))}</span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="font-medium text-blue-600 hover:text-blue-800"
            >
              {auth.otp.resend}
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}
