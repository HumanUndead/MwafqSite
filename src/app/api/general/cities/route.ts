import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { MWAFQ_API_BASE_URL } from '@/shared/constants/config';
import { authTokenCookieName } from '@/modules/auth/session.shared';

interface TranslationDto {
  name: string;
  langId: number;
}

interface CityDto {
  id: number | string;
  translations: TranslationDto[];
}

interface UpstreamResponse {
  value: { data: CityDto[] } | CityDto[];
  isSuccess: boolean;
}

export interface CityItem {
  id: string;
  langId: number;
  name: string;
}

function extractData(value: UpstreamResponse['value']): CityDto[] {
  if (Array.isArray(value)) return value;
  return value?.data ?? [];
}

export async function GET(request: NextRequest) {
  const countryId = request.nextUrl.searchParams.get('countryId');

  if (!countryId) {
    return NextResponse.json(
      { success: false, data: [], message: 'countryId is required' },
      { status: 400 }
    );
  }

  const culture = request.nextUrl.searchParams.get('culture');
  const pagesize = request.nextUrl.searchParams.get('pagesize') ?? '100';

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(authTokenCookieName)?.value;

    const url = new URL('/api/General/City/List', MWAFQ_API_BASE_URL);
    url.searchParams.set('countryId', countryId);
    url.searchParams.set('pagenumber', '1');
    url.searchParams.set('pagesize', pagesize);
    if (culture) url.searchParams.set('culture', culture);

    const headers: Record<string, string> = { Accept: 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(url.toString(), { headers, cache: 'no-store' });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, data: [], message: 'Failed to load cities' },
        { status: response.status }
      );
    }

    const payload = (await response.json()) as UpstreamResponse;

    if (!payload.isSuccess) {
      return NextResponse.json(
        { success: false, data: [], message: 'Upstream error' },
        { status: 422 }
      );
    }

    const rawData = extractData(payload.value);

    const items: CityItem[] = rawData.flatMap((item) =>
      item.translations.map((t) => ({
        id: String(item.id),
        langId: t.langId,
        name: t.name,
      }))
    );

    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error('[general/cities] Fetch failed', error);
    return NextResponse.json(
      { success: false, data: [], message: 'Internal server error' },
      { status: 500 }
    );
  }
}
