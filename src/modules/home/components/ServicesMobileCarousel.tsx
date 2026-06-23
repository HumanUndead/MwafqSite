'use client';

import { ServiceCard } from './ServiceCard';

interface ServiceItem {
  id: number;
  href: string;
  title: string;
  iconKey?: string | null;
  index?: number;
}

interface Props {
  services: ServiceItem[];
  rtl: boolean;
}

export function ServicesMobileCarousel({ services, rtl }: Props) {
  return (
    <div className='grid grid-cols-1 gap-4 min-[420px]:grid-cols-2'>
      {services.map((service) => (
        <ServiceCard
          key={service.id}
          href={service.href}
          title={service.title}
          iconKey={service.iconKey}
          rtl={rtl}
          index={service.index ?? 0}
          compact
        />
      ))}
    </div>
  );
}
