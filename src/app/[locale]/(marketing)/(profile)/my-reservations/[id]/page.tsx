import type { Metadata } from 'next';
import { getTranslations } from '@/i18n/server';
import { ReservationDetailsView } from '@/modules/reservations';

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('reservations');
  return { title: t.details.metaTitle };
}

export default async function ReservationDetailsPage({ params }: PageProps) {
  const { id } = await params;
  return <ReservationDetailsView id={id} />;
}
