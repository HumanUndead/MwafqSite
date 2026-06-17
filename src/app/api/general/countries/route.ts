import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { MWAFQ_API_BASE_URL } from '@/shared/constants/config';
import { authTokenCookieName } from '@/modules/auth/session.shared';

interface CountryTranslationDto {
  name: string;
  langId: number;
}

interface CountryDto {
  id: number;
  translations: CountryTranslationDto[];
}

interface UpstreamCountryListResponse {
  value: {
    data: CountryDto[];
  };
  isSuccess: boolean;
}

export interface CountryItem {
  id: number;
  name: string;
}

export async function GET(request: NextRequest) {
  const culture = request.nextUrl.searchParams.get('culture') ?? 'en';

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(authTokenCookieName)?.value;

    const url = new URL('/api/General/Country/List', MWAFQ_API_BASE_URL);
    url.searchParams.set('culture', culture);

    const headers: Record<string, string> = {
      Accept: 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url.toString(), {
      headers,
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, data: [], message: 'Failed to load countries' },
        { status: response.status }
      );
    }

    const payload = (await response.json()) as UpstreamCountryListResponse;

    if (!payload.isSuccess || !payload.value?.data) {
      return NextResponse.json(
        { success: false, data: [], message: 'Upstream error' },
        { status: 422 }
      );
    }

    const countries: CountryItem[] = payload.value.data
      .map((country) => ({
        id: country.id,
        name: country.translations[0]?.name ?? '',
      }))
      .filter((c) => c.name.trim().length > 0);

    return NextResponse.json({ success: true, data: countries });
  } catch (error) {
    console.error('[general/countries] Fetch failed', error);
    return NextResponse.json(
      { success: false, data: [], message: 'Internal server error' },
      { status: 500 }
    );
  }
}
