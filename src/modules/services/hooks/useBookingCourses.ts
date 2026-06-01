'use client';

import { useQuery } from '@tanstack/react-query';

import { useLocale } from '@/i18n/DictionaryProvider';
import { fetchServiceGroupCourses } from '@/modules/services/api/bookingApi';
import { mapServiceGroupCoursesToOptions } from '@/modules/services/booking.shared';
import { toBookingQueryErrorMessage } from '@/modules/services/bookingQuery.shared';
import { bookingQueryKeys } from '@/modules/services/bookingQueryKeys';

export type UseBookingCoursesParams = {
  serviceGroupId: number;
};

export function useBookingCourses({ serviceGroupId }: UseBookingCoursesParams) {
  const locale = useLocale();

  const query = useQuery({
    queryKey: [...bookingQueryKeys.courses(serviceGroupId), locale],
    queryFn: ({ signal }) =>
      fetchServiceGroupCourses(serviceGroupId, { signal }),
    select: (data) => mapServiceGroupCoursesToOptions(data, locale),
  });

  return {
    courses: query.data ?? [],
    loading: query.isLoading,
    error: query.isError ? toBookingQueryErrorMessage(query.error) : null,
    refetch: query.refetch,
  };
}
