import MyReservationsView from '@/modules/profile-reservations/MyReservationsView';
import { getMyReservationsPage } from '@/modules/profile-reservations/server/reservationsService';
import type { TabValue } from '@/modules/profile-reservations/types';

type MyReservationsPageProps = {
  searchParams: Promise<{ tab?: string; page?: string }>;
};

export default async function MyReservationsPage({
  searchParams,
}: MyReservationsPageProps) {
  const { tab, page } = await searchParams;
  const pageNumber = page ? Math.max(1, Number(page) || 1) : 1;
  const data = await getMyReservationsPage({ pageNumber });
  const initialTab: TabValue = tab === 'results' ? 'results' : 'exams';

  return (
    <MyReservationsView
      reservations={data.data}
      page={data.pageNumber}
      totalPages={data.totalPages}
      initialTab={initialTab}
    />
  );
}
