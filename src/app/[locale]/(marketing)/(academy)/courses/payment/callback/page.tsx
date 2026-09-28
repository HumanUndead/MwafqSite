import { Suspense } from 'react';
import { PaymentCallbackView } from '@/modules/academy/components/PaymentCallbackView';
import { MarketingStickyHeaderOffset } from '@/shared/components/marketing';

export default function PaymentCallbackPage() {
  return (
    // Inset navy stage sits just below the transparent floating header.
    <MarketingStickyHeaderOffset
      variant='academy'
    >
      <Suspense fallback={null}>
        <PaymentCallbackView />
      </Suspense>
    </MarketingStickyHeaderOffset>
  );
}
