'use client';

import { useTranslations } from '@/i18n/DictionaryProvider';
import { Button } from '@/shared/components/ui/Button';

export function FamilyListSkeleton() {
  return (
    <ul className='flex flex-col gap-2' aria-hidden>
      {[0, 1, 2].map((key) => (
        <li key={key} className='h-[68px] animate-pulse rounded-[16px] bg-[#e5e7f0]' />
      ))}
    </ul>
  );
}

export function FamilyLoadError({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations('family');
  return (
    <div
      className='flex flex-col items-center gap-3 rounded-[20px] border-2 border-dashed border-red-200 bg-white px-6 py-10 text-center'
      role='alert'
    >
      <p className='text-sm font-semibold text-red-600'>{t.loadError}</p>
      <Button variant='outline' type='button' onClick={onRetry}>
        {t.retry}
      </Button>
    </div>
  );
}

export function FamilyEmpty({ label }: { label: string }) {
  return (
    <p className='rounded-[16px] border-2 border-dashed border-[#e5e7f0] bg-white px-4 py-6 text-center text-sm font-semibold text-[#6b7196]'>
      {label}
    </p>
  );
}
