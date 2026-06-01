'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchTimeSlots } from '@/modules/services/api/bookingApi';
import { toBookingQueryErrorMessage } from '@/modules/services/bookingQuery.shared';
import { bookingQueryKeys } from '@/modules/services/bookingQueryKeys';

export type UseBookingTimeSlotsParams = {
  branchId: number;
  serviceGroupId: number;
  serviceIds: number[];
  selectedDate: string | null;
};

export function useBookingTimeSlots({
  branchId,
  serviceGroupId,
  serviceIds,
  selectedDate,
}: UseBookingTimeSlotsParams) {
  const query = useQuery({
    queryKey: bookingQueryKeys.timeSlots(branchId, serviceGroupId, selectedDate),
    queryFn: ({ signal }) =>
      fetchTimeSlots(
        { branchId, serviceGroupId, serviceIds, dateChosen: selectedDate! },
        { signal }
      ),
    enabled: Boolean(selectedDate),
  });

  return {
    slots: query.data ?? [],
    loading: query.isLoading,
    error: query.isError ? toBookingQueryErrorMessage(query.error) : null,
    refetch: query.refetch,
  };
}
