/** Lecture detail from `GET /api/Academy/Lecture/GetByUserId`. */

export interface LectureTranslation {
  id: number;
  langId: number;
  lectureId: number;
  name: string;
  description: string;
  videoLengthInMinutes: number;
  /** Comma-separated attachment paths. */
  attachments: string;
  textContent: string | null;
  /** Vimeo URL. */
  videoUrl: string;
}

export interface LectureDetail {
  id: number;
  lessonId: number;
  lessonName: string;
  rank: number;
  courseId: number;
  courseName: string;
  translations: LectureTranslation[];
  isCompleted: boolean | null;
}

export interface LectureDetailResponse {
  value: LectureDetail;
  isSuccess: boolean;
  isFailure: boolean;
  error: { code: string; message: string };
}

export interface SetProgressResponse {
  value: number;
  isSuccess: boolean;
  isFailure: boolean;
  error: { code: string; message: string };
}
