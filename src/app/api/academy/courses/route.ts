import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { getAcademyCulture } from '@/modules/academy/server/academyLanguage';
import { fetchCourseList } from '@/modules/auth/server/courseListService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const categoryId = searchParams.get('categoryId')
      ? Number(searchParams.get('categoryId'))
      : undefined;
    const keyword = searchParams.get('keyword') ?? undefined;
    const pageNumber = searchParams.get('pageNumber')
      ? Number(searchParams.get('pageNumber'))
      : 1;
    const pageSize = searchParams.get('pageSize')
      ? Number(searchParams.get('pageSize'))
      : 20;

    const featured = searchParams.get('featured') === 'true' || undefined;

    const data = await fetchCourseList({
      categoryId,
      featured,
      keyword,
      pageNumber,
      pageSize,
      culture: await getAcademyCulture(searchParams.get('locale')),
    });

    return NextResponse.json({ success: true, message: 'OK', data });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch courses', data: null },
      { status: 500 }
    );
  }
}
