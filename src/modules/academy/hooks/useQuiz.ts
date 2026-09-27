'use client';

import { useQuery } from '@tanstack/react-query';
import { academyLearnApi } from '../api/academyLearnApi';

export function useQuizDetail(
  quizId: number,
  userCourseId: number,
  locale: string
) {
  return useQuery({
    queryKey: ['academy-quiz', quizId, userCourseId, locale],
    enabled: Number.isFinite(quizId) && Number.isFinite(userCourseId),
    queryFn: async () => {
      const response = await academyLearnApi.getQuiz(
        quizId,
        userCourseId,
        locale
      );
      return response.data;
    },
  });
}

export function useQuizAttempts(params: {
  userId: string;
  quizId: number;
  userCourseId: number;
  lessonId?: string | null;
  locale: string;
  pageNumber?: number;
  pageSize?: number;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: [
      'academy-quiz-attempts',
      params.quizId,
      params.userCourseId,
      params.userId,
      params.locale,
      params.pageNumber ?? 1,
      params.pageSize ?? 8,
    ],
    enabled:
      (params.enabled ?? true) &&
      Boolean(params.userId) &&
      Number.isFinite(params.quizId) &&
      Number.isFinite(params.userCourseId),
    queryFn: async () => {
      const response = await academyLearnApi.listQuizAttempts(params);
      return response.data;
    },
  });
}

export function useQuizAttempt(attemptId: number | null, locale: string) {
  return useQuery({
    queryKey: ['academy-quiz-attempt', attemptId, locale],
    enabled: attemptId !== null && Number.isFinite(attemptId),
    queryFn: async () => {
      const response = await academyLearnApi.getQuizAttempt(
        attemptId as number,
        locale
      );
      return response.data;
    },
  });
}
