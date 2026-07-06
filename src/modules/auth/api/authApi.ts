import { http } from '@/shared/lib/http';
import type {
  RegisterDto,
  RegisterResponse,
  User,
} from '../types/auth.types';

function normalizeSaudiPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '');

  if (digits.startsWith('966')) {
    return `0${digits.slice(3, 12)}`.slice(0, 10);
  }

  if (digits.startsWith('0')) {
    return digits.slice(0, 10);
  }

  if (digits.startsWith('5')) {
    return `0${digits}`.slice(0, 10);
  }

  return digits.slice(0, 10);
}

export const authApi = {
  register: (data: RegisterDto) => {
    const formData = new FormData();
    const localPhoneNumber = normalizeSaudiPhoneNumber(data.phoneNumber);

    formData.set('PhoneNumber', localPhoneNumber);
    formData.set('FirstName', data.firstName.trim());
    formData.set('LastName', data.lastName.trim());
    formData.set('CountryID', '14');
    formData.set('IdentityNumber', data.identityNumber.trim());
    formData.set('RelatedTo', '');
    formData.set('Password', data.password);
    formData.set('ConfirmPassword', data.confirmPassword);

    if (data.dateOfBirth) {
      formData.set('DateOfBirth', data.dateOfBirth);
    }

    if (data.image) {
      formData.set('Img', data.image);
    }

    return http.post<RegisterResponse>('/api/auth/register', formData);
  },

  logout: () => http.post<null>('/api/auth/logout', {}),
  getUserByToken: () => http.post<User>('/api/auth/get-user-by-token', {}),

  /** Start the Mwafq external SSO flow via our server (PKCE + Authorize hidden from Network). */
  ssoAuthorize: () =>
    http.post<{
      loginUrl: string;
      authorizationRequestId: string;
      expiresAtUtc: string | null;
    }>('/api/auth/sso/authorize', {}),

  /** Exchange the SSO auth code for tokens via our server (secret + tokens stay server-side). */
  ssoToken: (code: string) =>
    http.post<{ tokenType: string; accessTokenExpiresAtUtc: string | null }>(
      '/api/auth/sso/token',
      { code }
    ),
};
