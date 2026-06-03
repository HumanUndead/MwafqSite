import { fetchWithErrorHandlingClient } from '@/shared/lib/fetchWithErrorHandling.shared';
import type {
  CreateReservationInput,
  ServiceProviderBranch,
  SlotDayGroup,
  WeeklyAvailableTimeSlotsValue,
} from '../types/booking.types';
import queryString from 'query-string';
import { PaginatedResponse } from '@/shared/types/api.types';
import { CourseListItem } from '@/modules/auth/course.types';

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

export async function fetchServiceGroupCourses(
  serviceGroupId: number,
  init?: { signal?: AbortSignal }
) {
  const params = queryString.stringify({ serviceGroupId }, { skipNull: true });
  return fetchWithErrorHandlingClient<PaginatedResponse<CourseListItem>>(
    `/api/client/client/GetServiceGroupCourses?${params}`,
    {
      signal: init?.signal,
    }
  );
}

export type FetchWeeklyTimeSlotsParams = {
  branchId: number;
  serviceIds: number[];
  serviceGroupIds: number[];
};

export async function fetchWeeklyTimeSlots(
  { branchId, serviceIds, serviceGroupIds }: FetchWeeklyTimeSlotsParams,
  init?: { signal?: AbortSignal }
): Promise<SlotDayGroup[]> {
  const params = queryString.stringify(
    {
      serviceProviderBranch: branchId,
      serviceId: serviceIds,
      serviceGroupId: serviceGroupIds,
    },
    { skipNull: true, skipEmptyString: true, arrayFormat: 'none' }
  );
  const result =
    await fetchWithErrorHandlingClient<WeeklyAvailableTimeSlotsValue>(
      `/api/Provider/ServiceProviderBranchSlot/GetWeeklyAvailableTimeSlotsForBranch?${params}`,
      { signal: init?.signal }
    );
  return result.slotTimesGroupedByDay ?? [];
}

export async function submitReservation(input: CreateReservationInput) {
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

  if (input.courseId) {
    form.set('optionalCourseId', String(input.courseId));
  }

  return fetchWithErrorHandlingClient<string>(
    '/api/client/client/CreateReservation',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    }
  );
}
