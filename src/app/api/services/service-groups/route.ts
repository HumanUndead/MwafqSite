import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { MWAFQ_API_BASE_URL } from '@/shared/constants/config';
import { authTokenCookieName } from '@/modules/auth/session.shared';
import { localeToLangId } from '@/i18n/config';

interface TranslationDto {
  name: string;
  langId: number;
}

interface ServiceGroupDto {
  id: number;
  translations: TranslationDto[];
}

interface UpstreamResponse {
  value: { data: ServiceGroupDto[] } | ServiceGroupDto[];
  isSuccess: boolean;
}

export interface ServiceGroupItem {
  id: number;
  name: string;
}

function extractData(value: UpstreamResponse['value']): ServiceGroupDto[] {
  if (Array.isArray(value)) return value;
  return value?.data ?? [];
}

// Upstream empties `translations` when filtered by `culture` for groups that
// lack that language, so we fetch all translations and pick by langId here
// with an English fallback.
function pickName(translations: TranslationDto[], langId: number): string {
  const match =
    translations.find((t) => t.langId === langId) ??
    translations.find((t) => t.langId === localeToLangId.en) ??
    translations[0];
  return match?.name?.trim() ?? '';
}

export async function GET(request: NextRequest) {
  const culture = request.nextUrl.searchParams.get('culture') ?? 'en';
  const langId = localeToLangId[culture as 'en' | 'ar'] ?? localeToLangId.en;
  const search = request.nextUrl.searchParams.get('search')?.trim();
  const pagesize = request.nextUrl.searchParams.get('pagesize') ?? '10';

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(authTokenCookieName)?.value;

    const url = new URL('/api/Service/ServiceGroup/List', MWAFQ_API_BASE_URL);
    url.searchParams.set('pagenumber', '1');
    url.searchParams.set('pagesize', pagesize);
    if (search) url.searchParams.set('search', search);

    const headers: Record<string, string> = { Accept: 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(url.toString(), { headers, cache: 'no-store' });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, data: [], message: 'Failed to load service groups' },
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

    const items: ServiceGroupItem[] = extractData(payload.value)
      .map((group) => ({
        id: group.id,
        name: pickName(group.translations, langId),
      }))
      .filter((item) => item.name.length > 0);

    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: [], message: 'Internal server error' },
      { status: 500 }
    );
  }
}
