'use client';

import Link from 'next/link';
import { motion, useInView, useReducedMotion, type Easing } from 'framer-motion';
import { useRef } from 'react';

import { ArrowIcon } from '@/shared/components/icons/home';
import { CardCornerAccent } from '@/shared/components/ui/CardCornerAccent';
import { cn } from '@/shared/lib/cn';

const luxuryEase: Easing = [0.16, 1, 0.3, 1];
const wipeEase: Easing = [0.77, 0, 0.175, 1];
const STAGGER = 0.1;

export interface ServiceScrollItem {
  id: number;
  href: string;
  title: string;
}

interface Props {
  services: ServiceScrollItem[];
  rtl: boolean;
}

function clipHidden(fromEnd: boolean, rtl: boolean) {
  const revealFromEnd = rtl ? !fromEnd : fromEnd;
  return revealFromEnd ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)';
}

function ServiceScrollCard({
  service,
  index,
  rtl,
  active,
  instant,
}: {
  service: ServiceScrollItem;
  index: number;
  rtl: boolean;
  active: boolean;
  instant: boolean;
}) {
  const fromEnd = index % 2 === 1;
  const base = instant ? 0 : index * STAGGER;

  const shellHidden = {
    clipPath: clipHidden(fromEnd, rtl),
    opacity: 0,
    x: fromEnd ? 22 : -22,
  };
  const shellVisible = {
    clipPath: 'inset(0 0 0 0)',
    opacity: 1,
    x: 0,
  };

  return (
    <Link
      href={service.href}
      className={cn(
        'group block w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e2364] focus-visible:ring-offset-2'
      )}
    >
      <motion.div
        className={cn(
          'relative flex w-full items-center gap-4 overflow-hidden border-[2px] border-[#e5e7f0] bg-white',
          'rounded-[4px_20px_4px_20px] px-5 py-4.5 sm:px-6 sm:py-5',
          rtl && 'rounded-[20px_4px_20px_4px]',
          'before:absolute before:top-0 before:start-0 before:end-0 before:h-[2px]',
          'before:origin-start before:scale-x-0 before:bg-[#00a8f1]',
          'before:transition-transform before:duration-700 before:ease-[cubic-bezier(0.16,1,0.3,1)] before:content-[""]',
          'group-hover:before:scale-x-100',
          'after:absolute after:top-5 after:bottom-0 after:start-0 after:w-[2px]',
          'after:origin-top after:scale-y-0 after:bg-[#00a8f1]',
          'after:transition-transform after:duration-700 after:ease-[cubic-bezier(0.16,1,0.3,1)] after:content-[""]',
          'group-hover:after:scale-y-100',
          'transition-[background-color,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
          'group-hover:border-[#c8cde0] group-hover:bg-[#fbfcff] group-hover:shadow-[0_12px_40px_rgba(30,35,100,0.07)]'
        )}
        initial={shellHidden}
        animate={active ? shellVisible : shellHidden}
        transition={{
          clipPath: { duration: instant ? 0 : 0.9, ease: wipeEase, delay: base },
          opacity: { duration: instant ? 0 : 0.4, ease: luxuryEase, delay: base },
          x: instant
            ? { duration: 0 }
            : {
                type: 'spring',
                stiffness: 76,
                damping: 21,
                mass: 0.9,
                delay: base,
              },
        }}
      >
        <CardCornerAccent rtl={rtl} variant='hairline' />

        <motion.div
          aria-hidden='true'
          className='pointer-events-none absolute inset-0 z-20 skew-x-[-18deg] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.6),transparent)]'
          initial={{ x: '-130%', opacity: 0 }}
          animate={
            active ? { x: '130%', opacity: [0, 0.5, 0] } : { x: '-130%', opacity: 0 }
          }
          transition={{ duration: instant ? 0 : 0.95, ease: luxuryEase, delay: base + (instant ? 0 : 0.36) }}
        />

        <span className='z-10 min-w-0 flex-1 overflow-hidden ps-1'>
          <motion.span
            className='block truncate text-[15.5px] font-extrabold leading-snug tracking-[-0.3px] text-[#1e2364] sm:text-[16.5px]'
            initial={{ y: '115%', opacity: 0 }}
            animate={active ? { y: 0, opacity: 1 } : { y: '115%', opacity: 0 }}
            transition={{ duration: instant ? 0 : 0.68, ease: luxuryEase, delay: base + (instant ? 0 : 0.22) }}
          >
            {service.title}
          </motion.span>
        </span>

        <motion.div
          className={cn(
            'z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-[2px] border-[#e5e7f0] text-[#1e2364]',
            'transition-[border-color,background-color,color,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
            'group-hover:border-[#00a8f1] group-hover:bg-[#00a8f1] group-hover:text-white',
            rtl ? 'group-hover:-translate-x-0.5' : 'group-hover:translate-x-0.5'
          )}
          initial={{ scale: 0, opacity: 0, rotate: -28 }}
          animate={
            active ? { scale: 1, opacity: 1, rotate: 0 } : { scale: 0, opacity: 0, rotate: -28 }
          }
          transition={
            instant
              ? { duration: 0 }
              : { type: 'spring', stiffness: 115, damping: 15, delay: base + 0.34 }
          }
        >
          <ArrowIcon className={cn('size-3.5', rtl && 'rotate-180')} />
        </motion.div>
      </motion.div>
    </Link>
  );
}

export function ServicesScrollList({ services, rtl }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, {
    once: true,
    amount: 0.18,
    margin: '0px 0px -100px 0px',
  });
  const reducedMotion = useReducedMotion();
  const active = reducedMotion || inView;

  return (
    <div
      ref={ref}
      className='mx-auto grid w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4'
    >
      {services.map((service, index) => (
        <ServiceScrollCard
          key={service.id}
          service={service}
          index={index}
          rtl={rtl}
          active={active}
          instant={!!reducedMotion}
        />
      ))}
    </div>
  );
}
