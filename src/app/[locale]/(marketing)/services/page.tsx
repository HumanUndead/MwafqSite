import { fetchServiceGroupsList } from '@/modules/auth/server/ServiceGroupService';
import { ServicesPage } from '@/modules/services';
import { MarketingStickyHeaderOffset } from '@/shared/components/marketing';

export default async function ServicesRoute({
  searchParams,
}: {
  searchParams: Promise<{ search: string; page: string }>;
}) {
  const { search, page } = await searchParams;

  const data = await fetchServiceGroupsList({
    pageNumber: page ? +page : 1,
    pageSize: 10,
    search,
  });

  return (
    <MarketingStickyHeaderOffset variant='filter'>
      <ServicesPage
        services={data.data}
        page={data.pageNumber}
        totalPages={data.totalPages}
      />
    </MarketingStickyHeaderOffset>
  );
}
