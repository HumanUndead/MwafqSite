import type { CourseLesson } from '@/modules/auth/course.types';
import type { LectureListItem } from '@/modules/auth/lecture.types';
import { getTranslation } from '@/shared/lib/getTranslationName';

/**
 * Enriches `Course/View` lesson lectures with list API fields (attachments, etc.).
 */
export function mergeCourseLessonsWithLectures(
  lessons: readonly CourseLesson[],
  lectureListItems: readonly LectureListItem[],
  langId: number
): CourseLesson[] {
  const lectureById = new Map(
    lectureListItems.map((item) => [item.id, item] as const)
  );

  return lessons.map((lesson) => ({
    ...lesson,
    lectures: lesson.lectures.map((lecture) => {
      const listItem = lectureById.get(lecture.id);
      if (!listItem) {
        return { ...lecture, attachments: lecture.attachments ?? '' };
      }

      const translation = getTranslation(listItem.translations, langId);

      return {
        ...lecture,
        name: translation?.name?.trim() || lecture.name,
        attachments: translation?.attachments ?? '',
        videoLengthInMinutes:
          translation?.videoLengthInMinutes ?? lecture.videoLengthInMinutes,
        textContent: translation?.textContent ?? lecture.textContent,
      };
    }),
  }));
}

export function totalLecturesDurationMinutes(
  lessons: readonly CourseLesson[]
): number {
  return lessons.reduce(
    (lessonAcc, lesson) =>
      lessonAcc +
      lesson.lectures.reduce(
        (lectureAcc, lecture) =>
          lectureAcc + (lecture.videoLengthInMinutes ?? 0),
        0
      ),
    0
  );
}
