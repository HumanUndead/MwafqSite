import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getAcademyCulture } from '@/modules/academy/server/academyLanguage';
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
    const locale = await getAcademyCulture(searchParams.get('locale'));

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
      pageNumber: Math.max(1, Number(searchParams.get('pageNumber')) || 1),
      pageSize: Math.min(50, Math.max(1, Number(searchParams.get('pageSize')) || 8)),
    });

    return academyOk(data, 'Attempts loaded');
  } catch (error) {
    return academyRouteError(error, '[academy/quiz/attempts]');
  }
}
