'use client';

import { FileCheck2 } from 'lucide-react';

import type { ServiceGroupDetail } from '@/modules/auth/serviceGroup.types';

type ExaminationsStepProps = {
  serviceGroup: ServiceGroupDetail;
  noExamsMessage: string;
};

export function ExaminationsStep({
  serviceGroup,
  noExamsMessage,
}: ExaminationsStepProps) {
  const exams = serviceGroup.serviceGroupServices;

  if (!exams.length) {
    return (
      <p className='mb-6 text-[14.5px] text-[#6b7196]'>{noExamsMessage}</p>
    );
  }

  return (
    <ul className='mb-6 grid list-none grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-x-[18px] sm:gap-y-3.5'>
      {exams.map((link) => (
        <li
          key={link.id}
          className='flex items-center gap-3.5 rounded-xl border border-[#e5e7f0] bg-[#f5f8ff] px-[18px] py-4'
        >
          <span
            className='inline-flex size-9 shrink-0 items-center justify-center text-[#00a8f1]'
            aria-hidden
          >
            <FileCheck2 className='size-7' strokeWidth={1.8} />
          </span>
          <span className='text-[15px] font-bold leading-snug text-[#1e2364]'>
            {link.serviceName}
          </span>
        </li>
      ))}
    </ul>
  );
}
