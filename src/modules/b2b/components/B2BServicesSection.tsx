import type { Dictionary } from '@/locales/types';
import { B2BServicesCards } from './B2BServicesCards';

interface Props {
  content: Dictionary['b2b']['services'];
  isRtl: boolean;
}

export function B2BServicesSection({ content, isRtl }: Props) {
  return (
    <section id='services' className='relative bg-[#050B1A]'>
      <B2BServicesCards content={content} isRtl={isRtl} />
    </section>
  );
}
