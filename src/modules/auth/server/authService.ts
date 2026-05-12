import 'server-only'

import { authTokenCookieName } from '../session.shared'
import type { AuthResponse, LoginDto } from '../types/auth.types'

export class AuthInputError extends Error {}

export const authCookieName = authTokenCookieName

export const authCookieOptions = {
  httpOnly: true,
  maxAge: 60 * 60 * 24 * 7,
  path: '/',
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
}

export async function authenticateUser(data: LoginDto): Promise<AuthResponse> {
  const email = data.email.trim()
  const password = data.password

  if (!email || !password) {
    throw new AuthInputError('Email and password are required')
  }

  return {
    user: {
      id: '1',
      email,
      name: 'User',
      role: 'user',
      createdAt: new Date().toISOString(),
    },
    token: 'placeholder-token',
  }
}
