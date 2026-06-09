/** Quiz domain shapes from the Academy quiz endpoints. */

export enum QuestionType {
  SingleChoice = 1,
  MultipleChoice = 2,
  Matching = 4,
  Video = 8,
  TrueOrFalse = 16,
}

export interface QuestionTranslation {
  id: number;
  langId: number;
  questionId: number;
  text: string;
  description: string;
}

export interface AnswerTranslation {
  id: number;
  answerId: number;
  langId: number;
  text: string;
}

export interface QuizAnswer {
  id: number;
  quizQuestionId: number;
  isCorrect: boolean;
  order: number;
  image: string | null;
  relatedToAnswerId: number | null;
  translations: AnswerTranslation[];
}

export interface QuizQuestion {
  id: number;
  type: QuestionType;
  videoUrl: string | null;
  quizId: number;
  translations: QuestionTranslation[];
  quizQuestionAnswers: QuizAnswer[];
  parentQuestionId: number | null;
  relatedQuizQuestions: QuizQuestion[] | null;
}

/** Quiz with questions (`GET /api/Academy/Quiz/GetByUserId`). */
export interface QuizData {
  id: number;
  title: string | null;
  description: string | null;
  timerMintues: number;
  /** Some upstream payloads spell it `timerMinutes`. */
  timerMinutes?: number;
  isExam: boolean;
  courseId: number;
  lessonId: number | null;
  questions: QuizQuestion[];
}

/** UI answer state for a single question while taking a quiz. */
export interface QuizAnswerState {
  questionId: number;
  /** Single choice / true-false. */
  selectedAnswerId: number | null;
  /** Multiple choice. */
  selectedAnswerIds: number[];
  /** Matching: left answer id -> right answer id. */
  matchedAnswers: Record<number, number>;
}

export interface QuizDataResponse {
  value: QuizData;
  isSuccess: boolean;
  isFailure: boolean;
  error: { code: string; message: string };
}

/** A single answer the user selected while taking a quiz. */
export interface UserAnswer {
  questionId: number;
  answerId: number;
  /** For matching questions: the answer this one was matched with. */
  matchedWithAnswerId?: number | null;
}

export interface UserQuizAnswerAttempt {
  id: number;
  attemptId: number;
  questionId: number;
  answerId: number;
  isCorrect: boolean;
}

export interface UserQuizAttempt {
  id?: number;
  attemptId?: number;
  attemptScore: number;
  startTime: string;
  endTime: string;
}

export interface UserQuizAttemptsValue {
  quizId?: number;
  quizName?: string;
  userId?: string;
  userName?: string;
  quizScore?: number;
  attemptsCount?: number;
  attempts?: UserQuizAttempt[];
  pageNumber?: number;
  pageSize?: number;
  totalRecords?: number;
  totalPages?: number;
  data?: UserQuizAttempt[];
}

export interface UserQuizAttemptsResponse {
  value: UserQuizAttemptsValue;
  isSuccess: boolean;
  isFailure: boolean;
  error: { code: string; message: string };
}

/** Full attempt detail (`GET /api/Academy/UserQuizAttempt/GetById`). */
export interface QuizAttemptDetail {
  id: number;
  userId: string;
  fullName: string;
  quizId: number;
  quizName: string;
  startTime: string;
  endTime: string;
  attemptScore: number;
  quizScore: number;
  qustions: QuizQuestion[];
  answers: UserQuizAnswerAttempt[];
}

export interface QuizAttemptDetailResponse {
  value: QuizAttemptDetail;
  isSuccess: boolean;
  isFailure: boolean;
  error: { code: string; message: string };
}

/** Result of a freshly submitted attempt, used to render the score screen. */
export interface AttemptResult {
  attemptId: number;
  answers: UserQuizAnswerAttempt[];
}
