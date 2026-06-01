import type { EntityTranslation } from '@/shared/types/entity-translation.types';

export interface LectureListTranslation extends EntityTranslation {
  lectureId: number;
  videoLengthInMinutes: number;
  attachments: string;
  textContent: string | null;
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
