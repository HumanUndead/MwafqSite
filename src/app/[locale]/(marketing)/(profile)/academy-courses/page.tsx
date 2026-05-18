import { AcademyCoursesView } from '@/modules/profile-academy/AcademyCoursesView';
import { getMyCourses } from '@/modules/profile-academy/server/academyCoursesService';

export default async function AcademyCoursesPage() {
  const courses = await getMyCourses();

  return <AcademyCoursesView courses={courses} />;
}
