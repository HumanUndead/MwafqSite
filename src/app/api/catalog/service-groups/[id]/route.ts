import type { NextRequest } from 'next/server';
import { resolveLocale } from '@/i18n/routing';
import { getCatalogServiceGroup } from '@/modules/services/server/catalogService';
import {
  routeBadRequest,
  routeError,
  routeOk,
  toPositiveInt,
} from '@/shared/lib/upstream';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = toPositiveInt((await params).id);
    if (!id) return routeBadRequest('Invalid id');
    const locale = resolveLocale(request.nextUrl.searchParams.get('locale'));
    return routeOk(await getCatalogServiceGroup(id, locale));
  } catch (error) {
    return routeError(error, '[catalog/service-groups/id]');
  }
}
