'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { academyLearnApi } from '../api/academyLearnApi';

export function useLectureDetail(
  lectureId: number,
  userCourseId: number,
  locale: string
) {
  return useQuery({
    queryKey: ['academy-lecture', lectureId, userCourseId, locale],
    enabled: Number.isFinite(lectureId) && Number.isFinite(userCourseId),
    queryFn: async () => {
      const response = await academyLearnApi.getLectureByUserId(
        lectureId,
        userCourseId,
        locale
      );
      return response.data;
    },
  });
}

/** Mark a lecture complete; invalidates the lecture + course caches. */
export function useSetLectureProgress(userCourseId: number, courseId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (lectureId: number) =>
      academyLearnApi.setLectureProgress(lectureId, userCourseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academy-lecture'] });
      queryClient.invalidateQueries({
        queryKey: ['academy-course', userCourseId, courseId],
      });
    },
  });
}
