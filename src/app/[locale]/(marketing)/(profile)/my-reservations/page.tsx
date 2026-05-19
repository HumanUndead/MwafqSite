import MyReservationsView from '@/modules/profile-reservations/MyReservationsView';
import { getMyReservations } from '@/modules/profile-reservations/server/reservationsService';
import type { TabValue } from '@/modules/profile-reservations/types';

type MyReservationsPageProps = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function MyReservationsPage({
  searchParams,
}: MyReservationsPageProps) {
  const { tab } = await searchParams;
  const reservations = await getMyReservations();
  const initialTab: TabValue = tab === 'results' ? 'results' : 'exams';

  return (
    <MyReservationsView reservations={reservations} initialTab={initialTab} />
  );
}
