export interface LectureListTranslation {
  id: number;
  langId: number;
  lectureId: number;
  name: string;
  videoLengthInMinutes: number;
  description: string | null;
  attachments: string;
  textContent: string | null;
  videoUrl: string;
}

export interface LectureListItem {
  id: number;
  lessonId: number;
  lessonName: string;
  rank: number;
  courseId: number;
  courseName: string;
  translations: LectureListTranslation[];
  isCompleted: boolean | null;
}
