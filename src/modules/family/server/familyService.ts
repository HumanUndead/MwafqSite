import 'server-only';

import { upstreamRequest } from '@/shared/lib/upstream';
import { normalizeFamilyUsername } from '../family.shared';
import type {
  CreateFamilyMemberInput,
  FamilyLookupUser,
  FamilyOverview,
  RelatedUser,
  RelatedUserStatus,
} from '../types/family.types';

interface RawRelatedUsers {
  relatedToUsers?: FamilyOverview['relatedToUsers'] | null;
}

interface RawBelongTo {
  relationId: number;
  status: RelatedUserStatus;
  relatedTo?: {
    userId?: string;
    fullName?: string;
    firstName?: string;
    lastName?: string;
  } | null;
}

/** `GetMyBelongTo` row → the shared `RelatedUser` shape. */
function toBelongToUser(row: RawBelongTo, myId: string): RelatedUser {
  const owner = row.relatedTo ?? {};
  const ownerName =
    owner.fullName?.trim() ||
    `${owner.firstName ?? ''} ${owner.lastName ?? ''}`.trim();
  return {
    id: row.relationId,
    userId: myId,
    fullName: '',
    firstName: '',
    lastName: '',
    relatedTo: owner.userId ?? '',
    image: null,
    fullNameRelatedTo: ownerName,
    status: row.status,
  };
}

/**
 * Users I manage come from `GetRelatedUsersById` (has relation id + status,
 * which `GetMyRelatedUsers` lacks). Accounts I belong to come from `GetMyBelongTo`.
 */
export async function getFamily(
  token: string,
  userId: string
): Promise<FamilyOverview> {
  const [related, belongTo] = await Promise.all([
    upstreamRequest<RawRelatedUsers>({
      method: 'GET',
      path: '/api/Client/ClientAuthenticate/GetRelatedUsersById',
      token,
      query: { userId },
      fallbackMessage: 'Failed to load family members',
    }),
    upstreamRequest<RawBelongTo[] | null>({
      method: 'GET',
      path: '/api/Client/ClientAuthenticate/GetMyBelongTo',
      token,
      fallbackMessage: 'Failed to load family members',
    }),
  ]);
  return {
    relatedToUsers: related?.relatedToUsers ?? [],
    belongToUsers: (belongTo ?? []).map((row) => toBelongToUser(row, userId)),
  };
}

export function createRelation(
  token: string,
  username: string,
  relatedTo: string
): Promise<number> {
  const form = new FormData();
  form.append('Username', username.trim());
  form.append('RelatedTo', relatedTo);
  return upstreamRequest<number>({
    method: 'POST',
    path: '/api/Client/ClientAuthenticate/CreateRelatedUser',
    token,
    body: form,
    fallbackMessage: 'Failed to send the relation request',
  });
}

export function updateRelationStatus(
  token: string,
  relationId: number,
  status: RelatedUserStatus
): Promise<boolean> {
  const form = new FormData();
  form.append('Id', String(relationId));
  form.append('Status', String(status));
  return upstreamRequest<boolean>({
    method: 'PUT',
    path: '/api/Client/ClientAuthenticate/UpdateRelatedUserStatus',
    token,
    body: form,
    fallbackMessage: 'Failed to update the request',
  });
}

export function deleteRelation(
  token: string,
  relationId: number
): Promise<boolean> {
  return upstreamRequest<boolean>({
    method: 'DELETE',
    path: '/api/Client/ClientAuthenticate/DeleteRelatedUser',
    token,
    query: { Id: relationId },
    fallbackMessage: 'Failed to remove the family member',
  });
}

interface RawLookupUser {
  id?: string;
  firstName?: string;
  lastName?: string;
  userName?: string;
  email?: string | null;
  img?: string | null;
}

/** Look up a user to link. Returns null when not found. Never leaks `otp`. */
export async function lookupUser(
  token: string,
  username: string
): Promise<FamilyLookupUser | null> {
  try {
    const value = await upstreamRequest<RawLookupUser | null>({
      method: 'GET',
      path: '/api/Authenticate/User/GetUserByUserName',
      token,
      query: { username: normalizeFamilyUsername(username) },
    });
    if (!value?.id) return null;
    return {
      id: value.id,
      firstName: value.firstName ?? '',
      lastName: value.lastName ?? '',
      userName: value.userName ?? '',
      email: value.email ?? null,
      img: value.img ?? null,
    };
  } catch {
    return null;
  }
}

/**
 * Create a new account for a family member (no OTP, no sign-in), then link
 * it to the current user by identity number — the mobile flow.
 */
export async function createFamilyMember(
  token: string,
  relatedTo: string,
  input: CreateFamilyMemberInput
): Promise<void> {
  const form = new FormData();
  form.append('Id', 'EmptyValue');
  form.append('FirstName', input.firstName.trim());
  form.append('LastName', input.lastName.trim());
  form.append('DateOfBirth', input.dateOfBirth);
  form.append('PhoneNumber', input.phoneNumber.trim());
  form.append('IdentityNumber', input.identityNumber.trim());
  form.append('CountryID', '14');

  await upstreamRequest<unknown>({
    method: 'POST',
    path: '/api/Authenticate/Auth/Register',
    token,
    body: form,
    fallbackMessage: 'Failed to create the family member',
  });
  await createRelation(token, input.identityNumber, relatedTo);
}
