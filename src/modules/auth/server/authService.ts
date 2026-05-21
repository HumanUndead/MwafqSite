import 'server-only';

import { getUserDisplayName, resolveUserAppRole } from '@/shared/lib/user';
import type { User } from '@/shared/types/user.types';
import { authTokenCookieName } from '../session.shared';
import type { AuthResponse } from '../types/auth.types';

export class AuthInputError extends Error {}

export const authCookieName = authTokenCookieName;

const sharedCookieOptions = {
  maxAge: 60 * 60 * 24 * 7,
  path: '/',
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
};

/** Session payload — not readable from client JS. */
export const authCookieOptions = {
  ...sharedCookieOptions,
  httpOnly: true,
};

/** JWT for `Authorization: Bearer` — readable so the client `http` helper can attach it. */
export const authTokenCookieOptions = {
  ...sharedCookieOptions,
  httpOnly: false,
};

function tryDecodeBase64Url(value: string): string | null {
  try {
    return Buffer.from(value, 'base64url').toString('utf8');
  } catch {
    return null;
  }
}

function parseJwtPayload(token: string): Record<string, unknown> | null {
  const [, payload] = token.split('.');

  if (!payload) {
    return null;
  }

  const decoded = tryDecodeBase64Url(payload);

  if (!decoded) {
    return null;
  }

  try {
    const parsed = JSON.parse(decoded) as Record<string, unknown>;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function readStringClaim(
  payload: Record<string, unknown> | null,
  keys: readonly string[]
): string | null {
  if (!payload) {
    return null;
  }

  for (const key of keys) {
    const value = payload[key];

    if (typeof value === 'string') {
      const trimmed = value.trim();

      if (trimmed) {
        return trimmed;
      }
    }
  }

  return null;
}

function emptyUserDefaults(
  userName: string
): Omit<User, 'name' | 'username' | 'role'> {
  return {
    id: userName,
    userName,
    firstName: '',
    email: '',
    lastName: '',
    nationalityId: 0,
    nationalityName: '',
    phoneNo: '',
    address: '',
    countryId: 0,
    countryName: '',
    cityId: 0,
    cityName: '',
    roleId: null,
    roleName: null,
    companyId: 0,
    companyName: '',
    companyIds: [],
    companyNames: [],
    companyDepartmentId: 0,
    companyDepartmentName: '',
    serviceProviderId: null,
    serviceProviderName: '',
    isManagement: false,
    postCode: '',
    img: '',
    isActive: false,
    groupId: 0,
    identityNumber: userName,
    dateOfBirth: '',
    userTags: [],
    userServiceProviderBranches: [],
    userCompanyBranches: [],
    rolePermissions: null,
    createdAt: new Date().toISOString(),
  };
}

export function buildUserFromToken(
  token: string,
  fallbackUserName: string
): User {
  const payload = parseJwtPayload(token);
  const userName = fallbackUserName.trim();
  const firstName =
    readStringClaim(payload, [
      'given_name',
      'first name',
      'FirstName',
      'firstName',
      'first_name',
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
    ]) ?? '';
  const lastName =
    readStringClaim(payload, [
      'family_name',
      'LastName',
      'lastName',
      'last_name',
    ]) ?? '';
  const email =
    readStringClaim(payload, [
      'email',
      'upn',
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
    ]) ?? userName;
  const id =
    readStringClaim(payload, [
      'sub',
      'nameid',
      'uid',
      'userId',
      'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
    ]) ?? userName;

  const user: User = {
    ...emptyUserDefaults(userName || id),
    id,
    userName: userName || id,
    firstName,
    lastName,
    email,
    identityNumber: userName || id,
    username: userName || id,
    name: '',
    role: 'user',
  };

  user.name =
    getUserDisplayName(user) ||
    readStringClaim(payload, ['name', 'unique_name']) ||
    userName;
  user.role = resolveUserAppRole({
    ...user,
    role:
      readStringClaim(payload, [
        'role',
        'roles',
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
      ]) === 'admin'
        ? 'admin'
        : 'user',
  });

  return user;
}

export function buildAuthResponseFromToken(
  token: string,
  userName: string
): AuthResponse {
  return {
    user: buildUserFromToken(token, userName),
    token,
  };
}
