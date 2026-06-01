import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { fetchEnrolledCourseWithToken } from '@/modules/academy/server/courseDetailService';
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
    const userCourseId = Number(searchParams.get('userCourseId'));
    const courseId = Number(searchParams.get('courseId'));
    const locale = searchParams.get('locale') || 'en';

    if (!Number.isFinite(userCourseId) || !Number.isFinite(courseId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid course identifiers', data: null },
        { status: 400 }
      );
    }

    const data = await fetchEnrolledCourseWithToken(
      token,
      userCourseId,
      courseId,
      locale
    );

    return academyOk(data, 'Course loaded');
  } catch (error) {
    return academyRouteError(error, '[academy/course]');
  }
}
