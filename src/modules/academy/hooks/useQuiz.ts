'use client';

import { useQuery } from '@tanstack/react-query';
import { academyLearnApi } from '../api/academyLearnApi';

export function useQuizDetail(quizId: number, locale: string) {
  return useQuery({
    queryKey: ['academy-quiz', quizId, locale],
    enabled: Number.isFinite(quizId),
    queryFn: async () => {
      const response = await academyLearnApi.getQuiz(quizId, 0, locale);
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
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: [
      'academy-quiz-attempts',
      params.quizId,
      params.userCourseId,
      params.userId,
      params.locale,
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
