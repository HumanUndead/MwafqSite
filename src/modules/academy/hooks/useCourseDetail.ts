'use client';

import { useQuery } from '@tanstack/react-query';
import { academyLearnApi } from '../api/academyLearnApi';
import {
  generateCourseNavigationMap,
  navStorageKey,
} from '../courseNavigation.shared';

/** Fetch an enrolled course; persists the navigation map for prev/next. */
export function useCourseDetail(
  userCourseId: number,
  courseId: number,
  locale: string
) {
  return useQuery({
    queryKey: ['academy-course', userCourseId, courseId, locale],
    enabled: Number.isFinite(userCourseId) && Number.isFinite(courseId),
    queryFn: async () => {
      const response = await academyLearnApi.getCourseByUserId(
        userCourseId,
        courseId,
        locale
      );
      const detail = response.data;

      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(
            navStorageKey(courseId),
            generateCourseNavigationMap(detail)
          );
        }
      } catch {
        // ignore storage errors
      }

      return detail;
    },
  });
}
