import type { NextRequest } from 'next/server';
import { submitQuizAttemptWithToken } from '@/modules/academy/server/quizService';
import {
  academyOk,
  academyRouteError,
  academyUnauthorized,
  resolveAcademyToken,
} from '@/modules/academy/server/routeHelpers';

export async function POST(request: NextRequest) {
  try {
    const token = await resolveAcademyToken(request);
    if (!token) return academyUnauthorized();

    const formData = await request.formData();
    const attemptId = await submitQuizAttemptWithToken(token, formData);

    return academyOk({ attemptId }, 'Attempt submitted');
  } catch (error) {
    return academyRouteError(error, '[academy/quiz/attempt]');
  }
}
