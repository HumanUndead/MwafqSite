'use client';

import { useQuery } from '@tanstack/react-query';
import { useLocale } from '@/i18n/DictionaryProvider';
import { catalogApi, catalogQueryKeys } from '../api/catalogApi';

/** Full group (with service names) — the list payload omits the names. */
export function useServiceGroupDetail(id: number | null) {
  const locale = useLocale();
  return useQuery({
    queryKey: catalogQueryKeys.group(id ?? 0, locale),
    queryFn: async () => (await catalogApi.getServiceGroup(id as number, locale)).data,
    enabled: id !== null && id > 0,
    staleTime: 5 * 60 * 1000,
  });
}
