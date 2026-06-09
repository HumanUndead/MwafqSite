import type { EnrolledCourseDetail } from './types/course.types';
import type { NavItem } from './types/player.types';

/**
 * Build the course navigation string used for prev/next + auto-advance.
 *
 * Format: `lessonId:item,item-lessonId2:item+courseQuiz,courseQuiz`
 * - lessons separated by `-`, items within a lesson by `,`
 * - lectures are bare ids, quizzes are prefixed with `Q`
 * - course-level quizzes follow a `+` separator
 */
export function generateCourseNavigationMap(
  courseDetail: EnrolledCourseDetail
): string {
  const sections: string[] = [];

  [...courseDetail.lessons]
    .sort((a, b) => a.rank - b.rank)
    .forEach((lesson) => {
      const lessonItems: Array<{ id: number; rank: number; isQuiz: boolean }> =
        [];

      lesson.lectures.forEach((lecture) => {
        lessonItems.push({ id: lecture.id, rank: lecture.rank, isQuiz: false });
      });
      lesson.quizzes.forEach((quiz) => {
        lessonItems.push({ id: quiz.id, rank: 999, isQuiz: true });
      });

      lessonItems.sort((a, b) => a.rank - b.rank);

      const items = lessonItems.map((item) =>
        item.isQuiz ? `Q${item.id}` : `${item.id}`
      );

      if (items.length > 0) {
        sections.push(`${lesson.id}:${items.join(',')}`);
      }
    });

  const courseQuizzes = courseDetail.quizzes
    .filter((q) => q.lessonId === null)
    .sort((a, b) => (a.lessonId || 999) - (b.lessonId || 999))
    .map((q) => `Q${q.id}`);

  let navigationString = sections.join('-');
  if (courseQuizzes.length > 0) {
    navigationString += `+${courseQuizzes.join(',')}`;
  }
  return navigationString;
}

/** Parse a navigation string into a flat ordered list of items. */
export function parseCourseNavigationMap(navString: string): NavItem[] {
  if (!navString) return [];

  const [lessonsPart, courseQuizzesPart] = navString.split('+');
  const items: NavItem[] = [];

  if (lessonsPart) {
    lessonsPart.split('-').forEach((lessonChunk) => {
      const colonIndex = lessonChunk.indexOf(':');
      const itemsStr =
        colonIndex >= 0 ? lessonChunk.slice(colonIndex + 1) : lessonChunk;
      itemsStr
        .split(',')
        .map((token) => token.trim())
        .filter(Boolean)
        .forEach((token) => {
          if (token.startsWith('Q')) {
            items.push({ id: Number(token.slice(1)), type: 'quiz' });
          } else {
            items.push({ id: Number(token), type: 'lecture' });
          }
        });
    });
  }

  if (courseQuizzesPart) {
    courseQuizzesPart
      .split(',')
      .map((token) => token.trim())
      .filter(Boolean)
      .forEach((token) => {
        const id = token.startsWith('Q') ? token.slice(1) : token;
        items.push({ id: Number(id), type: 'quiz' });
      });
  }

  return items;
}

/** Find the previous/next nav items around the given item. */
export function findPrevNext(
  items: NavItem[],
  currentId: number,
  currentType: NavItem['type']
): { prev: NavItem | null; next: NavItem | null } {
  const index = items.findIndex(
    (item) => item.id === currentId && item.type === currentType
  );
  if (index === -1) return { prev: null, next: null };
  return {
    prev: index > 0 ? items[index - 1] : null,
    next: index < items.length - 1 ? items[index + 1] : null,
  };
}

const NAV_STORAGE_PREFIX = 'course-';

export function navStorageKey(courseId: number | string): string {
  return `${NAV_STORAGE_PREFIX}${courseId}`;
}
