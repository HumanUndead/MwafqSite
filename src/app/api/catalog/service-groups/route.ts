import type { NextRequest } from 'next/server';
import { listCatalogServiceGroups } from '@/modules/services/server/catalogService';
import { routeError, routeOk } from '@/shared/lib/upstream';
import { readCatalogQuery } from '../catalogQuery';

export async function GET(request: NextRequest) {
  try {
    const { query, locale } = readCatalogQuery(request);
    return routeOk(await listCatalogServiceGroups(query, locale));
  } catch (error) {
    return routeError(error, '[catalog/service-groups]');
  }
}
