import { fetchServiceGroupsList } from '@/modules/auth/server/ServiceGroupService';
import { getCurrentUser } from '@/modules/auth/server/authSession';
import { ServicesPage } from '@/modules/services';
import { MarketingStickyHeaderOffset } from '@/shared/components/marketing';

export default async function ServicesRoute({
  searchParams,
}: {
  searchParams: Promise<{ search: string; page: string }>;
}) {
  const { search, page } = await searchParams;

  const [data, user] = await Promise.all([
    fetchServiceGroupsList({ pageNumber: page ? +page : 1, pageSize: 10, search }),
    getCurrentUser(),
  ]);
  return (
    <MarketingStickyHeaderOffset variant='filter'>
      <ServicesPage
        services={data.data}
        page={data.pageNumber}
        totalPages={data.totalPages}
        isAuthenticated={user !== null}
      />
    </MarketingStickyHeaderOffset>
  );
}
