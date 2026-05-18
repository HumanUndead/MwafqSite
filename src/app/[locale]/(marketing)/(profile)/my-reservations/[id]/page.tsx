import { notFound } from 'next/navigation';
import ReservationDetailsView from '@/modules/profile-reservations/ReservationDetailsView';
import { buildReservationDetailsViewModel } from '@/modules/profile-reservations/reservationDetailsMapper';
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

  if (!reservation) {
    notFound();
  }

  const details = buildReservationDetailsViewModel(reservation, { view });

  return <ReservationDetailsView details={details} />;
}
