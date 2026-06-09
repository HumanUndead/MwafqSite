/**
 * Enrolled-course detail shapes from
 * `GET /api/Academy/Course/GetCourseByUserId` (the learning view).
 * Ported from the reference app's `CourseDetail` family.
 */

export interface EnrolledLecture {
  id: number;
  lessonId: number;
  videoUrl: string;
  rank: number;
  isCompleted: boolean;
  videoLengthInMinutes: number;
  textContent: string;
  attachments: string;
  fullAttachmentsPath: string;
  name: string | null;
  description: string | null;
  /** Lecture added after enrollment when `> userCourseVersion`. */
  introducedInVersion: number;
}

export interface EnrolledQuiz {
  id: number;
  timerMintues: number;
  isExam: boolean;
  courseId: number;
  /** null for course-level quizzes. */
  lessonId: number | null;
  title: string | null;
  description: string | null;
  /** true when completed, false/null otherwise. */
  isComplete: boolean | null;
}

export interface EnrolledLesson {
  id: number;
  courseId: number;
  rank: number;
  userProgress: number;
  name: string | null;
  description: string | null;
  lectures: EnrolledLecture[];
  quizzes: EnrolledQuiz[];
}

export interface EnrolledLastLecture {
  id: number;
  lessonId: number;
  videoUrl: string;
  rank: number;
  isCompleted: boolean;
  videoLengthInMinutes: number;
  textContent: string;
  attachments: string;
  fullAttachmentsPath: string;
  name: string | null;
  description: string | null;
}

export interface EnrolledCourseDetail {
  name: string;
  description: string;
  /** Comma-separated. */
  tags: string;
  /** Comma-separated. */
  whatWeWillLearn: string;
  rank: number;
  status: boolean;
  reviewText: string | null;
  isReviewActive: boolean;
  /** Comma-separated attachment paths. */
  fullAttachmentsPath: string;
  courseProgressPercentage: number;
  totalLectures: number;
  totalHours: number;
  userCourseVersion: number;
  lastLecture: EnrolledLastLecture | null;
  lessons: EnrolledLesson[];
  /** Course-level quizzes/exams. */
  quizzes: EnrolledQuiz[];
}

export interface EnrolledCourseDetailResponse {
  value: EnrolledCourseDetail;
  isSuccess: boolean;
  isFailure: boolean;
  error: { code: string; message: string };
}
