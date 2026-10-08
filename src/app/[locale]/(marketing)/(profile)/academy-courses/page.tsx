import { notFound } from 'next/navigation';
import { hasLocale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { AcademyScope } from '@/modules/academy/AcademyScope';
import { getAcademyLanguage } from '@/modules/academy/server/academyLanguage';
import { getFamilyErrorMessage } from '@/modules/family/familyError';
import { AcademyCoursesView } from '@/modules/profile-academy/AcademyCoursesView';
import { getMyCourses } from '@/modules/profile-academy/server/academyCoursesService';
import type { AcademyCourseRow } from '@/modules/profile-academy/types/academy.types';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ userId?: string }>;
};

export default async function AcademyCoursesPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const userId = (await searchParams).userId?.trim() || undefined;
  const language = await getAcademyLanguage(locale);

  let courses: AcademyCourseRow[] = [];
  let notice: string | undefined;
  if (!userId) {
    courses = await getMyCourses(language);
  } else {
    // Family member: blocked until the link is Accepted.
    try {
      courses = await getMyCourses(language, userId);
    } catch (error) {
      notice = getFamilyErrorMessage(error, (await getDictionary(locale)).family);
    }
  }

  return (
    <AcademyScope locale={locale}>
      <AcademyCoursesView courses={courses} notice={notice} />
    </AcademyScope>
  );
}
