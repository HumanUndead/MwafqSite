'use client';

import { useEffect, useMemo, useState } from 'react';

import { useTranslations, useLocale } from '@/i18n/DictionaryProvider';
import { localeToLangId } from '@/i18n/config';
import { ScrollReveal } from '@/shared/components/motion/ScrollReveal';
import type { ServiceGroupDetail } from '@/modules/auth/serviceGroup.types';
import {
  type BookingStepId,
  getBookingSteps,
  getServiceGroupDetailPath,
  plainTextFromHtml,
} from '@/modules/services/booking.shared';
import { BookingActions } from '@/modules/services/components/booking/BookingActions';
import { BookingStepper } from '@/modules/services/components/booking/BookingStepper';
import { BookingPlaceholderStep } from '@/modules/services/components/booking/steps/BookingPlaceholderStep';
import { ExaminationsStep } from '@/modules/services/components/booking/steps/ExaminationsStep';

type ServiceGroupBuyPageProps = {
  serviceGroup: ServiceGroupDetail;
};

export function ServiceGroupBuyPage({
  serviceGroup,
}: ServiceGroupBuyPageProps) {
  const locale = useLocale();
  const t = useTranslations('services').booking;
  const langId = localeToLangId[locale];

  const [currentStep, setCurrentStep] = useState<BookingStepId>('examinations');

  const steps = useMemo(() => getBookingSteps(serviceGroup), [serviceGroup]);

  useEffect(() => {
    if (!steps.includes(currentStep)) {
      setCurrentStep(steps[0] ?? 'examinations');
    }
  }, [steps, currentStep]);

  const translation =
    serviceGroup.translations.find((tr) => tr.langId === langId) ??
    serviceGroup.translations[0];

  const packageTitle = translation?.name?.trim() ?? '';
  const packageSubtitle = plainTextFromHtml(
    translation?.description?.trim() || t.defaultSubtitle
  );

  const cancelHref = getServiceGroupDetailPath(locale, serviceGroup.id);
  const currentStepIndex = Math.max(0, steps.indexOf(currentStep));
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const stepLabels = useMemo(
    () => ({
      examinations: t.steps.examinations,
      course: t.steps.course,
      facility: t.steps.facility,
      time: t.steps.time,
    }),
    [t.steps]
  );

  function handleNext() {
    if (isLastStep) return;
    const next = steps[currentStepIndex + 1];
    if (next) setCurrentStep(next);
  }

  function handleBack() {
    if (isFirstStep) return;
    const prev = steps[currentStepIndex - 1];
    if (prev) setCurrentStep(prev);
  }

  return (
    <div className='overflow-x-clip bg-[#eeeeef] pb-16 text-[#1e2364]'>
      <section className='pb-10 md:pb-[60px]'>
        <div className='mx-auto max-w-[1320px] px-4 md:px-7'>
          <BookingStepper
            steps={steps}
            currentStep={currentStep}
            labels={stepLabels}
          />

          <ScrollReveal variant='y' revealAfterLoadMs={200}>
            <div className='mx-auto max-w-[1000px] rounded-[24px] border-2 border-[#e5e7f0] bg-white px-6 py-8 md:px-10 md:py-10'>
              <header className='mb-7 text-center md:mb-8'>
                <h1 className='text-[clamp(22px,2.6vw,32px)] font-extrabold leading-tight tracking-[-0.8px] text-[#1e2364]'>
                  {packageTitle}
                </h1>
                {packageSubtitle ? (
                  <p className='mx-auto mt-2 max-w-[560px] text-[14.5px] leading-relaxed text-[#6b7196]'>
                    {packageSubtitle}
                  </p>
                ) : null}
              </header>

              {currentStep === 'examinations' ? (
                <ExaminationsStep
                  serviceGroup={serviceGroup}
                  examItemLabel={t.examItemLabel}
                  noExamsMessage={t.noExams}
                />
              ) : null}

              {currentStep === 'course' ? (
                <BookingPlaceholderStep message={t.comingSoon} />
              ) : null}

              {currentStep === 'facility' ? (
                <BookingPlaceholderStep message={t.comingSoon} />
              ) : null}

              {currentStep === 'time' ? (
                <BookingPlaceholderStep message={t.comingSoon} />
              ) : null}

              <BookingActions
                locale={locale}
                cancelHref={cancelHref}
                cancelLabel={t.cancel}
                nextLabel={isLastStep ? t.finish : t.next}
                backLabel={t.back}
                onNext={handleNext}
                onBack={handleBack}
                showBack={!isFirstStep}
              />
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
