'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/shared/lib/cn';
import { ArrowIcon } from '@/shared/components/icons/home';

interface ServiceItem {
  id: number;
  href: string;
  title: string;
  description: string;
}

interface Props {
  services: ServiceItem[];
  rtl: boolean;
}

const EASE = 'ease-[cubic-bezier(0.22,1,0.36,1)]';

export function ServicesMobileCarousel({ services, rtl }: Props) {
  return (
    <div className='grid grid-cols-2 gap-3'>
      {services.map((service) => (
        <MobileCard key={service.id} {...service} rtl={rtl} />
      ))}
    </div>
  );
}

interface CardProps extends ServiceItem {
  rtl: boolean;
}

function MobileCard({ href, title, description, rtl }: CardProps) {
  const [active, setActive] = useState(false);

  return (
    <Link
      href={href}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onTouchStart={() => setActive(true)}
      onTouchEnd={() => setActive(false)}
      onTouchCancel={() => setActive(false)}
      className={cn(
        'group flex flex-col overflow-hidden rounded-[18px] border bg-white',
        'transition-all duration-300',
        EASE,
        active
          ? '-translate-y-1 border-[#00a8f1]/40 shadow-lg'
          : 'border-[#e5e7f0] shadow-sm'
      )}
    >
      {/* Gradient top stripe */}
      <div className='h-1 w-full flex-none bg-linear-to-r from-[#1e2364] to-[#00a8f1]' />

      <div className='flex flex-1 flex-col p-4'>
        <h3 className='text-[14px] font-bold leading-[1.3] tracking-[-0.2px] text-[#1e2364] line-clamp-2'>
          {title}
        </h3>

        <span className='mt-auto flex items-center justify-end pt-3'>
          <span
            className={cn(
              'inline-flex h-7 w-7 items-center justify-center rounded-full',
              'transition-colors duration-300',
              EASE,
              active ? 'bg-[#00a8f1] text-white' : 'bg-[#eef1f8] text-[#1e2364]'
            )}
          >
            <ArrowIcon className={cn('h-3.5 w-3.5', rtl && 'rotate-180')} />
          </span>
        </span>
      </div>
    </Link>
  );
}
