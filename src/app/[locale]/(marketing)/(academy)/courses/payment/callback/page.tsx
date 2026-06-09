import { Suspense } from 'react';
import { PaymentCallbackView } from '@/modules/academy/components/PaymentCallbackView';
import { MarketingStickyHeaderOffset } from '@/shared/components/marketing';

export default function PaymentCallbackPage() {
  return (
    <MarketingStickyHeaderOffset variant='detail'>
      <Suspense fallback={null}>
        <PaymentCallbackView />
      </Suspense>
    </MarketingStickyHeaderOffset>
  );
}
