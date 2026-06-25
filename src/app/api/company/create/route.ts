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
import { forwardCompanyCreateFormData } from '@/modules/company/companyCreatePayload.shared';

function toString(v: FormDataEntryValue | null): string {
  return typeof v === 'string' ? v.trim() : '';
}

function hasCompleteContact(incoming: FormData): boolean {
  const keys = [
    'Contact.FirstName',
    'Contact.LastName',
    'Contact.Email',
    'Contact.Phone',
  ] as const;

  return keys.every((key) => toString(incoming.get(key)).length > 0);
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

    const nameEn = toString(incomingForm.get('Translations[0].Name'));
    const rank = toString(incomingForm.get('Rank'));
    const crNumber = toString(incomingForm.get('CRNumber'));
    const vatNumber = toString(incomingForm.get('VATNumber'));

    if (!nameEn || !rank) {
      return NextResponse.json(
        { success: false, message: 'Name (English) and Rank are required.', data: null },
        { status: 400 }
      );
    }

    if (!crNumber || !vatNumber) {
      return NextResponse.json(
        { success: false, message: 'CR Number and VAT Number are required.', data: null },
        { status: 400 }
      );
    }

    if (!hasCompleteContact(incomingForm)) {
      return NextResponse.json(
        {
          success: false,
          message: 'All contact fields (first name, last name, email, phone) are required.',
          data: null,
        },
        { status: 400 }
      );
    }

    const upstreamForm = forwardCompanyCreateFormData(incomingForm);

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
