import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations } from '@/i18n/server';
import { ReservationsView } from '@/modules/reservations';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('reservations');
  return { title: t.metaTitle };
}

export default function MyReservationsPage() {
  return (
    <Suspense>
      <ReservationsView />
    </Suspense>
  );
}
