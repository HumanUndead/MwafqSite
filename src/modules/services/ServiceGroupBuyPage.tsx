'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';

import { useTranslations, useLocale } from '@/i18n/DictionaryProvider';
import { localeToLangId } from '@/i18n/config';
import { ScrollReveal } from '@/shared/components/motion/ScrollReveal';
import { ROUTES } from '@/shared/constants/routes';
import { getLocalizedRoute } from '@/i18n/routing';
import type { ServiceGroupDetail } from '@/modules/auth/serviceGroup.types';
import { useAuthStore } from '@/modules/auth/store/authStore';
import { submitReservation } from '@/modules/services/api/bookingApi';
import {
  type BookingStepId,
  getBookingSteps,
  getServiceGroupDetailPath,
  plainTextFromHtml,
} from '@/modules/services/booking.shared';
import type {
  BookingTimeSlot,
  ServiceProviderBranch,
} from '@/modules/services/types/booking.types';
import { BookingActions } from '@/modules/services/components/booking/BookingActions';
import { BookingStepper } from '@/modules/services/components/booking/BookingStepper';
import { CourseStep } from '@/modules/services/components/booking/steps/CourseStep';
import { ExaminationsStep } from '@/modules/services/components/booking/steps/ExaminationsStep';
import { FacilityStep } from '@/modules/services/components/booking/steps/FacilityStep';
import { TimeStep } from '@/modules/services/components/booking/steps/TimeStep';

type ServiceGroupBuyPageProps = {
  serviceGroup: ServiceGroupDetail;
};

export function ServiceGroupBuyPage({
  serviceGroup,
}: ServiceGroupBuyPageProps) {
  const locale = useLocale();
  const t = useTranslations('services').booking;
  const langId = localeToLangId[locale];
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [currentStep, setCurrentStep] = useState<BookingStepId>('examinations');
  const [selectedBranch, setSelectedBranch] =
    useState<ServiceProviderBranch | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<BookingTimeSlot[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  const canProceed = useMemo(() => {
    switch (currentStep) {
      case 'examinations':
        return true;
      case 'facility':
        return !!selectedBranch;
      case 'time':
        return !!(selectedDate && selectedSlots.length > 0);
      case 'course':
        return !!selectedCourseId;
      default:
        return false;
    }
  }, [
    currentStep,
    selectedBranch,
    selectedDate,
    selectedSlots,
    selectedCourseId,
  ]);

  const stepLabels = useMemo(
    () => ({
      examinations: t.steps.examinations,
      facility: t.steps.facility,
      time: t.steps.time,
      course: t.steps.course,
    }),
    [t.steps]
  );

  function handleNext() {
    if (!canProceed || isLastStep) return;
    const next = steps[currentStepIndex + 1];
    if (next) setCurrentStep(next);
  }

  function handleBack() {
    if (isFirstStep) return;
    const prev = steps[currentStepIndex - 1];
    if (prev) setCurrentStep(prev);
  }

  async function handleFinish() {
    if (!canProceed || !selectedBranch || !selectedDate || !selectedSlots.length) return;
    if (!user) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      await submitReservation({
        serviceProviderBranchId: selectedBranch.id,
        dateChosen: dayjs(selectedDate).toJSON(),
        ownerId: user.id,
        slots: selectedSlots,
        courseId: selectedCourseId ?? undefined,
      });
      router.push(getLocalizedRoute(locale, ROUTES.MY_RESERVATIONS));
    } catch {
      setSubmitError(t.submitError);
    } finally {
      setSubmitting(false);
    }
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

              {currentStep === 'examinations' && (
                <ExaminationsStep
                  serviceGroup={serviceGroup}
                  examItemLabel={t.examItemLabel}
                  noExamsMessage={t.noExams}
                />
              )}

              {currentStep === 'facility' && (
                <FacilityStep
                  serviceGroupId={serviceGroup.id}
                  selectedBranch={selectedBranch}
                  onSelect={setSelectedBranch}
                  labels={t.facility}
                />
              )}

              {currentStep === 'time' && selectedBranch && (
                <TimeStep
                  serviceGroupId={serviceGroup.id}
                  serviceIds={serviceGroup.serviceGroupServices.map((s) => s.serviceId)}
                  branch={selectedBranch}
                  selectedDate={selectedDate}
                  selectedSlots={selectedSlots}
                  onDateChange={(date) => {
                    setSelectedDate(date);
                    setSelectedSlots([]);
                  }}
                  onSlotsChange={setSelectedSlots}
                  labels={t.time}
                />
              )}

              {currentStep === 'course' && (
                <CourseStep
                  serviceGroupId={serviceGroup.id}
                  selectedCourseId={selectedCourseId}
                  onSelect={setSelectedCourseId}
                  labels={t.course}
                />
              )}

              {submitError && (
                <p className='mb-4 rounded-lg bg-red-50 px-4 py-3 text-[13.5px] font-medium text-red-600'>
                  {submitError}
                </p>
              )}

              <BookingActions
                locale={locale}
                cancelHref={cancelHref}
                cancelLabel={t.cancel}
                nextLabel={
                  isLastStep ? (submitting ? t.submitting : t.finish) : t.next
                }
                backLabel={t.back}
                onNext={isLastStep ? handleFinish : handleNext}
                onBack={handleBack}
                nextDisabled={!canProceed || submitting}
                showBack={!isFirstStep}
              />
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
