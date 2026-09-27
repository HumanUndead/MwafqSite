import type { NextRequest } from 'next/server';
import { resolveTokenUser } from '@/modules/auth/server/resolveTokenUser';
import { isEmailOrSaudiMobile } from '@/modules/family/family.shared';
import { createFamilyMember } from '@/modules/family/server/familyService';
import type { CreateFamilyMemberInput } from '@/modules/family/types/family.types';
import {
  resolveRouteToken,
  routeBadRequest,
  routeError,
  routeOk,
  routeUnauthorized,
} from '@/shared/lib/upstream';

function isValid(input: Partial<CreateFamilyMemberInput>): input is CreateFamilyMemberInput {
  return (
    !!input.firstName?.trim() &&
    !!input.lastName?.trim() &&
    !!input.identityNumber?.trim() &&
    !!input.phoneNumber &&
    isEmailOrSaudiMobile(input.phoneNumber) &&
    !!input.dateOfBirth &&
    !Number.isNaN(Date.parse(input.dateOfBirth))
  );
}

/** Create a brand-new account for a family member and link it. */
export async function POST(request: NextRequest) {
  try {
    const token = await resolveRouteToken(request);
    if (!token) return routeUnauthorized();
    const body = (await request.json()) as Partial<CreateFamilyMemberInput>;
    if (!isValid(body)) return routeBadRequest('Invalid member details');
    const user = await resolveTokenUser(token);
    await createFamilyMember(token, user.id, body);
    return routeOk(true, 'Member created');
  } catch (error) {
    return routeError(error, '[family:members]');
  }
}
