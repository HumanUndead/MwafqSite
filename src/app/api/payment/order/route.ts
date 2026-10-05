import type { NextRequest } from 'next/server';
import { createClientOrder } from '@/modules/payment/server/paymentService';
import type { CreateClientOrderPayload } from '@/modules/payment/types/payment.types';
import {
  resolveRouteToken,
  routeBadRequest,
  routeError,
  routeOk,
  routeUnauthorized,
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

    const data = await createClientOrder(token, body);
    return routeOk(data, 'Order created');
  } catch (error) {
    return routeError(error, '[payment/order]');
  }
}
