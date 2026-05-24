import { notFound } from 'next/navigation';

import { localeToLangId } from '@/i18n/config';
import { GetLocale } from '@/i18n/server';
import { CourseDetailsView } from '@/modules/auth/CourseDetailsView';
import { fetchCourseById, fetchCourseViewById } from '@/modules/auth/server/courseByIdService';
import { fetchLectureList } from '@/modules/auth/server/lectureListService';

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
  const lessonIds = courseView.lessons?.map((lesson) => lesson.id);
  const lectures = await Promise.all(lessonIds?.map((lessonId) => fetchLectureList({ lessonId })));
  const flatLectures = lectures.flatMap((lecture) => lecture.data);
  const langId = localeToLangId[locale];

  return <CourseDetailsView locale={locale} langId={langId} course={course} />;
}
