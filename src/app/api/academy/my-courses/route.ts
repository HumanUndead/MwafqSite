import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  AcademyCoursesError,
  fetchMyCourseRowsWithToken,
} from '@/modules/profile-academy/server/academyCoursesService';
import { resolveRequestBearerTokenFromCookieStore } from '@/modules/auth/server/resolveRequestBearerToken';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = resolveRequestBearerTokenFromCookieStore(request, (name) =>
      cookieStore.get(name)
    );

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Authentication required', data: null },
        { status: 401 }
      );
    }

    const courses = await fetchMyCourseRowsWithToken(token);

    return NextResponse.json({
      success: true,
      message: 'Courses loaded successfully',
      data: courses,
    });
  } catch (error) {
    if (error instanceof AcademyCoursesError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
          code: error.code,
          data: null,
        },
        {
          status:
            error.status >= 400 && error.status <= 599 ? error.status : 400,
        }
      );
    }

    console.error('[academy/my-courses] Request failed.', error);

    return NextResponse.json(
      { success: false, message: 'Internal server error', data: null },
      { status: 500 }
    );
  }
}
