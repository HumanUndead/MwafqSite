import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getAcademyCulture } from '@/modules/academy/server/academyLanguage';
import { getQuizAttemptWithToken } from '@/modules/academy/server/quizService';
import {
  academyOk,
  academyRouteError,
  academyUnauthorized,
  resolveAcademyToken,
} from '@/modules/academy/server/routeHelpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    const token = await resolveAcademyToken(request);
    if (!token) return academyUnauthorized();

    const { attemptId } = await params;
    const id = Number(attemptId);
    const { searchParams } = new URL(request.url);
    const locale = await getAcademyCulture(searchParams.get('locale'));

    if (!Number.isFinite(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid attempt id', data: null },
        { status: 400 }
      );
    }

    const data = await getQuizAttemptWithToken(token, id, locale);
    return academyOk(data, 'Attempt loaded');
  } catch (error) {
    return academyRouteError(error, '[academy/quiz/attempt/:id]');
  }
}
