'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchBranches } from '@/modules/services/api/bookingApi';
import { toBookingQueryErrorMessage } from '@/modules/services/bookingQuery.shared';
import { bookingQueryKeys } from '@/modules/services/bookingQueryKeys';

export type UseBookingBranchesParams = {
  serviceGroupId: number;
};

export function useBookingBranches({
  serviceGroupId,
}: UseBookingBranchesParams) {
  const query = useQuery({
    queryKey: bookingQueryKeys.branches(serviceGroupId),
    queryFn: ({ signal }) => fetchBranches(serviceGroupId, { signal }),
  });

  return {
    branches: query.data ?? [],
    loading: query.isLoading,
    error: query.isError ? toBookingQueryErrorMessage(query.error) : null,
    refetch: query.refetch,
  };
}
