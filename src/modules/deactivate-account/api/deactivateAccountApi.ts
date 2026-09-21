import { http } from '@/shared/lib/http';
import type { User } from '@/shared/types/user.types';

/**
 * Isolated from `@/modules/auth`'s api client on purpose — every call here
 * either carries no session at all, or an explicit short-lived token passed
 * as an Authorization header. Never reads or writes the site-wide `token`
 * cookie.
 */
export const deactivateAccountApi = {
  login: (username: string, password: string, culture: string) =>
    http.post<{ isSuccess: boolean }>('/api/deactivate-account/login', {
      username,
      password,
      culture,
    }),

  sendOtp: (userName: string, culture: string) =>
    http.post<{ userName: string }>('/api/deactivate-account/send-otp', {
      userName,
      culture,
    }),

  verifyOtp: (userName: string, otp: string, culture: string) =>
    http.post<{ token: string }>('/api/deactivate-account/verify-otp', {
      userName,
      otp,
      culture,
    }),

  getUser: (token: string) =>
    http.post<User>(
      '/api/deactivate-account/get-user',
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    ),

  deactivate: (token: string, culture: string) =>
    http.post<{ deactivated: boolean }>(
      '/api/deactivate-account/deactivate',
      { culture },
      { headers: { Authorization: `Bearer ${token}` } }
    ),
};
