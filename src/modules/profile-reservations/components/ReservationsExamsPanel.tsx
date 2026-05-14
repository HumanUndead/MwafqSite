'use client';

import type { ExamCardData } from '../types';
import { ExamReservationCard } from './ExamReservationCard';

type ReservationsExamsPanelProps = {
  cards: ExamCardData[];
  chevronShift: number;
};

export function ReservationsExamsPanel({
  cards,
  chevronShift,
}: ReservationsExamsPanelProps) {
  return (
    <div className="grid grid-cols-3 gap-5 max-[900px]:grid-cols-2 max-[640px]:max-w-[520px] max-[640px]:grid-cols-1 max-[640px]:gap-5">
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
