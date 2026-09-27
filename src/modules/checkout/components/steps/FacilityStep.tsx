'use client';

import { List, LocateFixed, Map as MapIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { useTranslations } from '@/i18n/DictionaryProvider';
import { Button } from '@/shared/components/ui/Button';
import { Spinner } from '@/shared/components/ui/Spinner';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { cn } from '@/shared/lib/cn';
import { interpolate } from '@/shared/lib/interpolate';
import { roundSar } from '@/shared/lib/money';
import { customDayFlag, startOfToday } from '../../checkout.shared';
import { useCheckoutBranches } from '../../hooks/useCheckoutData';
import type {
  CheckoutBranch,
  CheckoutFacility,
  CheckoutServiceSelection,
} from '../../types/checkout.types';
import { StepFooter } from '../StepFooter';
import { BranchCard } from './facility/BranchCard';

const BranchMap = dynamic(() => import('./facility/BranchMap'), {
  ssr: false,
  loading: () => (
    <div className='flex h-[420px] items-center justify-center rounded-[20px] border-2 border-[#e5e7f0] bg-[#eaf3f8]'>
      <Spinner />
    </div>
  ),
});

type LatLng = { lat: number; lng: number };

function toFacility(branch: CheckoutBranch): CheckoutFacility {
  const closingDays = branch.closingDays ?? [];
  return {
    branchId: branch.id,
    name: branch.name,
    closingDays,
    isClosedToday: closingDays.includes(customDayFlag(startOfToday().getDay())),
    scheduleOffs: (branch.scheduleOffs ?? [])
      .map((off) => off.date?.slice(0, 10))
      .filter((date): date is string => !!date),
    price: roundSar(branch.totalPrice),
  };
}

interface FacilityStepProps {
  service: CheckoutServiceSelection;
  selectedBranchId: number | null;
  selectedName: string | null;
  onSelect: (facility: CheckoutFacility | null) => void;
  onNext: () => void;
  onBack: () => void;
}

export function FacilityStep({
  service,
  selectedBranchId,
  selectedName,
  onSelect,
  onNext,
  onBack,
}: FacilityStepProps) {
  const t = useTranslations('checkout');
  const [view, setView] = useState<'list' | 'map'>('list');
  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [mapCenter, setMapCenter] = useState<{ latitude: number; longitude: number } | null>(
    null
  );
  const center = useDebounce(view === 'map' ? mapCenter : null, 350);
  const { data, isLoading, isError, isFetching, refetch } = useCheckoutBranches(
    service,
    center
  );
  const branches = data ?? [];

  // Distance only when location is already allowed — never prompt on load.
  useEffect(() => {
    if (!('geolocation' in navigator) || !navigator.permissions) return;
    let cancelled = false;
    navigator.permissions
      .query({ name: 'geolocation' as PermissionName })
      .then((status) => {
        if (status.state !== 'granted' || cancelled) return;
        navigator.geolocation.getCurrentPosition((position) => {
          if (!cancelled) {
            setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          }
        });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  function locateMe() {
    navigator.geolocation?.getCurrentPosition(
      (position) =>
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
      () => undefined,
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 }
    );
  }

  function toggle(branch: CheckoutBranch) {
    onSelect(branch.id === selectedBranchId ? null : toFacility(branch));
  }

  return (
    <div>
      <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
        <p className='text-sm font-bold text-[#6b7196]' aria-live='polite'>
          {interpolate(t.facility.count, { count: branches.length })}
          {isFetching && !isLoading && <Spinner size='sm' className='ms-2 align-middle' />}
        </p>
        <div className='flex items-center gap-2'>
          <Button variant='ghost' size='sm' type='button' onClick={locateMe}>
            <LocateFixed className='size-4' aria-hidden />
            {t.facility.myLocation}
          </Button>
          <div className='inline-flex rounded-full border-2 border-[#e5e7f0] bg-white p-1'>
            {(['list', 'map'] as const).map((key) => (
              <button
                key={key}
                type='button'
                aria-pressed={view === key}
                onClick={() => setView(key)}
                className={cn(
                  'inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e2364]',
                  view === key ? 'bg-[#1e2364] text-white' : 'text-[#6b7196] hover:text-[#1e2364]'
                )}
              >
                {key === 'list' ? (
                  <List className='size-4' aria-hidden />
                ) : (
                  <MapIcon className='size-4' aria-hidden />
                )}
                {key === 'list' ? t.facility.listView : t.facility.mapView}
              </button>
            ))}
          </div>
        </div>
      </div>

      {view === 'map' && (
        <div className='mb-4'>
          <BranchMap
            branches={branches}
            selectedId={selectedBranchId}
            userLocation={userLocation}
            ariaLabel={t.facility.mapView}
            onSelect={toggle}
            onCenterChange={setMapCenter}
          />
          <p className='mt-2 text-center text-xs text-[#6b7196]'>
            {branches.some((b) => Number.isFinite(b.latitude))
              ? t.facility.mapHint
              : t.facility.noneOnMap}
          </p>
        </div>
      )}

      {isLoading ? (
        <ul className='flex flex-col gap-3' aria-hidden>
          {[0, 1, 2].map((key) => (
            <li key={key} className='h-[120px] animate-pulse rounded-[20px] bg-[#e5e7f0]' />
          ))}
        </ul>
      ) : isError ? (
        <div className='flex flex-col items-center gap-3 rounded-[20px] border-2 border-dashed border-red-200 bg-white px-6 py-10 text-center' role='alert'>
          <p className='text-sm font-semibold text-red-600'>{t.facility.loadError}</p>
          <Button variant='outline' type='button' onClick={() => void refetch()}>
            {t.facility.retry}
          </Button>
        </div>
      ) : branches.length === 0 ? (
        <p className='rounded-[20px] border-2 border-dashed border-[#e5e7f0] bg-white px-6 py-10 text-center text-sm font-semibold text-[#6b7196]'>
          {t.facility.none}
        </p>
      ) : (
        <ul role='radiogroup' aria-label={t.steps.facility} className='flex flex-col gap-3'>
          {branches.map((branch) => (
            <BranchCard
              key={branch.id}
              branch={branch}
              selected={branch.id === selectedBranchId}
              userLocation={userLocation}
              onSelect={() => toggle(branch)}
            />
          ))}
        </ul>
      )}

      <StepFooter
        ready={!!selectedBranchId}
        hint={selectedName ?? t.facility.hint}
        onNext={onNext}
        onBack={onBack}
      />
    </div>
  );
}
