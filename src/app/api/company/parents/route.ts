import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { MWAFQ_API_BASE_URL } from '@/shared/constants/config';
import { authTokenCookieName } from '@/modules/auth/session.shared';

interface TranslationDto {
  name: string;
  langId: number;
}

interface CompanyDto {
  id: number | string;
  translations: TranslationDto[];
}

interface UpstreamResponse {
  value: { data: CompanyDto[] } | CompanyDto[];
  isSuccess: boolean;
}

export interface ParentCompanyItem {
  id: string;
  langId: number;
  name: string;
}

function extractData(value: UpstreamResponse['value']): CompanyDto[] {
  if (Array.isArray(value)) return value;
  return value?.data ?? [];
}

export async function GET(_request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(authTokenCookieName)?.value;

    const url = new URL('/api/Company/Company/List', MWAFQ_API_BASE_URL);
    url.searchParams.set('status', 'true');

    const headers: Record<string, string> = { Accept: 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(url.toString(), {
      headers,
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, data: [], message: 'Failed to load companies' },
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

    const items: ParentCompanyItem[] = rawData.flatMap((item) =>
      item.translations.map((t) => ({
        id: String(item.id),
        langId: t.langId,
        name: t.name,
      }))
    );

    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error('[company/parents] Fetch failed', error);
    return NextResponse.json(
      { success: false, data: [], message: 'Internal server error' },
      { status: 500 }
    );
  }
}
