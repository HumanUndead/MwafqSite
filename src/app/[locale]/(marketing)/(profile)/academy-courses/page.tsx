import { notFound } from 'next/navigation';
import { hasLocale } from '@/i18n/config';
import { AcademyScope } from '@/modules/academy/AcademyScope';
import { getAcademyLanguage } from '@/modules/academy/server/academyLanguage';
import { AcademyCoursesView } from '@/modules/profile-academy/AcademyCoursesView';
import { getMyCourses } from '@/modules/profile-academy/server/academyCoursesService';

type PageProps = { params: Promise<{ locale: string }> };

export default async function AcademyCoursesPage({ params }: PageProps) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const courses = await getMyCourses(await getAcademyLanguage(locale));

  return (
    <AcademyScope locale={locale}>
      <AcademyCoursesView courses={courses} />
    </AcademyScope>
  );
}
