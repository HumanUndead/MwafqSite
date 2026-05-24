import {
  PaginatedResponse,
  UpstreamApiResponse,
} from '@/shared/types/api.types';

export interface CourseListTranslation {
  langId: number;
  name: string;
  description: string;
  tags: string;
  whatYouWillLearn: string;
}

export interface CourseLessonLecture {
  id: number;
  lessonId: number;
  rank: number;
  videoLengthInMinutes: number;
  textContent: string | null;
  name: string;
  description: string | null;
}

/** Quiz on a course lesson; extend when upstream shape is known. */
export interface CourseLessonQuiz {}

export interface CourseLesson {
  id: number;
  courseId: number;
  rank: number;
  name: string;
  description: string;
  lectures: CourseLessonLecture[];
  quizzes: CourseLessonQuiz[];
}

export interface CourseListItem {
  id: number;
  rank: number;
  status: boolean;
  isFeatured: boolean;
  categoryId: number;
  categoryName: string;
  target: string;
  fullImagePath: string;
  translations: CourseListTranslation[];
  lessons: CourseLesson[];
}

export interface CourseListResponse extends UpstreamApiResponse<
  PaginatedResponse<CourseListItem>
> {}

export interface CourseViewPaymentSettings {
  id: number;
  courseId: number;
  sellingPlan: number;
  price: number;
  certifiedExamPrice: number;
  sadadPrice: number;
}

/** Course-level quiz from `GET /api/Academy/Course/View`; extend when shape is known. */
export interface CourseViewQuiz {}

/** Localized course detail from `GET /api/Academy/Course/View`. */
export interface CourseViewItem {
  name: string;
  description: string;
  tags: string;
  whatWeWillLearn: string;
  reviewText: string | null;
  isReviewActive: boolean;
  rank: number;
  status: boolean;
  totalLectures: number;
  totalHours: number;
  lessons: CourseLesson[];
  quizzes: CourseViewQuiz[];
  paymentSettings: CourseViewPaymentSettings | null;
}

export type CourseViewResponse = UpstreamApiResponse<CourseViewItem>;
