import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { MWAFQ_API_BASE_URL } from '@/shared/constants/config';
import { authTokenCookieName } from '@/modules/auth/session.shared';
import {
  extractUpstreamMessage,
  extractUpstreamCode,
  hasUpstreamFailure,
  normalizeUpstreamStatus,
} from '@/modules/auth/server/upstreamAuthResult';

function toString(v: FormDataEntryValue | null): string {
  return typeof v === 'string' ? v.trim() : '';
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(authTokenCookieName)?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized', data: null },
        { status: 401 }
      );
    }

    const incomingForm = await request.formData();

    const nameEn = toString(incomingForm.get('NameEn'));
    const rank = toString(incomingForm.get('Rank'));

    if (!nameEn || !rank) {
      return NextResponse.json(
        { success: false, message: 'Name (English) and Rank are required.', data: null },
        { status: 400 }
      );
    }

    const upstreamForm = new FormData();

    const textFields = [
      'NameEn', 'NameAr', 'AddressEn', 'AddressAr',
      'Rank', 'CountryId', 'CityId', 'CompanyTypeId',
      'ParentCompanyId', 'CompanyPhone', 'CompanySize',
      'CrNumber', 'VatNumber', 'Ipan',
      'ContactUserId', 'ContactFirstName', 'ContactLastName',
      'ContactEmail', 'ContactPhone', 'Status',
    ] as const;

    for (const field of textFields) {
      const val = incomingForm.get(field);
      if (typeof val === 'string' && val.trim()) {
        upstreamForm.set(field, val.trim());
      }
    }

    const tagEntries = incomingForm.getAll('Tags');
    for (const tag of tagEntries) {
      if (typeof tag === 'string' && tag) {
        upstreamForm.append('Tags', tag);
      }
    }

    const logo = incomingForm.get('Logo');
    if (logo instanceof File && logo.size > 0) {
      upstreamForm.set('Logo', logo);
    }

    const endpoint = new URL('/api/Company/Company/Create', MWAFQ_API_BASE_URL);

    const upstreamResponse = await fetch(endpoint.toString(), {
      method: 'POST',
      body: upstreamForm,
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    let payload: unknown;
    try {
      payload = await upstreamResponse.json();
    } catch {
      payload = null;
    }

    if (!upstreamResponse.ok || hasUpstreamFailure(payload)) {
      return NextResponse.json(
        {
          success: false,
          message: extractUpstreamMessage(payload, 'Failed to create company'),
          code: extractUpstreamCode(payload),
          data: null,
        },
        { status: upstreamResponse.ok ? 400 : normalizeUpstreamStatus(upstreamResponse.status) }
      );
    }

    return NextResponse.json({
      success: true,
      message: extractUpstreamMessage(payload, 'Company created successfully'),
      data: payload,
    });
  } catch (error) {
    console.error('[company/create] Failed', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', data: null },
      { status: 500 }
    );
  }
}
