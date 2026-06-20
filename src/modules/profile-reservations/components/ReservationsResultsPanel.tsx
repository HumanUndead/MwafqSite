'use client';

import type { ResultCardData } from '../types';
import { ResultReservationCard } from './ResultReservationCard';

type ReservationsResultsPanelProps = {
  cards: ResultCardData[];
  emptyMessage?: string;
};

export function ReservationsResultsPanel({
  cards,
  emptyMessage,
}: ReservationsResultsPanelProps) {
  if (cards.length === 0) {
    return emptyMessage ? (
      <p className='py-12 text-center text-base font-medium text-[#6b7196]'>
        {emptyMessage}
      </p>
    ) : null;
  }

  return (
    <div className='grid grid-cols-3 gap-5 max-[900px]:grid-cols-2 max-[640px]:max-w-130 max-[640px]:grid-cols-1 max-[640px]:gap-5'>
      {cards.map((card, i) => (
        <ResultReservationCard key={card.id} card={card} index={i} />
      ))}
    </div>
  );
}
