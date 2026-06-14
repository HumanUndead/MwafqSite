import { MarketingStickyHeaderOffset } from '@/shared/components/marketing';
import { Spinner } from '@/shared/components/ui/Spinner';
import { MWAFQ_API_BASE_URL } from '@/shared/constants/config';

export default function ServicesLoading() {
  return (
    <MarketingStickyHeaderOffset
      variant='filter'
      className='flex min-h-[40vh] items-center justify-center'
    >
      <Spinner size='lg' />
    </MarketingStickyHeaderOffset>
  );
}
MWAFQ_API_BASE_URL