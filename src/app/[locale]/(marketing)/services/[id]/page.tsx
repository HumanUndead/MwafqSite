import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { localeToLangId } from '@/i18n/config';
import { GetLocale } from '@/i18n/server';
import { buildPageMetadata } from '@/i18n/seo';
import { ROUTES } from '@/shared/constants/routes';
import { getCurrentUser } from '@/modules/auth/server/authSession';
import { ServiceGroupDetailsView } from '@/modules/services/ServiceGroupDetailsView';
import {
  fetchServiceGroupById,
  fetchServiceGroupsList,
} from '@/modules/auth/server/ServiceGroupService';
import { MarketingStickyHeaderOffset } from '@/shared/components/marketing';
import { SITE_URL } from '@/shared/constants/config';
import { JsonLd } from '@/shared/components/seo/JsonLd';

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId) || numericId <= 0) return {};

  const locale = await GetLocale();
  const langId = localeToLangId[locale];
  const serviceGroup = await fetchServiceGroupById(numericId, {
    isMandatoryTest: true,
  });
  const translation =
    serviceGroup.translations.find((t) => t.langId === langId) ??
    serviceGroup.translations[0];
  if (!translation) return {};

  return buildPageMetadata({
    locale,
    route: `${ROUTES.SERVICES}/${numericId}`,
    title: translation.name,
    description: translation.description ?? translation.name,
  });
}

export default async function ServiceGroupDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId) || numericId <= 0) {
    notFound();
  }

  const [locale, serviceGroup, relatedList, currentUser] = await Promise.all([
    GetLocale(),
    fetchServiceGroupById(numericId, { isMandatoryTest: true }),
    fetchServiceGroupsList({ pageNumber: 1, pageSize: 6 }),
    getCurrentUser(),
  ]);

  const langId = localeToLangId[locale];
  const relatedPackages = relatedList.data
    .filter((pkg) => pkg.id !== numericId)
    .slice(0, 5);
  const translation =
    serviceGroup.translations.find((t) => t.langId === langId) ??
    serviceGroup.translations[0];

  return (
    <MarketingStickyHeaderOffset variant='detail'>
      {translation ? (
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'MedicalTest',
            name: translation.name,
            description: translation.description ?? translation.name,
            url: `${SITE_URL}/${locale}${ROUTES.SERVICES}/${numericId}`,
          }}
        />
      ) : null}
      <ServiceGroupDetailsView
        locale={locale}
        langId={langId}
        serviceGroup={serviceGroup}
        relatedPackages={relatedPackages}
        isAuthenticated={currentUser !== null}
      />
    </MarketingStickyHeaderOffset>
  );
}
