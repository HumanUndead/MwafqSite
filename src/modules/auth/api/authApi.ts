import { http } from '@/shared/lib/http'
import type { AuthResponse, LoginDto, RegisterDto } from '../types/auth.types'

export const authApi = {
  login: (data: LoginDto) =>
    http.post<AuthResponse>('/api/auth/login', data),

  register: (data: RegisterDto) =>
    http.post<AuthResponse>('/api/auth/register', data),

  logout: () =>
    http.post<null>('/api/auth/logout', {}),
}
