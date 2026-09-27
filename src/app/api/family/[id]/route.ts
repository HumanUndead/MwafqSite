import type { NextRequest } from 'next/server';
import {
  deleteRelation,
  updateRelationStatus,
} from '@/modules/family/server/familyService';
import { RelatedUserStatus } from '@/modules/family/types/family.types';
import {
  resolveRouteToken,
  routeBadRequest,
  routeError,
  routeOk,
  routeUnauthorized,
  toPositiveInt,
} from '@/shared/lib/upstream';

type Params = { params: Promise<{ id: string }> };

const ALLOWED_STATUSES: number[] = Object.values(RelatedUserStatus);

/** Accept / reject a received request. */
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const token = await resolveRouteToken(request);
    if (!token) return routeUnauthorized();
    const id = toPositiveInt((await params).id);
    const body = (await request.json()) as { status?: number };
    const status = Number(body?.status);
    if (!id || !ALLOWED_STATUSES.includes(status)) {
      return routeBadRequest('Invalid relation or status');
    }
    return routeOk(
      await updateRelationStatus(token, id, status as RelatedUserStatus)
    );
  } catch (error) {
    return routeError(error, '[family:update]');
  }
}

/** Unlink a member / cancel a sent request. */
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const token = await resolveRouteToken(request);
    if (!token) return routeUnauthorized();
    const id = toPositiveInt((await params).id);
    if (!id) return routeBadRequest('Invalid relation');
    return routeOk(await deleteRelation(token, id));
  } catch (error) {
    return routeError(error, '[family:delete]');
  }
}
