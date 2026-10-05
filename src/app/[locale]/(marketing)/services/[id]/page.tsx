import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { localeToLangId } from '@/i18n/config';
import { GetLocale } from '@/i18n/server';
import { buildPageMetadata } from '@/i18n/seo';
import { ROUTES } from '@/shared/constants/routes';
import { fetchServiceGroupById } from '@/modules/auth/server/ServiceGroupService';
import { ServiceGroupDetailsView } from '@/modules/services/ServiceGroupDetailsView';
import { FetchResponseError } from '@/shared/lib/fetchWithErrorHandling.shared';
import { MarketingStickyHeaderOffset } from '@/shared/components/marketing';
import { SITE_URL } from '@/shared/constants/config';
import { JsonLd } from '@/shared/components/seo/JsonLd';
import { stripHtmlToNull } from '@/shared/lib/text';

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
  const service = await fetchServiceGroupById(numericId, { locale }).catch(
    (error) => {
      console.error(`[services/${numericId}] fetch failed:`, error);
      if (error instanceof FetchResponseError) notFound();
      throw error;
    }
  );
  const translation =
    service.translations.find((t) => t.langId === langId) ??
    service.translations[0];
  if (!translation) notFound();

  return buildPageMetadata({
    locale,
    route: `${ROUTES.SERVICES}/${numericId}`,
    title: translation.name,
    description: stripHtmlToNull(translation.description) ?? translation.name,
  });
}

export default async function ServiceGroupDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId) || numericId <= 0) {
    notFound();
  }

  const locale = await GetLocale();
  const service = await fetchServiceGroupById(numericId, { locale }).catch(
    (error) => {
      console.error(`[services/${numericId}] fetch failed:`, error);
      if (error instanceof FetchResponseError) notFound();
      throw error;
    }
  );

  const langId = localeToLangId[locale];
  const translation =
    service.translations.find((t) => t.langId === langId) ??
    service.translations[0];

  if (!translation) {
    notFound();
  }

  return (
    <MarketingStickyHeaderOffset variant='detail'>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'MedicalTest',
          name: translation.name,
          description:
            stripHtmlToNull(translation.description) ?? translation.name,
          url: `${SITE_URL}/${locale}${ROUTES.SERVICES}/${numericId}`,
        }}
      />
      <ServiceGroupDetailsView
        locale={locale}
        langId={langId}
        service={service}
      />
    </MarketingStickyHeaderOffset>
  );
}
