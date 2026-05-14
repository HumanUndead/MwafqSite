import dynamic from 'next/dynamic';

const MyReservationsView = dynamic(
  () => import('@/modules/profile-reservations/MyReservationsView'),
  {
    loading: () => (
      <div
        className="mx-auto min-h-[48vh] max-w-[1200px] animate-pulse rounded-2xl bg-[#eef0f7]/90"
        aria-hidden
      />
    ),
  }
);

export default function MyReservationsPage() {
  return <MyReservationsView />;
}
