import 'server-only';

import type {
  QuizAttemptDetail,
  QuizData,
  UserQuizAttemptsValue,
} from '../types/quiz.types';
import { academyAuthedRequest } from './academyUpstream';

/** Quiz with questions/answers for an enrolled user. */
export async function fetchQuizWithToken(
  token: string,
  quizId: number,
  locale: string
): Promise<QuizData> {
  const params = new URLSearchParams({
    Id: String(quizId),
    culture: locale,
  });

  return academyAuthedRequest<QuizData>({
    method: 'GET',
    path: `/api/Academy/Quiz/GetByUserId?${params.toString()}`,
    token,
    fallbackMessage: 'Failed to load quiz',
  });
}

/** Submit a quiz attempt; returns the new attemptId. */
export async function submitQuizAttemptWithToken(
  token: string,
  formData: FormData
): Promise<number> {
  return academyAuthedRequest<number>({
    method: 'POST',
    path: '/api/Academy/UserQuizAttempt/Create',
    token,
    body: formData,
    fallbackMessage: 'Failed to submit quiz',
  });
}

/** List a user's attempts for a quiz. */
export async function listQuizAttemptsWithToken(
  token: string,
  params: {
    userId: string;
    quizId: number;
    userCourseId: number;
    locale: string;
  }
): Promise<UserQuizAttemptsValue> {
  const query = new URLSearchParams({
    UserCourseId: String(params.userCourseId),
    userId: params.userId,
    quizId: String(params.quizId),
    OrderDirection: 'true',
    culture: params.locale,
  });

  return academyAuthedRequest<UserQuizAttemptsValue>({
    method: 'GET',
    path: `/api/Academy/UserQuizAttempt/List?${query.toString()}`,
    token,
    fallbackMessage: 'Failed to load attempts',
  });
}

/** Full attempt detail (questions + user answers). */
export async function getQuizAttemptWithToken(
  token: string,
  attemptId: number,
  locale: string
): Promise<QuizAttemptDetail> {
  const params = new URLSearchParams({
    Id: String(attemptId),
    culture: locale,
  });

  return academyAuthedRequest<QuizAttemptDetail>({
    method: 'GET',
    path: `/api/Academy/UserQuizAttempt/GetById?${params.toString()}`,
    token,
    fallbackMessage: 'Failed to load attempt',
  });
}
