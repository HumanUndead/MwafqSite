import { notFound } from 'next/navigation';
import { hasLocale } from '@/i18n/config';
import { catalogName } from '@/modules/services/catalog.shared';
import { BookGroupRedirect } from '@/modules/services/components/catalog/BookGroupRedirect';
import { getCatalogServiceGroup } from '@/modules/services/server/catalogService';
import { MarketingStickyHeaderOffset } from '@/shared/components/marketing';

type PageProps = {
  params: Promise<{ id: string; locale: string }>;
};

export default async function ServiceGroupBuyRoute({ params }: PageProps) {
  const { id, locale } = await params;
  const groupId = Number(id);
  if (!hasLocale(locale) || !Number.isInteger(groupId) || groupId <= 0) {
    notFound();
  }

  const group = await getCatalogServiceGroup(groupId, locale).catch(() => null);
  if (!group) notFound();

  return (
    <MarketingStickyHeaderOffset variant='detailRoomy'>
      <BookGroupRedirect
        group={{
          id: group.id,
          name: catalogName(group.translations, locale),
          serviceCount: group.serviceGroupServices?.length ?? 0,
        }}
      />
    </MarketingStickyHeaderOffset>
  );
}
