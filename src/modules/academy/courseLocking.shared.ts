import type {
  CourseData,
  CourseItem,
  CoursePlayerLesson,
} from './types/player.types';

/** Lessons (ordered, items sorted) used for sequential locking. */
function orderedLessons(
  sections: CourseData['sections']
): Array<{ lessonId: string; items: CourseItem[] }> {
  const result: Array<{ lessonId: string; items: CourseItem[] }> = [];
  sections.forEach((section) => {
    if (section.type === 'lesson') {
      const lesson = section.data as CoursePlayerLesson;
      result.push({
        lessonId: lesson.id,
        items: [...lesson.items].sort((a, b) => a.rank - b.rank),
      });
    }
  });
  return result;
}

/**
 * An item is locked until all required (non-extra) items in previous lessons
 * and all required earlier items in the same lesson are completed. Extra
 * lectures never lock and never block.
 */
export function isItemLocked(
  sections: CourseData['sections'],
  lessonId: string,
  itemIndex: number
): boolean {
  const lessons = orderedLessons(sections);
  const currentLessonIndex = lessons.findIndex((l) => l.lessonId === lessonId);
  if (currentLessonIndex === -1) return false;

  const currentItems = lessons[currentLessonIndex].items;
  if (currentItems[itemIndex]?.isExtraLecture) return false;

  for (let i = 0; i < currentLessonIndex; i++) {
    for (const item of lessons[i].items) {
      if (item.isExtraLecture) continue;
      if (!item.isCompleted) return true;
    }
  }

  for (let i = 0; i < itemIndex; i++) {
    if (currentItems[i].isExtraLecture) continue;
    if (!currentItems[i].isCompleted) return true;
  }

  return false;
}

/** Flatten all lesson/attachment/quiz items in display order. */
export function getAllCourseItems(
  sections: CourseData['sections']
): CourseItem[] {
  const items: CourseItem[] = [];
  sections.forEach((section) => {
    if (section.type === 'lesson' || section.type === 'attachments') {
      const lesson = section.data as CoursePlayerLesson;
      [...lesson.items]
        .sort((a, b) => a.rank - b.rank)
        .forEach((item) => items.push(item));
    } else if (section.type === 'quiz' || section.type === 'exam') {
      items.push(section.data as CourseItem);
    }
  });
  return items;
}

/**
 * Course-level quizzes lock until all earlier required content is done.
 * Exams lock until every required (non-extra) lecture is complete.
 */
export function isCourseQuizLocked(
  sections: CourseData['sections'],
  quizItem: CourseItem
): boolean {
  if (quizItem.isExam) {
    const lectures: CourseItem[] = [];
    sections.forEach((section) => {
      if (section.type === 'lesson') {
        const lesson = section.data as CoursePlayerLesson;
        lesson.items.forEach((item) => {
          if (item.type === 'lecture' && !item.isExtraLecture) {
            lectures.push(item);
          }
        });
      }
    });
    return !lectures.every((lecture) => lecture.isCompleted);
  }

  const allItems = getAllCourseItems(sections);
  const quizIndex = allItems.findIndex((item) => item.id === quizItem.id);
  if (quizIndex === -1) return false;

  for (let i = 0; i < quizIndex; i++) {
    if (allItems[i].isExtraLecture) continue;
    if (!allItems[i].isCompleted) return true;
  }

  return false;
}
