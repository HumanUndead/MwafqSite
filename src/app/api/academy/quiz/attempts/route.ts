import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { listQuizAttemptsWithToken } from '@/modules/academy/server/quizService';
import {
  academyOk,
  academyRouteError,
  academyUnauthorized,
  resolveAcademyToken,
} from '@/modules/academy/server/routeHelpers';

export async function GET(request: NextRequest) {
  try {
    const token = await resolveAcademyToken(request);
    if (!token) return academyUnauthorized();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || '';
    const quizId = Number(searchParams.get('quizId'));
    const userCourseId = Number(searchParams.get('userCourseId'));
    const locale = searchParams.get('locale') || 'en';

    if (!userId || !Number.isFinite(quizId) || !Number.isFinite(userCourseId)) {
      return NextResponse.json(
        { success: false, message: 'Missing attempt parameters', data: null },
        { status: 400 }
      );
    }

    const data = await listQuizAttemptsWithToken(token, {
      userId,
      quizId,
      userCourseId,
      locale,
    });

    return academyOk(data, 'Attempts loaded');
  } catch (error) {
    return academyRouteError(error, '[academy/quiz/attempts]');
  }
}
