import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { MWAFQ_API_BASE_URL } from '@/shared/constants/config';
import { authTokenCookieName } from '@/modules/auth/session.shared';

interface TranslationDto {
  name: string;
  langId: number;
}

interface TagDto {
  id: number | string;
  translations: TranslationDto[];
}

interface UpstreamResponse {
  value: { data: TagDto[] } | TagDto[];
  isSuccess: boolean;
}

export interface TagItem {
  id: string;
  langId: number;
  name: string;
}

function extractData(value: UpstreamResponse['value']): TagDto[] {
  if (Array.isArray(value)) return value;
  return value?.data ?? [];
}

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type') ?? '0';

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(authTokenCookieName)?.value;

    const url = new URL('/api/General/Tags/List', MWAFQ_API_BASE_URL);
    url.searchParams.set('Type', type);

    const headers: Record<string, string> = { Accept: 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(url.toString(), {
      headers,
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, data: [], message: 'Failed to load tags' },
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

    const items: TagItem[] = rawData.flatMap((item) =>
      item.translations.map((t) => ({
        id: String(item.id),
        langId: t.langId,
        name: t.name,
      }))
    );

    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: [], message: 'Internal server error' },
      { status: 500 }
    );
  }
}
