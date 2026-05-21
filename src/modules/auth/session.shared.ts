import type { User } from '@/shared/types/user.types';

export const authTokenCookieName = 'token';
export const authSessionCookieName = 'mwafq-session';

export interface AuthSession {
  token: string;
  user: User;
}
