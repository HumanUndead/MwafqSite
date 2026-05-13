import { http } from '@/shared/lib/http'
import type { LoginDto, LoginResponse, RegisterDto, RegisterResponse } from '../types/auth.types'

function normalizeSaudiPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '')

  if (digits.startsWith('966')) {
    return `0${digits.slice(3, 12)}`.slice(0, 10)
  }

  if (digits.startsWith('0')) {
    return digits.slice(0, 10)
  }

  if (digits.startsWith('5')) {
    return `0${digits}`.slice(0, 10)
  }

  return digits.slice(0, 10)
}

export const authApi = {
  login: (data: LoginDto) =>
    http.post<LoginResponse>('/api/auth/login', data),

  register: (data: RegisterDto) => {
    const formData = new FormData()
    const localPhoneNumber = normalizeSaudiPhoneNumber(data.phoneNumber)

    formData.set('PhoneNumber', localPhoneNumber)
    formData.set('FirstName', data.firstName.trim())
    formData.set('LastName', data.lastName.trim())
    formData.set('CountryID', '14')
    formData.set('IdentityNumber', data.identityNumber.trim())
    formData.set('RelatedTo', '')

    if (data.dateOfBirth) {
      formData.set('DateOfBirth', data.dateOfBirth)
    }

    if (data.image) {
      formData.set('Img', data.image)
    }

    return http.post<RegisterResponse>('/api/auth/register', formData)
  },

  logout: () =>
    http.post<null>('/api/auth/logout', {}),
}
