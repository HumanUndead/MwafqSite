import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

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

    const data = await fetchCourseList({
      categoryId,
      keyword,
      pageNumber,
      pageSize,
    });

    return NextResponse.json({ success: true, message: 'OK', data });
  } catch (error) {
    console.error('[academy/courses] Request failed.', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch courses', data: null },
      { status: 500 }
    );
  }
}
