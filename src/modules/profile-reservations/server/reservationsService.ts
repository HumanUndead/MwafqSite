import 'server-only';

import { cookies } from 'next/headers';
import { authCookieName } from '@/modules/auth/server/authService';
import {
  extractUpstreamCode,
  extractUpstreamMessage,
} from '@/modules/auth/server/upstreamAuthResult';
import { performUpstreamTextRequest } from '@/modules/auth/server/upstreamRequest';
import { MWAFQ_API_BASE_URL } from '@/shared/constants/config';
import type {
  Reservation,
  ReservationsShortcutListPage,
} from '../types/reservation.types';
import {
  parseMyReservationsList,
  parseReservationsShortcutListPage,
} from './parseReservations';

function parseJsonSafe(value: string): unknown {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export class ReservationsError extends Error {
  code: string | null;
  status: number;

  constructor(message: string, status: number, code: string | null = null) {
    super(message);
    this.name = 'ReservationsError';
    this.status = status;
    this.code = code;
  }
}

async function getMyReservationsPayload(): Promise<unknown> {
  const endpoint = new URL(
    '/api/client/client/GetMyReservations',
    MWAFQ_API_BASE_URL
  );

  const upstreamResponse = await performUpstreamTextRequest({
    method: 'GET',
    url: endpoint,
  });

  const payload = parseJsonSafe(upstreamResponse.body);
  const upstreamCode = extractUpstreamCode(payload);

  if (upstreamResponse.status >= 400) {
    throw new ReservationsError(
      extractUpstreamMessage(payload, 'Failed to load reservations'),
      upstreamResponse.status,
      upstreamCode
    );
  }

  return payload;
}

export async function getMyReservations(): Promise<Reservation[]> {
  const payload = await getMyReservationsPayload();
  return parseMyReservationsList(payload);
}

export async function getReservationById(
  id: string
): Promise<Reservation | undefined> {
  const reservations = await getMyReservations();
  return reservations.find((item) => item.id === id);
}
