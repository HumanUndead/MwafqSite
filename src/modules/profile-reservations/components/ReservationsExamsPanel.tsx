'use client';

import type { ExamCardData } from '../types';
import { ExamReservationCard } from './ExamReservationCard';

type ReservationsExamsPanelProps = {
  cards: ExamCardData[];
  chevronShift: number;
  emptyMessage?: string;
};

export function ReservationsExamsPanel({
  cards,
  chevronShift,
  emptyMessage,
}: ReservationsExamsPanelProps) {
  if (cards.length === 0) {
    return emptyMessage ? (
      <p className='py-12 text-center text-base font-medium text-[#6b7196]'>
        {emptyMessage}
      </p>
    ) : null;
  }

  return (
    <div className='grid grid-cols-3 gap-5 max-[900px]:grid-cols-2 max-[640px]:max-w-[520px] max-[640px]:grid-cols-1 max-[640px]:gap-5'>
      {cards.map((card, i) => (
        <ExamReservationCard
          key={card.id}
          card={card}
          index={i}
          chevronShift={chevronShift}
        />
      ))}
    </div>
  );
}
