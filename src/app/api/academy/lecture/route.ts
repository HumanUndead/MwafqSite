import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { fetchLectureByUserIdWithToken } from '@/modules/academy/server/lectureService';
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
    const userCourseId = Number(searchParams.get('userCourseId'));
    const locale = searchParams.get('locale') || 'en';

    if (!Number.isFinite(id) || !Number.isFinite(userCourseId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid lecture identifiers', data: null },
        { status: 400 }
      );
    }

    const data = await fetchLectureByUserIdWithToken(
      token,
      id,
      userCourseId,
      locale
    );

    return academyOk(data, 'Lecture loaded');
  } catch (error) {
    return academyRouteError(error, '[academy/lecture]');
  }
}
