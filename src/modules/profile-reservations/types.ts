export type TabValue = 'exams' | 'results';

export type ExamStatus = 'new' | 'progress' | 'canceled';

export type ExamCardData = {
  id: string;
  title?: string;
  status: ExamStatus;
  hospital?: string;
  date?: string;
  time?: string;
  prepItems?: string[];
  cancelSlot: 'cancel' | 'hidden' | 'reorder';
};

export type ResultCardData = {
  id: string;
  title?: string;
  hospital?: string;
  date?: string;
  time?: string;
};
