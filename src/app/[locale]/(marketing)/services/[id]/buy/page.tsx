import { fetchServiceGroupById } from '@/modules/auth/server/ServiceGroupService';
import { ServiceGroupBuyPage } from '@/modules/services/ServiceGroupBuyPage';
import { MarketingStickyHeaderOffset } from '@/shared/components/marketing';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ServiceGroupBuyRoute({ params }: PageProps) {
  const { id } = await params;
  const numericId = +id;

  const serviceGroup = await fetchServiceGroupById(numericId, {
    isMandatoryTest: true,
  });

  return (
    <MarketingStickyHeaderOffset variant='detailRoomy'>
      <ServiceGroupBuyPage serviceGroup={serviceGroup} />
    </MarketingStickyHeaderOffset>
  );
}
