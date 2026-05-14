import type { ExamStatus } from './types';

export function statusPillClass(status: ExamStatus): string {
  switch (status) {
    case 'canceled':
      return 'border-[#6b7196] bg-[rgba(107,113,150,0.12)] text-[#6b7196]';
    case 'progress':
      return 'border-[#0891b2] bg-[rgba(8,145,178,0.1)] text-[#0e7490]';
    default:
      return 'border-emerald-600 bg-emerald-50/90 text-emerald-900';
  }
}
