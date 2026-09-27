'use client';

import { ShoppingBasket } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { getLocalizedRoute } from '@/i18n/routing';
import { useFamilySelectionStore } from '@/modules/family';
import { useBasketStore } from '@/modules/services/store/basketStore';
import { buttonVariants } from '@/shared/components/ui/Button';
import { Spinner } from '@/shared/components/ui/Spinner';
import { ROUTES } from '@/shared/constants/routes';
import { useFeatureToggle } from '@/shared/hooks/useFeatureToggles';
import { useHydrated } from '@/shared/hooks/useHydrated';
import { checkoutSteps } from './checkout.shared';
import { BookingSummary } from './components/BookingSummary';
import { CheckoutHeader } from './components/CheckoutHeader';
import { LeaveCheckoutDialog } from './components/LeaveCheckoutDialog';
import { ConfirmStep } from './components/steps/ConfirmStep';
import { CourseStep } from './components/steps/CourseStep';
import { FacilityStep } from './components/steps/FacilityStep';
import { FamilyStep } from './components/steps/FamilyStep';
import { TimeStep } from './components/steps/TimeStep';
import { useOwnerOptions } from './hooks/useOwnerOptions';
import { basketKeyOf, useCheckoutDraftStore } from './store/checkoutDraftStore';
import type {
  CheckoutAppointment,
  CheckoutServiceSelection,
  CheckoutStepId,
} from './types/checkout.types';

function isStepId(value: string | null): value is CheckoutStepId {
  return (
    value === 'family' ||
    value === 'facility' ||
    value === 'time' ||
    value === 'course' ||
    value === 'confirm'
  );
}

export function CheckoutPage() {
  const hydrated = useHydrated();
  if (!hydrated) {
    return (
      <div className='flex min-h-[50vh] items-center justify-center'>
        <Spinner size='lg' />
      </div>
    );
  }
  return <CheckoutFlow />;
}

