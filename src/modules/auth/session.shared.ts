import type { User } from './types/auth.types'

export const authTokenCookieName = 'token'
export const authSessionCookieName = 'mwafq-session'

export interface AuthSession {
  token: string
  user: User
}
