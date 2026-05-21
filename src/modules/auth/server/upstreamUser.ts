import 'server-only';

import { getUserDisplayName, resolveUserAppRole } from '@/shared/lib/user';
import type { User, UserCompanyBranch } from '@/shared/types/user.types';
import { buildUserFromToken } from './authService';

type PlainObject = Record<string, unknown>;

function asRecord(value: unknown): PlainObject | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as PlainObject)
    : null;
}

function readString(record: PlainObject, keys: readonly string[]): string {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === 'string') {
      return value.trim();
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
  }

  return '';
}

function readNumber(record: PlainObject, keys: readonly string[]): number {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return 0;
}

function readNullableNumber(
  record: PlainObject,
  keys: readonly string[]
): number | null {
  for (const key of keys) {
    if (!(key in record)) {
      continue;
    }

    const value = record[key];
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string' && value.trim()) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

function readBoolean(
  record: PlainObject,
  keys: readonly string[],
  fallback = false
): boolean {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === 'boolean') {
      return value;
    }

    if (value === 'true' || value === 1) {
      return true;
    }

    if (value === 'false' || value === 0) {
      return false;
    }
  }

  return fallback;
}

function readStringArray(
  record: PlainObject,
  keys: readonly string[]
): string[] {
  for (const key of keys) {
    const value = record[key];
    if (!Array.isArray(value)) {
      continue;
    }

    return value
      .map((item) =>
        typeof item === 'string' ? item.trim() : String(item ?? '')
      )
      .filter(Boolean);
  }

  return [];
}

function readNumberArray(
  record: PlainObject,
  keys: readonly string[]
): number[] {
  for (const key of keys) {
    const value = record[key];
    if (!Array.isArray(value)) {
      continue;
    }

    return value
      .map((item) => {
        if (typeof item === 'number' && Number.isFinite(item)) {
          return item;
        }
        if (typeof item === 'string' && item.trim()) {
          const parsed = Number(item);
          return Number.isFinite(parsed) ? parsed : null;
        }
        return null;
      })
      .filter((item): item is number => item !== null);
  }

  return [];
}

function readUnknownArray(
  record: PlainObject,
  keys: readonly string[]
): unknown[] {
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) {
      return value;
    }
  }

  return [];
}

function readCompanyBranches(record: PlainObject): UserCompanyBranch[] {
  const raw = record.userCompanyBranches ?? record.UserCompanyBranches;

  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((item) => asRecord(item))
    .filter((item): item is PlainObject => item !== null)
    .map((branch) => ({
      id: readNumber(branch, ['id', 'Id']),
      companyBranchId: readNumber(branch, [
        'companyBranchId',
        'CompanyBranchId',
      ]),
      companyBranchName: readString(branch, [
        'companyBranchName',
        'CompanyBranchName',
      ]),
      companyName: readString(branch, ['companyName', 'CompanyName']),
    }));
}

function extractUpstreamUserRecord(payload: unknown): PlainObject | null {
  const root = asRecord(payload);
  if (!root) {
    return null;
  }

  const valueWrapper = asRecord(root.value ?? root.Value);
  const fromValue = asRecord(valueWrapper?.user ?? valueWrapper?.User);
  if (fromValue) {
    return fromValue;
  }

  const directUser = asRecord(root.user ?? root.User);
  if (directUser) {
    return directUser;
  }

  const data = asRecord(root.data ?? root.Data);
  const fromData = asRecord(data?.user ?? data?.User);
  if (fromData) {
    return fromData;
  }

  const hasUserShape = [
    'userName',
    'UserName',
    'firstName',
    'FirstName',
    'identityNumber',
    'IdentityNumber',
  ].some((key) => key in root);

  return hasUserShape ? root : null;
}

