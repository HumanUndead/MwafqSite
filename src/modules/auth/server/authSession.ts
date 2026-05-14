import 'server-only'

import { cache } from 'react'
import { cookies } from 'next/headers'
import { authSessionCookieName, type AuthSession } from '../session.shared'
import type { AuthResponse, User } from '../types/auth.types'
import { authCookieOptions } from './authService'

interface CookieSetter {
  set: (name: string, value: string, options: typeof authCookieOptions) => unknown
}

interface CookieDeleter {
  delete: (name: string) => unknown
}

function serializeAuthSession(session: AuthSession): string {
  return Buffer.from(JSON.stringify(session), 'utf8').toString('base64url')
}

function isAuthSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== 'object') {
    return false
  }

  const session = value as Partial<AuthSession>
  const user = session.user as Partial<User> | undefined

  return typeof session.token === 'string'
    && !!user
    && typeof user.id === 'string'
    && typeof user.email === 'string'
    && typeof user.name === 'string'
    && (typeof user.username === 'undefined' || typeof user.username === 'string')
    && (user.role === 'user' || user.role === 'admin')
    && typeof user.createdAt === 'string'
}

function parseAuthSession(value?: string): AuthSession | null {
  if (!value) {
    return null
  }

  try {
    const parsed = JSON.parse(Buffer.from(value, 'base64url').toString('utf8'))
    return isAuthSession(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function setAuthSessionCookie(cookieStore: CookieSetter, data: AuthResponse) {
  cookieStore.set(
    authSessionCookieName,
    serializeAuthSession({ token: data.token, user: data.user }),
    authCookieOptions
  )
}

export function clearAuthSessionCookie(cookieStore: CookieDeleter) {
  cookieStore.delete(authSessionCookieName)
}

export const getAuthSession = cache(async (): Promise<AuthSession | null> => {
  const cookieStore = await cookies()
  return parseAuthSession(cookieStore.get(authSessionCookieName)?.value)
})

export async function getCurrentUser(): Promise<User | null> {
  return (await getAuthSession())?.user ?? null
}
