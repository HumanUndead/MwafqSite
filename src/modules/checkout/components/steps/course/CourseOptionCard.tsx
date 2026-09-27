'use client';

import { CheckCircle2, Circle, Lock } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslations } from '@/i18n/DictionaryProvider';
import { SarAmount } from '@/shared/components/ui/SarAmount';
import { cn } from '@/shared/lib/cn';
import {
  CourseSellingPlan,
  coursePlanTotal,
  resolveSellingPlan,
  type CourseAddOns,
} from '@/shared/lib/coursePlan.shared';
import { ImageSize, MEDIA_FALLBACK_IMAGE, imageUrl } from '@/shared/lib/media';
import type { CheckoutCourse } from '../../../types/checkout.types';

interface CourseOptionCardProps {
  course: CheckoutCourse;
  name: string;
  selected: boolean;
  addOns: CourseAddOns;
  onToggle: () => void;
  onAddOnsChange: (addOns: CourseAddOns) => void;
}

function PlanLine({
  label,
  amount,
  trailing,
}: {
  label: string;
  amount: number;
  trailing?: React.ReactNode;
}) {
  return (
    <div className='flex items-center justify-between gap-3 rounded-[12px] bg-[#f3f4f8] px-3 py-2.5 text-sm font-semibold text-[#1e2364]'>
      <span className='flex items-center gap-2'>
        {trailing}
        {label}
      </span>
      <SarAmount amount={amount} />
    </div>
  );
}

export function CourseOptionCard({
  course,
  name,
  selected,
  addOns,
  onToggle,
  onAddOnsChange,
}: CourseOptionCardProps) {
  const t = useTranslations('checkout');
  const [imageFailed, setImageFailed] = useState(false);
  const pricing = course.paymentSettings;
  const plan = resolveSellingPlan(pricing);
  const total = coursePlanTotal(pricing, addOns);
  const src =
    course.fullImagePath && !imageFailed
      ? imageUrl(course.fullImagePath, ImageSize.card)
      : MEDIA_FALLBACK_IMAGE;

  return (
    <li
      className={cn(
        'overflow-hidden rounded-[20px] border-2 bg-white transition-colors',
        selected ? 'border-[#00a8f1]' : 'border-[#e5e7f0]'
      )}
    >
      <button
        type='button'
        role='radio'
        aria-checked={selected}
        onClick={onToggle}
        className='flex w-full cursor-pointer items-center gap-3 p-4 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e2364]'
      >
        <span className='relative size-16 shrink-0 overflow-hidden rounded-[14px] bg-[#f3f4f8]'>
          <Image
            src={src}
            alt=''
            fill
            sizes='64px'
            className='object-contain p-1.5'
            onError={() => setImageFailed(true)}
          />
        </span>
        <span className='min-w-0 flex-1'>
          <span className='block text-[15px] font-extrabold text-[#1e2364]'>{name}</span>
          {course.categoryName && (
            <span className='text-xs text-[#6b7196]'>{course.categoryName}</span>
          )}
        </span>
        <span className='flex shrink-0 flex-col items-end gap-1.5'>
          {selected ? (
            <CheckCircle2 className='size-5 text-[#00a8f1]' aria-hidden />
          ) : (
            <Circle className='size-5 text-[#c7cbe0]' aria-hidden />
          )}
          {(pricing?.price ?? 0) > 0 ? (
            <SarAmount amount={pricing?.price} className='text-sm font-extrabold text-[#1e2364]' />
          ) : (
            <span className='text-sm font-bold text-green-600'>{t.course.free}</span>
          )}
        </span>
      </button>

      {selected && pricing && (
        <div className='flex flex-col gap-2 border-t-2 border-[#eef0f7] p-4'>
          <p className='text-[13px] font-bold text-[#1e2364]'>
            {plan === CourseSellingPlan.Bulk
              ? t.course.bulkTitle
              : plan === CourseSellingPlan.Separated
                ? t.course.choosePlan
                : t.course.courseOnly}
          </p>
          {plan === CourseSellingPlan.Bulk && (
            <p className='text-xs text-[#6b7196]'>{t.course.includesAll}</p>
          )}
          <PlanLine
            label={t.course.coursePrice}
            amount={pricing.price ?? 0}
            trailing={
              plan === CourseSellingPlan.Separated ? (
                <Lock className='size-3.5 text-[#6b7196]' aria-label={t.course.courseRequired} />
              ) : undefined
            }
          />
          {plan === CourseSellingPlan.Separated && (
            <>
              <div>
                <PlanLine
                  label={t.course.certified}
                  amount={pricing.certifiedExamPrice ?? 0}
                  trailing={
                    <Checkbox
                      aria-label={t.course.certified}
                      checked={addOns.certified}
                      onCheckedChange={(checked) =>
                        onAddOnsChange({ ...addOns, certified: checked === true })
                      }
                    />
                  }
                />
              </div>
              <div>
                <PlanLine
                  label={t.course.sadad}
                  amount={pricing.sadadPrice ?? 0}
                  trailing={
                    <Checkbox
                      aria-label={t.course.sadad}
                      checked={addOns.sadad}
                      onCheckedChange={(checked) =>
                        onAddOnsChange({ ...addOns, sadad: checked === true })
                      }
                    />
                  }
                />
              </div>
            </>
          )}
          {plan === CourseSellingPlan.Bulk && (
            <>
              <PlanLine label={t.course.certified} amount={pricing.certifiedExamPrice ?? 0} />
              <PlanLine label={t.course.sadad} amount={pricing.sadadPrice ?? 0} />
            </>
          )}
          <div className='mt-1 flex items-center justify-between px-1'>
            <span className='text-sm font-bold text-[#6b7196]'>{t.course.total}</span>
            <SarAmount amount={total} className='text-[16px] font-extrabold text-[#1e2364]' />
          </div>
        </div>
      )}
    </li>
  );
}
