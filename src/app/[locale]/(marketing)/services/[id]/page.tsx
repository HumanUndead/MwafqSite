import { notFound } from 'next/navigation';

import { localeToLangId } from '@/i18n/config';
import { GetLocale } from '@/i18n/server';
import { getCurrentUser } from '@/modules/auth/server/authSession';
import { ServiceGroupDetailsView } from '@/modules/services/ServiceGroupDetailsView';
import {
  fetchServiceGroupById,
  fetchServiceGroupsList,
} from '@/modules/auth/server/ServiceGroupService';
import { MarketingStickyHeaderOffset } from '@/shared/components/marketing';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function ServiceGroupDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId) || numericId <= 0) {
    notFound();
  }

  const [locale, serviceGroup, relatedList] = await Promise.all([
    GetLocale(),
    fetchServiceGroupById(numericId, { isMandatoryTest: true }),
    fetchServiceGroupsList({ pageNumber: 1, pageSize: 6 }),
  ]);

  const langId = localeToLangId[locale];
  const relatedPackages = relatedList.data
    .filter((pkg) => pkg.id !== numericId)
    .slice(0, 5);

  return (
    <MarketingStickyHeaderOffset variant='detail'>
      <ServiceGroupDetailsView
        locale={locale}
        langId={langId}
        serviceGroup={serviceGroup}
        relatedPackages={relatedPackages}
      />
    </MarketingStickyHeaderOffset>
  );
}
