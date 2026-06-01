/** UI view models for the course player (derived from EnrolledCourseDetail). */

export type CourseItemType = 'lecture' | 'quiz' | 'attachment';

export interface CourseItem {
  id: string;
  title: string;
  type: CourseItemType;
  /** Minutes, as a string, for display. */
  duration?: string;
  isCompleted: boolean;
  rank: number;
  isExam?: boolean;
  /** Quiz items: null for course-level, lesson id string for lesson quizzes. */
  lessonId?: string | null;
  /** Attachment items: the upstream path. */
  path?: string;
  /** Lecture added after enrollment — never locks / never blocks. */
  isExtraLecture?: boolean;
}

export interface CoursePlayerLesson {
  id: string;
  title: string;
  items: CourseItem[];
  rank: number;
}

export type CourseSectionType = 'lesson' | 'quiz' | 'exam' | 'attachments';

export interface CourseSection {
  type: CourseSectionType;
  rank: number;
  data: CoursePlayerLesson | CourseItem;
}

export interface CourseData {
  id: string;
  title: string;
  description: string;
  image: string;
  duration: string;
  tags: string[];
  whatYouLearn: string[];
  sections: CourseSection[];
  /** 0-100. */
  currentProgress: number;
}

/** A node in the flattened course navigation map (prev/next). */
export interface NavItem {
  id: number;
  type: 'lecture' | 'quiz';
}
