import { notFound } from 'next/navigation';

import { localeToLangId } from '@/i18n/config';
import { GetLocale } from '@/i18n/server';
import { CourseDetailsView } from '@/modules/auth/CourseDetailsView';
import { fetchCourseById } from '@/modules/auth/server/courseByIdService';
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

  const [locale, course] = await Promise.all([
    GetLocale(),
    fetchCourseById(numericId),
  ]);
  const langId = localeToLangId[locale];

  return (
    <MarketingStickyHeaderOffset variant='detail'>
      <CourseDetailsView locale={locale} langId={langId} course={course} />
    </MarketingStickyHeaderOffset>
  );
}
