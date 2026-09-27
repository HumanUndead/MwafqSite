import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getAcademyCulture } from '@/modules/academy/server/academyLanguage';
import { getMyCourses } from '@/modules/profile-academy/server/academyCoursesService';
import { FetchResponseError } from '@/shared/lib/fetchWithErrorHandling.shared';

export async function GET(request: NextRequest) {
  try {
    const courses = await getMyCourses(
      await getAcademyCulture(request.nextUrl.searchParams.get('locale'))
    );

    return NextResponse.json({
      success: true,
      message: 'Courses loaded successfully',
      data: courses,
    });
  } catch (error) {
    if (error instanceof FetchResponseError) {
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

    return NextResponse.json(
      { success: false, message: 'Internal server error', data: null },
      { status: 500 }
    );
  }
}
