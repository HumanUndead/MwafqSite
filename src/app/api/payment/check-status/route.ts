import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { fetchWithErrorHandling } from '@/shared/lib/fetchWithErrorHandling';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const result = await fetchWithErrorHandling<boolean>(
      '/api/Payment/Payment/CheckPaymentStatus',
      {
        method: 'POST',
        body: JSON.stringify({
          userId: body.userId,
          paymentId: body.paymentId,
          pendingTransactionId: body.pendingTransactionId,
          reservationId: body.reservationId,
        }),
      }
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('[payment/check-status] failed', error);
    return NextResponse.json(
      { success: false, message: 'Payment status check failed', data: null },
      { status: 500 }
    );
  }
}
