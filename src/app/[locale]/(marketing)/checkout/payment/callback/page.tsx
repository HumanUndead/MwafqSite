import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations } from '@/i18n/server';
import { CheckoutPaymentCallback } from '@/modules/checkout';
import { MarketingStickyHeaderOffset } from '@/shared/components/marketing';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('payment');
  return { title: t.status.metaTitle, robots: { index: false, follow: false } };
}

export default function CheckoutPaymentCallbackRoute() {
  return (
    <MarketingStickyHeaderOffset variant='detail'>
      <Suspense>
        <CheckoutPaymentCallback />
      </Suspense>
    </MarketingStickyHeaderOffset>
  );
}
