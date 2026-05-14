import type { ExamCardData, ResultCardData } from './types';

export const EASE = [0.22, 1, 0.36, 1] as const;
export const EASE_BOUNCE = [0.34, 1.56, 0.64, 1] as const;

export const examCards: ExamCardData[] = [
  {
    id: 'exam-1',
    title: 'Driving License Exam',
    status: 'new',
    hospital: 'King Fahd Hospital — Ryidah',
    date: '2026-03-12',
    time: '09:00 AM',
    prepItems: ['Fasting required 12 hours prior', 'Bring valid ID'],
    cancelSlot: 'cancel',
  },
  {
    id: 'exam-2',
    title: 'Driving License Exam',
    status: 'progress',
    hospital: 'King Fahd Hospital — Ryidah',
    date: '2026-03-10',
    time: '11:00 AM',
    prepItems: ['Fasting required 12 hours prior', 'Bring valid ID'],
    cancelSlot: 'hidden',
  },
  {
    id: 'exam-3',
    title: 'Driving License Exam',
    status: 'canceled',
    hospital: 'King Fahd Hospital — Ryidah',
    date: '2026-03-15',
    time: '02:30 PM',
    prepItems: ['Fasting required 12 hours prior', 'Bring valid ID'],
    cancelSlot: 'reorder',
  },
];

export const resultCards: ResultCardData[] = [
  {
    id: 'res-1',
    title: 'Driving License Result',
    hospital: 'King Fahd Hospital — Ryidah',
    date: '2026-03-12',
    time: '09:00 AM',
  },
  {
    id: 'res-2',
    title: 'Driving License Result',
    hospital: 'King Fahd Hospital — Ryidah',
    date: '2026-03-15',
    time: '02:30 PM',
  },
  {
    id: 'res-3',
    title: 'Driving License Result',
    hospital: 'King Fahd Hospital — Ryidah',
    date: '2026-03-10',
    time: '11:00 AM',
  },
];
