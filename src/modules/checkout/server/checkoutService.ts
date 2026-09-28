import 'server-only';

import type { Locale } from '@/i18n/config';
import type { PaginatedResponse } from '@/shared/types/api.types';
import { upstreamRequest } from '@/shared/lib/upstream';
import type {
  CheckoutBranch,
  CheckoutCourse,
  CheckoutSlotDay,
} from '../types/checkout.types';

export interface BasketQuery {
  serviceIds: number[];
  serviceGroupId: number | null;
}

export async function getCheckoutBranches(
  token: string,
  basket: BasketQuery,
  locale: Locale,
  center?: { latitude: number; longitude: number }
): Promise<CheckoutBranch[]> {
  const value = await upstreamRequest<{ branches?: CheckoutBranch[] | null }>({
    method: 'GET',
    path: '/api/client/client/GetBranches',
    token,
    query: {
      serviceGroupIds: basket.serviceGroupId ?? undefined,
      serviceIds: basket.serviceGroupId ? undefined : basket.serviceIds,
      latitude: center?.latitude,
      longitude: center?.longitude,
      culture: locale,
    },
    fallbackMessage: 'Failed to load facilities',
  });
  return value?.branches ?? [];
}

export async function getCheckoutSlots(
  token: string,
  branchId: number,
  basket: BasketQuery,
  locale: Locale
): Promise<CheckoutSlotDay[]> {
  const value = await upstreamRequest<{
    slotTimesGroupedByDay?: CheckoutSlotDay[] | null;
  }>({
    method: 'GET',
    path: '/api/Provider/ServiceProviderBranchSlot/GetWeeklyAvailableTimeSlotsForBranch',
    token,
    query: {
      serviceProviderBranch: branchId,
      serviceGroupId: basket.serviceGroupId ?? undefined,
      serviceId: basket.serviceGroupId ? undefined : basket.serviceIds,
      culture: locale,
    },
    fallbackMessage: 'Failed to load available times',
  });
  return value?.slotTimesGroupedByDay ?? [];
}

const COURSE_TARGET_B2B = 2;

/**
 * B2B-only courses can't be bought by a client: CreateClientOrder rejects
 * them with `Courses.B2B.NotAllowed`, so they are never offered.
 */
function isClientPurchasable(course: CheckoutCourse): boolean {
  return !course.target || (course.target & ~COURSE_TARGET_B2B) !== 0;
}

export async function getServiceGroupCourses(
  token: string,
  serviceGroupId: number,
  locale: Locale
): Promise<CheckoutCourse[]> {
  const value = await upstreamRequest<
    PaginatedResponse<CheckoutCourse> | CheckoutCourse[]
  >({
    method: 'GET',
    path: '/api/client/client/GetServiceGroupCourses',
    token,
    query: { serviceGroupId, culture: locale },
    fallbackMessage: 'Failed to load courses',
  });
  const courses = Array.isArray(value) ? value : (value?.data ?? []);
  return courses.filter(isClientPurchasable);
}
