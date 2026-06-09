import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { createUserCourseWithToken } from '@/modules/academy/server/enrollService';
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

    const body = await request.json();
    const courseId = Number(body?.courseId);
    const selectedService = Number(body?.selectedService ?? 0);

    if (!Number.isFinite(courseId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid courseId', data: null },
        { status: 400 }
      );
    }

    const userCourseId = await createUserCourseWithToken(
      token,
      courseId,
      selectedService
    );

    return academyOk({ userCourseId }, 'Enrolled');
  } catch (error) {
    return academyRouteError(error, '[academy/enroll]');
  }
}
