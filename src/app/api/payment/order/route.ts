import type { NextRequest } from 'next/server';
import { createClientOrder } from '@/modules/payment/server/paymentService';
import type { CreateClientOrderPayload } from '@/modules/payment/types/payment.types';
import {
  resolveRouteToken,
  routeBadRequest,
  routeError,
  routeOk,
  routeUnauthorized,
  UpstreamError,
} from '@/shared/lib/upstream';

function isValidPayload(body: CreateClientOrderPayload): boolean {
  const reservation = body.reservation;
  const hasReservation =
    !!reservation &&
    Number(reservation.serviceProviderBranchId) > 0 &&
    !!reservation.dateChosen &&
    !!reservation.ownerId &&
    Array.isArray(reservation.reservationServices) &&
    reservation.reservationServices.length > 0;
  const hasCourses =
    Array.isArray(body.courses) &&
    body.courses.length > 0 &&
    body.courses.every((course) => Number(course.courseId) > 0);
  return hasReservation || (!reservation && hasCourses);
}

export async function POST(request: NextRequest) {
  try {
    const token = await resolveRouteToken(request);
    if (!token) return routeUnauthorized();

    const body = (await request.json()) as CreateClientOrderPayload;
    if (!body || !isValidPayload(body)) {
      return routeBadRequest('Invalid order');
    }

    // TEMP debug: log the CreateClientOrder request/response.
    console.log('[payment/order] request', JSON.stringify(body, null, 2));
    const data = await createClientOrder(token, body);
    console.log('[payment/order] response', JSON.stringify(data, null, 2));
    return routeOk(data, 'Order created');
  } catch (error) {
    // TEMP debug: upstream failures (status / code / message).
    console.log(
      '[payment/order] error',
      error instanceof UpstreamError
        ? JSON.stringify({
            status: error.status,
            code: error.code,
            message: error.message,
          })
        : String(error)
    );
    return routeError(error, '[payment/order]');
  }
}
