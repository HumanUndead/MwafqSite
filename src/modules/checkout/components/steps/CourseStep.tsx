'use client';

import { localeToLangId } from '@/i18n/config';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { Button } from '@/shared/components/ui/Button';
import { SarAmount } from '@/shared/components/ui/SarAmount';
import {
  coursePlanTotal,
  courseSelectedService,
} from '@/shared/lib/coursePlan.shared';
import { useServiceGroupCourses } from '../../hooks/useCheckoutData';
import type {
  CheckoutCourse,
  CheckoutCourseSelection,
} from '../../types/checkout.types';
import { StepFooter } from '../StepFooter';
import { CourseOptionCard } from './course/CourseOptionCard';

interface CourseStepProps {
  serviceGroupId: number;
  course: CheckoutCourseSelection;
  onChange: (course: CheckoutCourseSelection) => void;
  onNext: () => void;
  onBack: () => void;
}

/** Every key set so a partial merge clears the previous course. */
const NO_COURSE: CheckoutCourseSelection = {
  courseId: undefined,
  courseName: undefined,
  selectedCertified: false,
  selectedSadad: false,
  selectedService: undefined,
  courseTotalPrice: undefined,
};

export function CourseStep({
  serviceGroupId,
  course,
  onChange,
  onNext,
  onBack,
}: CourseStepProps) {
  const t = useTranslations('checkout');
  const locale = useLocale();
  const { data, isLoading, isError, refetch } = useServiceGroupCourses(serviceGroupId, true);
  const courses = data ?? [];

  const nameOf = (item: CheckoutCourse) =>
    (
      item.translations.find((tr) => tr.langId === localeToLangId[locale]) ??
      item.translations[0]
    )?.name?.trim() ?? '';

  function select(item: CheckoutCourse, addOns = { certified: false, sadad: false }) {
    const total = coursePlanTotal(item.paymentSettings, addOns);
    onChange({
      courseId: item.id,
      courseName: nameOf(item),
      selectedCertified: addOns.certified,
      selectedSadad: addOns.sadad,
      selectedService: courseSelectedService(item.paymentSettings, addOns),
      courseTotalPrice: total > 0 ? total : undefined,
    });
  }

  const selectedCourse = courses.find((item) => item.id === course.courseId);
  const total = selectedCourse
    ? coursePlanTotal(selectedCourse.paymentSettings, {
        certified: course.selectedCertified,
        sadad: course.selectedSadad,
      })
    : 0;

  return (
    <div>
      {isLoading ? (
        <ul className='flex flex-col gap-3' aria-hidden>
          {[0, 1].map((key) => (
            <li key={key} className='h-[96px] animate-pulse rounded-[20px] bg-[#e5e7f0]' />
          ))}
        </ul>
      ) : isError ? (
        <div className='flex flex-col items-center gap-3 rounded-[20px] border-2 border-dashed border-red-200 bg-white px-6 py-10 text-center' role='alert'>
          <p className='text-sm font-semibold text-red-600'>{t.course.loadError}</p>
          <Button variant='outline' type='button' onClick={() => void refetch()}>
            {t.facility.retry}
          </Button>
        </div>
      ) : courses.length === 0 ? (
        <p className='rounded-[20px] border-2 border-dashed border-[#e5e7f0] bg-white px-6 py-10 text-center text-sm font-semibold text-[#6b7196]'>
          {t.course.none}
        </p>
      ) : (
        <ul role='radiogroup' aria-label={t.steps.course} className='flex flex-col gap-3'>
          {courses.map((item) => {
            const selected = item.id === course.courseId;
            return (
              <CourseOptionCard
                key={item.id}
                course={item}
                name={nameOf(item)}
                selected={selected}
                addOns={
                  selected
                    ? { certified: course.selectedCertified, sadad: course.selectedSadad }
                    : { certified: false, sadad: false }
                }
                onToggle={() => (selected ? onChange(NO_COURSE) : select(item))}
                onAddOnsChange={(addOns) => select(item, addOns)}
              />
            );
          })}
        </ul>
      )}

      <StepFooter
        ready
        hint={selectedCourse ? nameOf(selectedCourse) : t.course.optional}
        nextLabel={selectedCourse ? t.next : t.course.skip}
        nextAccessory={
          selectedCourse && total > 0 ? (
            <span className='rounded-full bg-white/15 px-2 py-0.5'>
              <SarAmount amount={total} />
            </span>
          ) : undefined
        }
        onNext={onNext}
        onBack={onBack}
      />
    </div>
  );
}
