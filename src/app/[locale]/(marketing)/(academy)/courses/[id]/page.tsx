import { notFound } from 'next/navigation';

import { localeToLangId } from '@/i18n/config';
import { GetLocale } from '@/i18n/server';
import { CourseDetailsView } from '@/modules/auth/CourseDetailsView';
import {
  mergeCourseLessonsWithLectures,
  totalLecturesDurationMinutes,
} from '@/modules/auth/courseLessons.shared';
import {
  fetchCourseById,
  fetchCourseViewById,
} from '@/modules/auth/server/courseByIdService';
import { fetchLectureList } from '@/modules/auth/server/lectureListService';
import { MarketingStickyHeaderOffset } from '@/shared/components/marketing';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function CourseDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) {
    notFound();
  }

  const [locale, course, courseView] = await Promise.all([
    GetLocale(),
    fetchCourseById(numericId),
    fetchCourseViewById(numericId),
  ]);

  const langId = localeToLangId[locale];
  const lessonIds = courseView.lessons?.map((lesson) => lesson.id) ?? [];

  const lectureResponses = await Promise.all(
    lessonIds.map((lessonId) => fetchLectureList({ lessonId }))
  );
  const flatLectures = lectureResponses.flatMap((response) => response.data);

  const lessons = mergeCourseLessonsWithLectures(
    courseView.lessons ?? [],
    flatLectures,
    langId
  );
  const lecturesDuration = totalLecturesDurationMinutes(lessons);

  return (
    <MarketingStickyHeaderOffset variant='detail'>
      <CourseDetailsView
        locale={locale}
        langId={langId}
        course={course}
        lecturesDuration={lecturesDuration}
        lessons={lessons}
      />
    </MarketingStickyHeaderOffset>
  );
}
