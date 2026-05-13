import 'server-only'

import { authTokenCookieName } from '../session.shared'
import type { AuthResponse, User } from '../types/auth.types'

export class AuthInputError extends Error {}

export const authCookieName = authTokenCookieName

export const authCookieOptions = {
  httpOnly: true,
  maxAge: 60 * 60 * 24 * 7,
  path: '/',
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
}

function tryDecodeBase64Url(value: string): string | null {
  try {
    return Buffer.from(value, 'base64url').toString('utf8')
  } catch {
    return null
  }
}

function parseJwtPayload(token: string): Record<string, unknown> | null {
  const [, payload] = token.split('.')

  if (!payload) {
    return null
  }

  const decoded = tryDecodeBase64Url(payload)

  if (!decoded) {
    return null
  }

  try {
    const parsed = JSON.parse(decoded) as Record<string, unknown>
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

function readStringClaim(payload: Record<string, unknown> | null, keys: readonly string[]): string | null {
  if (!payload) {
    return null
  }

  for (const key of keys) {
    const value = payload[key]

    if (typeof value === 'string') {
      const trimmed = value.trim()

      if (trimmed) {
        return trimmed
      }
    }
  }

  return null
}

export function buildUserFromToken(token: string, fallbackUserName: string): User {
  const payload = parseJwtPayload(token)
  const now = new Date().toISOString()
  const username = fallbackUserName.trim()
  const name = readStringClaim(payload, [
    'given_name',
    'first name',
    'FirstName',
    'firstName',
    'first_name',
    'name',
    'unique_name',
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
  ]) ?? ''
  const email = readStringClaim(payload, [
    'email',
    'upn',
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
  ]) ?? username
  const id = readStringClaim(payload, [
    'sub',
    'nameid',
    'uid',
    'userId',
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
  ]) ?? username
  const roleClaim = readStringClaim(payload, [
    'role',
    'roles',
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
  ])

  return {
    id,
    email,
    name,
    username,
    role: roleClaim === 'admin' ? 'admin' : 'user',
    createdAt: now,
  }
}

export function buildAuthResponseFromToken(token: string, userName: string): AuthResponse {
  return {
    user: buildUserFromToken(token, userName),
    token,
  }
}
