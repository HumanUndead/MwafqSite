import { http } from '@/shared/lib/http';
import type { EnrolledCourseDetail } from '../types/course.types';
import type {
  LectureDetail,
  SetProgressResponse,
} from '../types/lecture.types';
import type {
  PaymentInitData,
  StartPaymentPayload,
} from '../types/payment.types';
import type {
  QuizAttemptDetail,
  QuizData,
  UserQuizAttemptsValue,
} from '../types/quiz.types';

/** Client wrappers over the `/api/academy/*` proxy routes. */
export const academyLearnApi = {
  // ── Enroll + payment ──────────────────────────────────────────────
  enrollCourse(courseId: number, selectedService: number) {
    return http.post<{ userCourseId: number }>('/api/academy/enroll', {
      courseId,
      selectedService,
    });
  },

  startCreditCardPayment(payload: StartPaymentPayload) {
    return http.post<PaymentInitData>(
      '/api/academy/payment/credit-card',
      payload
    );
  },

  checkPaymentStatus(body: {
    pendingTransactionId: string;
    userId: string;
    paymentId: string;
  }) {
    return http.post<{ paid: boolean }>(
      '/api/academy/payment/check-status',
      body
    );
  },

  // ── Player ────────────────────────────────────────────────────────
  getCourseByUserId(userCourseId: number, courseId: number, locale: string) {
    return http.get<EnrolledCourseDetail>(
      `/api/academy/course?userCourseId=${userCourseId}&courseId=${courseId}&locale=${locale}`
    );
  },

  getLectureByUserId(id: number, userCourseId: number, locale: string) {
    return http.get<LectureDetail>(
      `/api/academy/lecture?id=${id}&userCourseId=${userCourseId}&locale=${locale}`
    );
  },

  setLectureProgress(lectureId: number, userCourseId: number) {
    return http.post<SetProgressResponse>(
      `/api/academy/lecture/progress?lectureId=${lectureId}&userCourseId=${userCourseId}`,
      {}
    );
  },

  // ── Quiz ──────────────────────────────────────────────────────────
  getQuiz(id: number, userCourseId: number, locale: string) {
    return http.get<QuizData>(
      `/api/academy/quiz?id=${id}&userCourseId=${userCourseId}&locale=${locale}`
    );
  },

  submitQuizAttempt(formData: FormData) {
    return http.post<{ attemptId: number }>(
      '/api/academy/quiz/attempt',
      formData
    );
  },

  listQuizAttempts(params: {
    userId: string;
    quizId: number;
    userCourseId: number;
    pageNumber?: number;
    pageSize?: number;
    lessonId?: string | null;
    locale: string;
  }) {
    const query = new URLSearchParams({
      userId: params.userId,
      quizId: String(params.quizId),
      userCourseId: String(params.userCourseId),
      pageNumber: String(params.pageNumber ?? 1),
      pageSize: String(params.pageSize ?? 8),
      locale: params.locale,
    });
    if (params.lessonId) query.set('lessonId', params.lessonId);
    return http.get<UserQuizAttemptsValue>(
      `/api/academy/quiz/attempts?${query.toString()}`
    );
  },

  getQuizAttempt(attemptId: number, locale: string) {
    return http.get<QuizAttemptDetail>(
      `/api/academy/quiz/attempt/${attemptId}?locale=${locale}`
    );
  },
};
