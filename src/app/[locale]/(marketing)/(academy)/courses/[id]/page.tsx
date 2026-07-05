import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { localeToLangId } from '@/i18n/config';
import { GetLocale } from '@/i18n/server';
import { buildPageMetadata } from '@/i18n/seo';
import { ROUTES } from '@/shared/constants/routes';
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
import { SITE_URL } from '@/shared/constants/config';
import { JsonLd } from '@/shared/components/seo/JsonLd';

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) return {};

  const locale = await GetLocale();
  const courseView = await fetchCourseViewById(numericId);

  return buildPageMetadata({
    locale,
    route: `${ROUTES.COURSES}/${numericId}`,
    title: courseView.name,
    description: courseView.description || courseView.name,
  });
}

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
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Course',
          name: courseView.name,
          description: courseView.description || courseView.name,
          url: `${SITE_URL}/${locale}${ROUTES.COURSES}/${numericId}`,
          provider: {
            '@type': 'Organization',
            name: 'Mwafq',
            sameAs: SITE_URL,
          },
        }}
      />
      <CourseDetailsView
        locale={locale}
        langId={langId}
        course={course}
        lecturesDuration={lecturesDuration}
        lessons={lessons}
        paymentSettings={courseView.paymentSettings}
      />
    </MarketingStickyHeaderOffset>
  );
}
