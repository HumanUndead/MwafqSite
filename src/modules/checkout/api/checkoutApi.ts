import type { Locale } from '@/i18n/config';
import { http } from '@/shared/lib/http';
import type {
  CheckoutBranch,
  CheckoutCourse,
  CheckoutServiceSelection,
  CheckoutSlotDay,
} from '../types/checkout.types';

function basketParams(
  service: CheckoutServiceSelection,
  locale: Locale
): URLSearchParams {
  const params = new URLSearchParams({ locale });
  if (service.serviceGroupId) {
    params.set('serviceGroupId', String(service.serviceGroupId));
  } else {
    params.set('serviceIds', service.serviceIds.join(','));
  }
  return params;
}

export const checkoutApi = {
  branches: (
    service: CheckoutServiceSelection,
    locale: Locale,
    center?: { latitude: number; longitude: number } | null
  ) => {
    const params = basketParams(service, locale);
    if (center) {
      params.set('latitude', String(center.latitude));
      params.set('longitude', String(center.longitude));
    }
    return http.get<CheckoutBranch[]>(`/api/checkout/branches?${params}`);
  },
  slots: (branchId: number, service: CheckoutServiceSelection, locale: Locale) => {
    const params = basketParams(service, locale);
    params.set('branchId', String(branchId));
    return http.get<CheckoutSlotDay[]>(`/api/checkout/slots?${params}`);
  },
  courses: (serviceGroupId: number, locale: Locale) =>
    http.get<CheckoutCourse[]>(
      `/api/checkout/courses?serviceGroupId=${serviceGroupId}&locale=${locale}`
    ),
};

export const checkoutQueryKeys = {
  all: ['checkout'] as const,
  branches: (
    service: CheckoutServiceSelection | null,
    locale: Locale,
    center: { latitude: number; longitude: number } | null
  ) => ['checkout', 'branches', service, locale, center] as const,
  slots: (
    branchId: number | null,
    service: CheckoutServiceSelection | null,
    locale: Locale
  ) => ['checkout', 'slots', branchId, service, locale] as const,
  courses: (serviceGroupId: number | null, locale: Locale) =>
    ['checkout', 'courses', serviceGroupId, locale] as const,
};
