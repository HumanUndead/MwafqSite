import { http } from '@/shared/lib/http';
import type {
  AcademyCourse,
  AcademyCourseRow,
  AcademyMyCoursesPage,
  AcademyMyCoursesResponse,
} from '../types/academy.types';

export const academyApi = {
  getMyCourses: () => http.get<AcademyCourseRow[]>('/api/academy/my-courses'),
};

export type {
  AcademyCourse,
  AcademyCourseRow,
  AcademyMyCoursesPage,
  AcademyMyCoursesResponse,
};
