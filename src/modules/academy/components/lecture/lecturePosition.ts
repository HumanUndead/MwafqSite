import type { CourseData, CoursePlayerLesson } from '../../types/player.types';

export interface LecturePosition {
  /** 1-based index among the lesson's lectures. */
  current: number;
  total: number;
  lessonTitle: string;
}

/** "Lecture n of m" inside the lesson that holds `lectureId`. */
export function getLecturePosition(
  courseData: CourseData | null,
  lectureId: number
): LecturePosition | null {
  if (!courseData) return null;
  const key = String(lectureId);
  for (const section of courseData.sections) {
    if (section.type !== 'lesson') continue;
    const lesson = section.data as CoursePlayerLesson;
    const lectures = [...lesson.items]
      .sort((a, b) => a.rank - b.rank)
      .filter((item) => item.type === 'lecture');
    const index = lectures.findIndex((item) => item.id === key);
    if (index !== -1) {
      return { current: index + 1, total: lectures.length, lessonTitle: lesson.title };
    }
  }
  return null;
}
