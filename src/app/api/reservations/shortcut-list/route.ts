import { NextResponse } from 'next/server';
import {
  getMyReservations,
  ReservationsError,
} from '@/modules/profile-reservations/server/reservationsService';

export async function GET() {
  try {
    const reservations = await getMyReservations();

    return NextResponse.json({
      success: true,
      message: 'Reservations loaded successfully',
      data: reservations,
    });
  } catch (error) {
    if (error instanceof ReservationsError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          code: error.code,
          data: null,
        },
        {
          status:
            error.status >= 400 && error.status <= 599 ? error.status : 400,
        }
      );
    }

    console.error('[reservations/shortcut-list] Request failed.', error);

    return NextResponse.json(
      { success: false, message: 'Internal server error', data: null },
      { status: 500 }
    );
  }
}
