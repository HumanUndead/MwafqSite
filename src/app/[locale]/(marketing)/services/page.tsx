import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, type Locale } from '@/i18n/config';
import { getDictionary } from '@/i18n/dictionaries';
import { buildPageMetadata } from '@/i18n/seo';
import { ROUTES } from '@/shared/constants/routes';
import { ServicesPage } from '@/modules/services';
import {
  emptyCatalogPage,
  listCatalogServiceGroups,
  listCatalogServices,
} from '@/modules/services/server/catalogService';
import type {
  CatalogKind,
  CatalogPage,
  CatalogService,
  CatalogServiceGroup,
} from '@/modules/services/types/catalog.types';
import { MarketingStickyHeaderOffset } from '@/shared/components/marketing';

const PAGE_SIZE = 12;

interface RouteProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    search?: string;
    page?: string;
    tab?: string;
    favorites?: string;
  }>;
}

export async function generateMetadata({
  params,
}: Pick<RouteProps, 'params'>): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const dict = await getDictionary(locale as Locale);
  return buildPageMetadata({
    locale: locale as Locale,
    route: ROUTES.SERVICES,
    title: dict.seo.services.title,
    description: dict.seo.services.description,
  });
}

export default async function ServicesRoute({
  params,
  searchParams,
}: RouteProps) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const query = await searchParams;

  const kind: CatalogKind = query.tab === 'groups' ? 'groups' : 'services';
  const favoritesOnly = query.favorites === '1';
  const search = query.search?.trim() ?? '';
  const pageNumber = Math.max(1, Number(query.page) || 1);

  let data: CatalogPage<CatalogService | CatalogServiceGroup> =
    emptyCatalogPage(PAGE_SIZE);
  let loadFailed = false;

  if (!favoritesOnly) {
    const listQuery = { pageNumber, pageSize: PAGE_SIZE, search };
    try {
      data =
        kind === 'services'
          ? await listCatalogServices(listQuery, locale)
          : await listCatalogServiceGroups(listQuery, locale);
    } catch {
      loadFailed = true;
    }
  }

  return (
    <MarketingStickyHeaderOffset variant='filter'>
      <ServicesPage
        kind={kind}
        favoritesOnly={favoritesOnly}
        search={search}
        items={data.data}
        page={data.pageNumber || pageNumber}
        totalPages={data.totalPages}
        totalRecords={data.totalRecords}
        loadFailed={loadFailed}
      />
    </MarketingStickyHeaderOffset>
  );
}
