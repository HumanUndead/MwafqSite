import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { fetchWithErrorHandling } from '@/shared/lib/fetchWithErrorHandling';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const form = new FormData();
    form.set('UserId', String(body.userId ?? ''));
    form.set('Amount', String(body.amount ?? 0));
    form.set('ReservationId', String(body.reservationId ?? ''));
    form.set('Email', body.email ?? 'EmptyValue');
    form.set('Address', body.address ?? 'EmptyValue');
    form.set('City', body.city ?? 'EmptyValue');
    form.set('State', body.state || body.city || 'EmptyValue');
    form.set('Country', body.country || 'KSA');
    form.set('Postcode', body.postCode ?? 'EmptyValue');
    form.set('Firstname', body.firstName ?? 'EmptyValue');
    form.set('Lastname', body.lastName ?? 'EmptyValue');

    if (body.targetType) {
      form.set('TargetType', String(body.targetType));
    }
    if (body.targetId) {
      form.set('TargetId', String(body.targetId));
    }

    const result = await fetchWithErrorHandling<{
      pendingTransactionId: string;
      pubKey: { pubkey: string };
    }>('/api/Payment/Payment/PaymentCreditCardPayment', {
      method: 'POST',
      body: form,
    });

    return NextResponse.json({
      success: true,
      data: {
        pendingTransactionId: result.pendingTransactionId,
        pubKey: result.pubKey.pubkey,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Payment initialization failed', data: null },
      { status: 500 }
    );
  }
}
