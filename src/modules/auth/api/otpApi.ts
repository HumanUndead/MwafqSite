import { http } from '@/shared/lib/http'

export const otpApi = {
  send: (email: string) =>
    http.post<null>('/api/auth/otp/send', { email }),

  verify: (email: string, otp: string) =>
    http.post<{ verified: boolean }>('/api/auth/otp/verify', { email, otp }),
}
