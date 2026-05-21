import { notFound } from 'next/navigation';

import { fetchServiceGroupById } from '@/modules/auth/server/ServiceGroupService';
import { ServiceGroupBuyPage } from '@/modules/services/ServiceGroupBuyPage';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ServiceGroupBuyRoute({ params }: PageProps) {
  const { id } = await params;
  const numericId = Number(id);

  if (!Number.isFinite(numericId) || numericId <= 0) {
    notFound();
  }

  const serviceGroup = await fetchServiceGroupById(numericId);

  return <ServiceGroupBuyPage serviceGroup={serviceGroup} />;
}
