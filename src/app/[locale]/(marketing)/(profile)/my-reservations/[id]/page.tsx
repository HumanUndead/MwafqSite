import ReservationDetailsView from '@/modules/profile-reservations/ReservationDetailsView';
import { buildReservationDetailsViewModelFromPublic } from '@/modules/profile-reservations/reservationDetailsMapper';
import { getReservationById } from '@/modules/profile-reservations/server/reservationsService';

type ReservationDetailsPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ view?: string }>;
};

export default async function ReservationDetailsPage({
  params,
  searchParams,
}: ReservationDetailsPageProps) {
  const { id } = await params;
  const { view } = await searchParams;
  const reservation = await getReservationById(id);
  const details = buildReservationDetailsViewModelFromPublic(id, reservation, {
    view,
  });

  return <ReservationDetailsView details={details} />;
}
