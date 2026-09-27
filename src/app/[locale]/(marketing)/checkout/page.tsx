import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations } from '@/i18n/server';
import { CheckoutPage } from '@/modules/checkout';
import { MarketingStickyHeaderOffset } from '@/shared/components/marketing';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('checkout');
  return { title: t.metaTitle, robots: { index: false, follow: false } };
}

export default function CheckoutRoute() {
  return (
    <MarketingStickyHeaderOffset variant='detail'>
      <Suspense>
        <CheckoutPage />
      </Suspense>
    </MarketingStickyHeaderOffset>
  );
}
