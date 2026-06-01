import { fetchWithErrorHandlingClient } from '@/shared/lib/fetchWithErrorHandling.shared';
import type {
  BookingTimeSlot,
  CreateReservationInput,
  ServiceGroupCourse,
  ServiceProviderBranch,
  SlotDayGroup,
} from '../types/booking.types';
import queryString from 'query-string';
import { PaginatedResponse } from '@/shared/types/api.types';

export async function fetchBranches(
  serviceGroupId: number,
  init?: { signal?: AbortSignal }
): Promise<ServiceProviderBranch[]> {
  const params = queryString.stringify(
    {
      serviceGroupId,
    },
    { skipNull: true }
  );
  const result = await fetchWithErrorHandlingClient<{
    branches: ServiceProviderBranch[];
  }>(`/api/client/client/GetBranches?${params}`, { signal: init?.signal });
  return result.branches ?? [];
}

export type FetchTimeSlotsParams = {
  branchId: number;
  serviceGroupId: number;
  serviceIds: number[];
  dateChosen?: string;
};

export async function fetchTimeSlots(
  { branchId, serviceGroupId, serviceIds, dateChosen }: FetchTimeSlotsParams,
  init?: { signal?: AbortSignal }
): Promise<BookingTimeSlot[]> {
  const params = queryString.stringify(
    {
      serviceProviderBranch: branchId,
      serviceId: serviceIds,
      serviceGroupId: [serviceGroupId],
      dateChosen,
    },
    { skipNull: true, skipEmptyString: true, arrayFormat: 'none' }
  );
  const result = await fetchWithErrorHandlingClient<{
    slotTimesGroupedByDay: SlotDayGroup[];
  }>(`/api/client/client/GetTimeSlotForBranch?${params}`, {
    signal: init?.signal,
  });
  return result.slotTimesGroupedByDay?.flatMap((g) => g.slotTimes) ?? [];
}
 

export async function fetchServiceGroupCourses(
  serviceGroupId: number,
  init?: { signal?: AbortSignal }
): Promise<import('../types/booking.types').ServiceGroupCourse[]> {
  const params = queryString.stringify({ serviceGroupId }, { skipNull: true });
  return fetchWithErrorHandlingClient<
    import('../types/booking.types').ServiceGroupCourse[]
  >(`/api/client/client/GetServiceGroupCourses?${params}`, {
    signal: init?.signal,
  });
}

export async function submitReservation(
  input: CreateReservationInput
): Promise<{ id: string | number }> {
  const form = new URLSearchParams();
  form.set('serviceProviderBranchId', String(input.serviceProviderBranchId));
  if (input.dateChosen) form.set('dateChosen', input.dateChosen);
  form.set('OwnerId', input.ownerId);

  input.slots.forEach((slot, i) => {
    form.set(
      `ReservationServices[${i}].serviceProviderBranchServiceId`,
      String(slot.serviceProviderBranchServiceId)
    );
    form.set(`ReservationServices[${i}].slotTimeId`, String(slot.slotTimeId));
  });

  if (input.courseId != null) {
    form.set('optionalCourseId', String(input.courseId));
  }

  return fetchWithErrorHandlingClient<{ id: string | number }>(
    '/api/client/client/CreateReservation',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    }
  );
}
