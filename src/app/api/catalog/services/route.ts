import type { NextRequest } from 'next/server';
import { listCatalogServices } from '@/modules/services/server/catalogService';
import { routeError, routeOk } from '@/shared/lib/upstream';
import { readCatalogQuery } from '../catalogQuery';

export async function GET(request: NextRequest) {
  try {
    const { query, locale } = readCatalogQuery(request);
    return routeOk(await listCatalogServices(query, locale));
  } catch (error) {
    return routeError(error, '[catalog/services]');
  }
}