function CheckoutFlow() {
  const t = useTranslations('checkout');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const academyEnabled = useFeatureToggle('academy');

  const basketServices = useBasketStore((state) => state.services);
  const basketGroup = useBasketStore((state) => state.serviceGroup);
  const clearBasket = useBasketStore((state) => state.clear);
  const basketKey = basketKeyOf({ services: basketServices, serviceGroup: basketGroup });

  const draft = useCheckoutDraftStore();
  const selectedMemberId = useFamilySelectionStore((state) => state.selectedMemberId);
  const owners = useOwnerOptions();
  const [leaveOpen, setLeaveOpen] = useState(false);

  const serviceFromBasket = useMemo<CheckoutServiceSelection | null>(() => {
    if (basketGroup) {
      return {
        serviceIds: [basketGroup.id],
        serviceNames: [basketGroup.name],
        serviceGroupId: basketGroup.id,
      };
    }
    if (basketServices.length === 0) return null;
    return {
      serviceIds: basketServices.map((item) => item.id),
      serviceNames: basketServices.map((item) => item.name),
    };
  }, [basketGroup, basketServices]);

  // Bind the draft to the current basket (resume or start over).
  const { begin } = draft;
  useEffect(() => {
    if (basketKey && serviceFromBasket) begin(basketKey, serviceFromBasket);
  }, [basketKey, begin, serviceFromBasket]);

  // Default buyer: the remembered family member, else the user.
  const { setOwner } = draft;
  const defaultOwner = selectedMemberId ?? owners.selfId;
  useEffect(() => {
    if (draft.basketKey === basketKey && !draft.ownerId && defaultOwner) {
      setOwner(defaultOwner);
    }
  }, [basketKey, defaultOwner, draft.basketKey, draft.ownerId, setOwner]);

  const service = draft.basketKey === basketKey ? draft.service : null;
  const hasCourseStep = !!service?.serviceGroupId && academyEnabled;
  const steps = checkoutSteps(hasCourseStep);

  const appointmentReady = draft.appointment.selectedSlots.length > 0 && !!draft.appointment.dateChosen;
  const reachable: Record<CheckoutStepId, boolean> = {
    family: true,
    facility: !!draft.ownerId,
    time: !!draft.ownerId && !!draft.facility,
    course: hasCourseStep && !!draft.facility && appointmentReady,
    confirm: !!draft.facility && appointmentReady,
  };

  const requested = searchParams.get('step');
  const lastReachable = [...steps].reverse().find((id) => reachable[id]) ?? 'family';
  const current: CheckoutStepId =
    isStepId(requested) && steps.includes(requested) && reachable[requested]
      ? requested
      : steps.includes(draft.stepId) && reachable[draft.stepId]
        ? draft.stepId
        : lastReachable;
  const index = steps.indexOf(current);

  // Remember where the user is, for "save for later".
  const { markStep } = draft;
  useEffect(() => {
    if (service) markStep(current);
  }, [current, markStep, service]);

  const goTo = useCallback(
    (step: CheckoutStepId) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('step', step);
      router.push(`${pathname}?${params.toString()}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [pathname, router, searchParams]
  );
  const next = () => goTo(steps[Math.min(index + 1, steps.length - 1)]);
  const back = () => goTo(steps[Math.max(index - 1, 0)]);

  const { setAppointment } = draft;
  const onAppointmentChange = useCallback(
    (appointment: CheckoutAppointment) => setAppointment(appointment),
    [setAppointment]
  );

  const servicesHref = getLocalizedRoute(locale, ROUTES.SERVICES);

  if (!service) {
    return (
      <div className='mx-auto flex max-w-lg flex-col items-center gap-4 py-20 text-center'>
        <span className='inline-flex size-16 items-center justify-center rounded-full bg-[#f3f4f8]'>
          <ShoppingBasket className='size-7 text-[#1e2364]' aria-hidden />
        </span>
        <h1 className='text-2xl font-extrabold text-[#1e2364]'>{t.empty.title}</h1>
        <p className='text-[#6b7196]'>{t.empty.message}</p>
        <Link href={servicesHref} className={buttonVariants({ variant: 'brand' })}>
          {t.empty.cta}
        </Link>
      </div>
    );
  }

  const owner = owners.options.find((option) => option.id === draft.ownerId) ?? null;

  function saveForLater() {
    setLeaveOpen(false);
    router.push(service?.serviceGroupId ? `${servicesHref}?tab=groups` : servicesHref);
  }

  function discard() {
    setLeaveOpen(false);
    draft.reset();
    clearBasket();
    router.push(getLocalizedRoute(locale, ROUTES.HOME));
  }

  return (
    <div className='mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-4 pb-16 pt-4 md:px-7 lg:grid-cols-[minmax(0,1fr)_340px]'>
      <div className='min-w-0'>
        <CheckoutHeader
          title={t.steps[current]}
          subtitle={t.subtitles[current]}
          step={index + 1}
          total={steps.length}
          onLeave={() => setLeaveOpen(true)}
        />

        {current === 'family' && (
          <FamilyStep
            serviceNames={service.serviceNames}
            options={owners.options}
            ownerId={draft.ownerId}
            isLoading={owners.isLoading}
            isError={owners.isError}
            onRetry={() => void owners.refetch()}
            onSelect={draft.setOwner}
            onNext={next}
          />
        )}
        {current === 'facility' && (
          <FacilityStep
            service={service}
            selectedBranchId={draft.facility?.branchId ?? null}
            selectedName={draft.facility?.name ?? null}
            onSelect={draft.setFacility}
            onNext={next}
            onBack={back}
          />
        )}
        {current === 'time' && draft.facility && (
          <TimeStep
            service={service}
            facility={draft.facility}
            appointment={draft.appointment}
            hasCourseStep={hasCourseStep}
            onChange={onAppointmentChange}
            onNext={next}
            onBack={back}
          />
        )}
        {current === 'course' && service.serviceGroupId && (
          <CourseStep
            serviceGroupId={service.serviceGroupId}
            course={draft.course}
            onChange={draft.setCourse}
            onNext={next}
            onBack={back}
          />
        )}
        {current === 'confirm' && (
          <ConfirmStep
            state={draft}
            owner={owner}
            onEdit={goTo}
            onBack={back}
          />
        )}
      </div>

      <div className='hidden lg:block'>
        <div className='sticky top-[110px]'>
          <BookingSummary state={draft} ownerName={owner?.name ?? null} />
        </div>
      </div>

      <LeaveCheckoutDialog
        open={leaveOpen}
        isGroup={!!service.serviceGroupId}
        serviceCount={service.serviceIds.length}
        onSave={saveForLater}
        onDiscard={discard}
        onClose={() => setLeaveOpen(false)}
      />
    </div>
  );
}
