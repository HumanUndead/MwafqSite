import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { setLectureProgressWithToken } from '@/modules/academy/server/lectureService';
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

    const { searchParams } = new URL(request.url);
    const lectureId = Number(searchParams.get('lectureId'));
    const userCourseId = Number(searchParams.get('userCourseId'));

    if (!Number.isFinite(lectureId) || !Number.isFinite(userCourseId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid identifiers', data: null },
        { status: 400 }
      );
    }

    const value = await setLectureProgressWithToken(
      token,
      lectureId,
      userCourseId
    );

    return academyOk({ value }, 'Progress saved');
  } catch (error) {
    return academyRouteError(error, '[academy/lecture/progress]');
  }
}
