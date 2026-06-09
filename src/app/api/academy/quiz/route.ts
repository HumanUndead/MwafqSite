import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { fetchQuizWithToken } from '@/modules/academy/server/quizService';
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
    const id = Number(searchParams.get('id'));
    const locale = searchParams.get('locale') || 'en';

    if (!Number.isFinite(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid quiz id', data: null },
        { status: 400 }
      );
    }

    const data = await fetchQuizWithToken(token, id, locale);
    return academyOk(data, 'Quiz loaded');
  } catch (error) {
    return academyRouteError(error, '[academy/quiz]');
  }
}