function mapRecordToUser(
  record: PlainObject,
  token: string,
  fallbackUserName: string
): User {
  const firstName = readString(record, ['firstName', 'FirstName']);
  const lastName = readString(record, ['lastName', 'LastName']);
  const userName =
    readString(record, [
      'userName',
      'UserName',
      'identityNumber',
      'IdentityNumber',
    ]) || fallbackUserName.trim();

  const user: User = {
    id: readString(record, ['id', 'Id']) || userName,
    userName,
    firstName,
    email: readString(record, ['email', 'Email']),
    lastName,
    nationalityId: readNumber(record, ['nationalityId', 'NationalityId']),
    nationalityName: readString(record, ['nationalityName', 'NationalityName']),
    phoneNo: readString(record, ['phoneNo', 'PhoneNo', 'phone', 'Phone']),
    address: readString(record, ['address', 'Address']),
    countryId: readNumber(record, ['countryId', 'CountryId']),
    countryName: readString(record, ['countryName', 'CountryName']),
    cityId: readNumber(record, ['cityId', 'CityId']),
    cityName: readString(record, ['cityName', 'CityName']),
    otp: readString(record, ['otp', 'Otp']) || undefined,
    roleId: readNullableNumber(record, ['roleId', 'RoleId']),
    roleName: readString(record, ['roleName', 'RoleName']) || null,
    companyId: readNumber(record, ['companyId', 'CompanyId']),
    companyName: readString(record, ['companyName', 'CompanyName']),
    companyIds: readNumberArray(record, ['companyIds', 'CompanyIds']),
    companyNames: readStringArray(record, ['companyNames', 'CompanyNames']),
    companyDepartmentId: readNumber(record, [
      'companyDepartmentId',
      'CompanyDepartmentId',
    ]),
    companyDepartmentName: readString(record, [
      'companyDepartmentName',
      'CompanyDepartmentName',
    ]),
    serviceProviderId: readNullableNumber(record, [
      'serviceProviderId',
      'ServiceProviderId',
    ]),
    serviceProviderName: readString(record, [
      'serviceProviderName',
      'ServiceProviderName',
    ]),
    isManagement: readBoolean(record, ['isManagement', 'IsManagement']),
    postCode: readString(record, ['postCode', 'PostCode']),
    img: readString(record, ['img', 'Img']),
    isActive: readBoolean(record, ['isActive', 'IsActive']),
    groupId: readNumber(record, ['groupId', 'GroupId']),
    identityNumber: readString(record, ['identityNumber', 'IdentityNumber']),
    dateOfBirth: readString(record, ['dateOfBirth', 'DateOfBirth']),
    userTags: readUnknownArray(record, ['userTags', 'UserTags']),
    userServiceProviderBranches: readUnknownArray(record, [
      'userServiceProviderBranches',
      'UserServiceProviderBranches',
    ]),
    userCompanyBranches: readCompanyBranches(record),
    rolePermissions: record.rolePermissions ?? record.RolePermissions ?? null,
    name: '',
    username: userName,
    role: 'user',
    createdAt: readString(record, ['createdAt', 'CreatedAt']) || undefined,
  };

  user.name = getUserDisplayName(user);
  user.role = resolveUserAppRole(user);

  if (!user.createdAt && user.dateOfBirth) {
    user.createdAt = user.dateOfBirth;
  }

  if (!user.id && token) {
    const fallback = buildUserFromToken(token, userName);
    user.id = fallback.id;
    if (!user.email) {
      user.email = fallback.email;
    }
  }

  return user;
}

/** @deprecated Use `parseUpstreamUser` */
export function mapUpstreamUserToAppUser(
  payload: unknown,
  token: string,
  fallbackUserName = ''
): User {
  return parseUpstreamUser(payload, token, fallbackUserName);
}

export function parseUpstreamUser(
  payload: unknown,
  token: string,
  fallbackUserName = ''
): User {
  const record = extractUpstreamUserRecord(payload);

  if (!record) {
    return buildUserFromToken(token, fallbackUserName);
  }

  return mapRecordToUser(record, token, fallbackUserName);
}
