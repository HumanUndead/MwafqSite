import { http } from '@/shared/lib/http'
import type { AuthResponse } from '../types/auth.types'

export const otpApi = {
  send: (email: string) =>
    http.post<null>('/api/auth/otp/send', { email }),

  sendUserNameOtp: (userName: string) =>
    http.post<{ userName: string }>('/api/auth/otp/send', { userName }),

  resendUserNameOtp: (userName: string) =>
    http.post<{ userName: string }>('/api/auth/otp/resend', { userName }),

  verify: (email: string, otp: string) =>
    http.post<{ verified: boolean }>('/api/auth/otp/verify', { email, otp }),

  verifyUserNameOtp: (userName: string, otp: string) =>
    http.get<AuthResponse & { raw?: unknown }>(
      `/api/auth/otp/verify?UserName=${encodeURIComponent(userName)}&OTP=${encodeURIComponent(otp)}`,
    ),
}
