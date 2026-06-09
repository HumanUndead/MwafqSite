import type { EnrolledCourseDetail } from './types/course.types';
import type {
  CourseData,
  CourseItem,
  CoursePlayerLesson,
  CourseSection,
} from './types/player.types';

const FALLBACK_IMAGE =
  'https://loremflickr.com/800/450/online,course,training/all?lock=academy-learn';

/** Format decimal hours into "2h 30m". */
export function formatTotalHours(decimalHours: number): string {
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);

  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h`;
  return `${minutes}m`;
}

/** Resolve a usable image URL from a comma-separated upstream path list. */
export function resolveCourseImage(path: string | undefined | null): string {
  if (!path) return FALLBACK_IMAGE;
  const first = path.split(',')[0].trim();
  if (first.startsWith('content/')) return FALLBACK_IMAGE;
  if (first.startsWith('/') || first.startsWith('http')) return first;
  return FALLBACK_IMAGE;
}

function splitCsv(value: string | undefined | null): string[] {
  if (!value || value.trim() === '') return [];
  return value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
}

/**
 * Transform the enrolled-course detail into the player UI view model:
 * an attachments section, lesson sections (lectures + lesson quizzes),
 * and course-level quiz/exam sections, all sorted by rank.
 */
export function transformCourseDetailToCourseData(
  courseDetail: EnrolledCourseDetail,
  courseId: string
): CourseData {
  const sections: CourseSection[] = [];

  // Course attachments section
  const attachmentPaths = splitCsv(courseDetail.fullAttachmentsPath);
  if (attachmentPaths.length > 0) {
    const items: CourseItem[] = attachmentPaths.map((path, index) => ({
      id: `attachment-${index}`,
      title: path.split('/').pop() || `attachment-${index + 1}`,
      type: 'attachment',
      isCompleted: false,
      rank: index,
      path,
    }));

    const attachmentsLesson: CoursePlayerLesson = {
      id: 'course-attachments',
      title: 'Course Attachments',
      items,
      rank: 0,
    };

    sections.push({ type: 'attachments', rank: 0, data: attachmentsLesson });
  }

  // Lesson sections (lectures + lesson-level quizzes)
  courseDetail.lessons.forEach((lesson) => {
    const items: CourseItem[] = [];

    lesson.lectures.forEach((lecture) => {
      items.push({
        id: `${lecture.id}`,
        title: lecture.name || 'N/A',
        type: 'lecture',
        duration: `${lecture.videoLengthInMinutes}`,
        isCompleted: lecture.isCompleted,
        rank: lecture.rank,
        isExtraLecture:
          lecture.introducedInVersion > courseDetail.userCourseVersion,
      });
    });

    lesson.quizzes.forEach((quiz) => {
      items.push({
        id: `${quiz.id}`,
        title: quiz.title || 'N/A',
        type: 'quiz',
        duration: `${quiz.timerMintues}`,
        isCompleted: quiz.isComplete === true,
        rank: 999,
        isExam: quiz.isExam,
        lessonId: `${lesson.id}`,
      });
    });

    sections.push({
      type: 'lesson',
      rank: lesson.rank,
      data: {
        id: `lesson-${lesson.id}`,
        title: lesson.name || 'N/A',
        items: items.sort((a, b) => a.rank - b.rank),
        rank: lesson.rank,
      },
    });
  });

  // Course-level quizzes / exams
  courseDetail.quizzes.forEach((quiz) => {
    const quizItem: CourseItem = {
      id: `${quiz.id}`,
      title: quiz.title || 'N/A',
      type: 'quiz',
      duration: `${quiz.timerMintues}`,
      isCompleted: quiz.isComplete === true,
      rank: quiz.lessonId || 999,
      isExam: quiz.isExam,
      lessonId: null,
    };

    sections.push({
      type: quiz.isExam ? 'exam' : 'quiz',
      rank: quiz.lessonId || 999,
      data: quizItem,
    });
  });

  sections.sort((a, b) => a.rank - b.rank);

  return {
    id: courseId,
    title: courseDetail.name,
    description: courseDetail.description,
    image: resolveCourseImage(courseDetail.fullAttachmentsPath),
    duration: formatTotalHours(courseDetail.totalHours),
    tags: splitCsv(courseDetail.tags),
    whatYouLearn: splitCsv(courseDetail.whatWeWillLearn),
    sections,
    currentProgress: courseDetail.courseProgressPercentage,
  };
}
