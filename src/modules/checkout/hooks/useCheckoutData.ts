'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useLocale } from '@/i18n/DictionaryProvider';
import { checkoutApi, checkoutQueryKeys } from '../api/checkoutApi';
import type { CheckoutServiceSelection } from '../types/checkout.types';

export function useCheckoutBranches(
  service: CheckoutServiceSelection | null,
  center: { latitude: number; longitude: number } | null
) {
  const locale = useLocale();
  return useQuery({
    queryKey: checkoutQueryKeys.branches(service, locale, center),
    queryFn: async () =>
      (await checkoutApi.branches(service as CheckoutServiceSelection, locale, center))
        .data,
    enabled: !!service,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: true,
  });
}

export function useCheckoutSlots(
  branchId: number | null,
  service: CheckoutServiceSelection | null
) {
  const locale = useLocale();
  return useQuery({
    queryKey: checkoutQueryKeys.slots(branchId, service, locale),
    queryFn: async () =>
      (
        await checkoutApi.slots(
          branchId as number,
          service as CheckoutServiceSelection,
          locale
        )
      ).data,
    enabled: !!branchId && !!service,
  });
}

export function useServiceGroupCourses(
  serviceGroupId: number | null,
  enabled: boolean
) {
  const locale = useLocale();
  return useQuery({
    queryKey: checkoutQueryKeys.courses(serviceGroupId, locale),
    queryFn: async () =>
      (await checkoutApi.courses(serviceGroupId as number, locale)).data,
    enabled: enabled && !!serviceGroupId,
    staleTime: 5 * 60 * 1000,
  });
}
