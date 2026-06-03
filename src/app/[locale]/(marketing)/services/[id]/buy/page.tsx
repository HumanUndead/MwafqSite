import { Locale } from '@/i18n/config';
import { fetchServiceGroupById } from '@/modules/auth/server/ServiceGroupService';
import { ServiceGroupBuyPage } from '@/modules/services/ServiceGroupBuyPage';
import { MarketingStickyHeaderOffset } from '@/shared/components/marketing';

type PageProps = {
  params: Promise<{ id: string; locale: Locale }>;
};

export default async function ServiceGroupBuyRoute({ params }: PageProps) {
  const { id, locale } = await params;
  const numericId = +id;

  const serviceGroup = await fetchServiceGroupById(numericId, {
    isMandatoryTest: true,
    locale,
  });

  return (
    <MarketingStickyHeaderOffset variant='detailRoomy'>
      <ServiceGroupBuyPage serviceGroup={serviceGroup} />
    </MarketingStickyHeaderOffset>
  );
}
