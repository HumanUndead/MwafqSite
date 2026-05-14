'use client';

import type { ResultCardData } from '../types';
import { ResultReservationCard } from './ResultReservationCard';

type ReservationsResultsPanelProps = {
  cards: ResultCardData[];
};

export function ReservationsResultsPanel({
  cards,
}: ReservationsResultsPanelProps) {
  return (
    <div className="grid grid-cols-3 gap-5 max-[900px]:grid-cols-2 max-[640px]:max-w-[520px] max-[640px]:grid-cols-1 max-[640px]:gap-5">
      {cards.map((card, i) => (
        <ResultReservationCard key={card.id} card={card} index={i} />
      ))}
    </div>
  );
}
