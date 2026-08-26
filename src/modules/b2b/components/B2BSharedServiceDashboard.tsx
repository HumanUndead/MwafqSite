'use client';

import { memo, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/shared/lib/cn';
import type { Dictionary } from '@/locales/types';
import type { B2BServiceItem } from './B2BServiceCapabilityCard';

const STATUS_STYLES: Record<string, string> = {
  done: 'bg-[#00dec9]/15 text-[#00897b]',
  active: 'bg-[#ff9800]/20 text-[#e65100]',
  wait: 'bg-[#78909c]/15 text-[#546e7a]',
};

interface Props {
  item: B2BServiceItem;
  dashboard: Dictionary['b2b']['services']['dashboard'];
}

export const B2BSharedServiceDashboard = memo(
  function B2BSharedServiceDashboard({ item, dashboard }: Props) {
    const prefersReducedMotion = useReducedMotion();
    const mock = item.dashboardMock;

    return (
      <div className='overflow-hidden rounded-[18px] border-2 border-[#1e2364] bg-white shadow-[0_20px_60px_rgba(30,35,100,0.12)]'>
        <div className='flex items-center gap-2 border-b-2 border-[#e5e7f0] bg-[#f4f4f6] px-3 py-2'>
          <div className='flex gap-1.5' aria-hidden='true'>
            <span className='size-2 rounded-full bg-[#c0c3d4]' />
            <span className='size-2 rounded-full bg-[#c0c3d4]' />
            <span className='size-2 rounded-full bg-[#c0c3d4]' />
          </div>
        </div>

        <div className='flex flex-col gap-3 p-3 sm:p-4'>
          <div className='relative min-h-[64px] overflow-hidden rounded-[12px] border border-[#00a8f1]/25 bg-[#00a8f1]/6 px-3 py-2'>
            <motion.div
              key={item.title}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className='block text-[9px] font-bold uppercase tracking-[0.5px] text-[#6b7196]'>
                {dashboard.viewingLabel}
              </span>
              <strong className='block text-[13px] font-extrabold text-[#1e2364] sm:text-[14px]'>
                {item.title}
              </strong>
              <span className='mt-0.5 block text-[10px] leading-[1.4] text-[#6b7196]'>
                {item.outcome}
              </span>
            </motion.div>
          </div>

          <div className='flex gap-0.5 rounded-full bg-[#f4f4f6] p-1'>
            <span className='flex-1 rounded-full bg-white py-1 text-center text-[10px] font-extrabold text-[#1e2364] shadow-sm'>
              {dashboard.tabOverview}
            </span>
            <span className='flex-1 py-1 text-center text-[10px] font-medium text-[#6b7196]'>
              {dashboard.tabEmployees}
            </span>
            <span className='flex-1 py-1 text-center text-[10px] font-medium text-[#6b7196]'>
              {dashboard.tabReports}
            </span>
          </div>

          <div className='grid grid-cols-3 gap-2'>
            <StatCard
              value={mock.stats.employees.value}
              label={dashboard.statEmployeesLabel}
              numColor='#1565c0'
              barColor='#1e88e5'
              bars={mock.stats.employees.bars}
            />
            <StatCard
              value={mock.stats.cleared.value}
              label={dashboard.statClearedLabel}
              numColor='#00897b'
              barColor='#00dec9'
              bars={mock.stats.cleared.bars}
            />
            <StatCard
              value={mock.stats.pending.value}
              label={dashboard.statPendingLabel}
              numColor='#e65100'
              barColor='#ff9800'
              bars={mock.stats.pending.bars}
            />
          </div>

          <ul
            className='flex flex-col gap-2'
            aria-label={dashboard.tabEmployees}
          >
            {mock.employees.map((employee, index) => (
              <li
                key={`${employee.name}-${index}`}
                className={cn(
                  'flex items-center gap-2.5 rounded-[14px] border px-3 py-2.5 transition-colors duration-150',
                  index === 0
                    ? 'border-[#00a8f1] bg-[#00a8f1]/6 shadow-[0_0_0_1px_rgba(0,168,241,0.15)]'
                    : 'border-[#e5e7f0] bg-white opacity-80'
                )}
              >
                <span
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-full text-[9.5px] font-extrabold',
                    index === 0
                      ? 'bg-[#1e2364] text-white'
                      : 'bg-[#f4f4f6] text-[#1e2364]'
                  )}
                >
                  {employee.initials}
                </span>
                <div className='min-w-0 flex-1'>
                  <strong className='block truncate text-[11px] font-extrabold leading-tight text-[#1e2364]'>
                    {employee.name}
                  </strong>
                  <span className='block truncate text-[9.5px] text-[#6b7196]'>
                    {employee.detail}
                  </span>
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.3px]',
                    STATUS_STYLES[employee.status] ?? STATUS_STYLES.wait
                  )}
                >
                  {employee.statusLabel}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
);

const StatCard = memo(function StatCard({
  value,
  label,
  numColor,
  barColor,
  bars,
}: {
  value: string;
  label: string;
  numColor: string;
  barColor: string;
  bars: readonly number[];
}) {
  const max = useMemo(() => Math.max(...bars), [bars]);

  return (
    <div className='rounded-[12px] border border-[#e5e7f0] p-2.5'>
      <p
        className='text-[18px] font-extrabold leading-none'
        style={{ color: numColor }}
      >
        {value}
      </p>
      <p className='mt-0.5 text-[9px] text-[#6b7196]'>{label}</p>
      <svg viewBox='0 0 64 20' className='mt-2 w-full' aria-hidden='true'>
        {bars.map((val, i) => {
          const h = Math.round((val / max) * 20);
          return (
            <rect
              key={i}
              x={i * 9 + 0.5}
              y={20 - h}
              width='7'
              height={h}
              rx='1.5'
              fill={barColor}
            />
          );
        })}
      </svg>
    </div>
  );
});
