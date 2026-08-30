import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { MWAFQ_API_BASE_URL } from '@/shared/constants/config';
import { authTokenCookieName } from '@/modules/auth/session.shared';

interface UpstreamUserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNo: string;
}

interface UpstreamResponse {
  value: { data: UpstreamUserDto[] } | UpstreamUserDto[];
  isSuccess: boolean;
}

export interface UserSearchItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

function extractData(value: UpstreamResponse['value']): UpstreamUserDto[] {
  if (Array.isArray(value)) return value;
  return value?.data ?? [];
}

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get('search') ?? '';

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(authTokenCookieName)?.value;

    const url = new URL('/api/Authenticate/User/List', MWAFQ_API_BASE_URL);
    if (search) url.searchParams.set('Search', search);
    url.searchParams.set('PageSize', '25');

    const headers: Record<string, string> = { Accept: 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(url.toString(), { headers, cache: 'no-store' });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, data: [], message: 'Failed to search users' },
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

    const items: UserSearchItem[] = rawData.map((u) => ({
      id: u.id,
      firstName: u.firstName ?? '',
      lastName: u.lastName ?? '',
      email: u.email ?? '',
      phone: u.phoneNo ?? '',
    }));

    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: [], message: 'Internal server error' },
      { status: 500 }
    );
  }
}
