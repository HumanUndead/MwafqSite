import type {
  PaginatedResponse,
  UpstreamApiResponse,
} from '@/shared/types/api.types';

/** Last lecture snapshot on an enrolled course. */
export interface AcademyCourseLastLecture {
  id: number;
  videoUrl: string;
  lessonId: number;
  rank: number;
  videoLengthInMinutes: number;
  textContent: string | null;
  fullAttachmentsPath: string;
  name: string;
  description: string;
}

/** Payment snapshot on an enrolled course. */
export interface AcademyCoursePayment {
  status: number;
  sellingPlan: number;
  selectedService: number | null;
  price: number;
  certifiedExamPrice: number;
  sadadPrice: number;
  transactionId: string | null;
  createdAt: string;
  paidAt: string | null;
}

/** Enrolled course from upstream `GET /api/Academy/UserServices/MyCourses`. */
export interface AcademyCourse {
  id: number;
  courseId: number;
  courseName: string;
  companyName?: string;
  courseDescription: string;
  fullAttachmentsPath: string;
  rank: number;
  status: boolean;
  isUserPassExam: boolean;
  isArkanBooked: boolean;
  sentLinkDate: string;
  progressPercent: number;
  isCourseCompleted: boolean;
  courseStartTime: string | null;
  courseCompleteTime: string | null;
  totalLectures: number;
  totalHours: number;
  invoiceId: string | null;
  lastLecture: AcademyCourseLastLecture | null;
  payment: AcademyCoursePayment | null;
  isLocked: boolean;
}

/** Paginated list inside `payload.value`. */
export type AcademyMyCoursesPage = PaginatedResponse<AcademyCourse>;

/** Full upstream MyCourses response body. */
export type AcademyMyCoursesResponse =
  UpstreamApiResponse<AcademyMyCoursesPage>;

/** Row shape used by `AcademyCoursesView` and the course-page ownership check. */
export interface AcademyCourseRow {
  id: string;
  title: string;
  description: string;
  /** Cover image URL, or null when the course has none. */
  image: string | null;
  progress: number;
  transitionDelay: number;
  /** User-course id. */
  enrollmentId: number;
  courseId: number;
  companyName?: string;
  isCourseCompleted: boolean;
  isLocked: boolean;
  totalLectures: number;
  totalHours: number;
  rank: number;
  lastLectureName: string | null;
  /** Payment still pending (`payment.status === 1`). */
  awaitingPayment: boolean;
  amountOwed: number;
}
