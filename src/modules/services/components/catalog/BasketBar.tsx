'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Layers, ShoppingBasket, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslations } from '@/i18n/DictionaryProvider';
import { Button } from '@/shared/components/ui/Button';
import { useHydrated } from '@/shared/hooks/useHydrated';
import { interpolate } from '@/shared/lib/interpolate';
import { useBasketStore } from '../../store/basketStore';
import { BasketDrawer } from './BasketDrawer';
import { useCatalogActions } from './CatalogActionsProvider';

/**
 * Floating basket summary: the selected group, or the count of individual
 * services (opens the drawer). Hidden while the basket is empty.
 */
export function BasketBar() {
  const t = useTranslations('catalog');
  const hydrated = useHydrated();
  const reduceMotion = useReducedMotion();
  const { continueToCheckout } = useCatalogActions();
  const services = useBasketStore((state) => state.services);
  const serviceGroup = useBasketStore((state) => state.serviceGroup);
  const clearServiceGroup = useBasketStore((state) => state.clearServiceGroup);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const visible = hydrated && (services.length > 0 || !!serviceGroup);

  return (
    <>
      <AnimatePresence>
        {visible && (
          <motion.div
            key='basket-bar'
            initial={reduceMotion ? false : { y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { y: 80, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className='fixed inset-x-0 bottom-4 z-40 flex justify-center px-4'
          >
            <div className='flex w-full max-w-xl items-center gap-3 rounded-[20px] border-2 border-[#e5e7f0] bg-white p-2.5 ps-4 shadow-xl'>
              {serviceGroup ? (
                <>
                  <Layers
                    className='size-5 shrink-0 text-[#00a8f1]'
                    aria-hidden
                  />
                  <div className='min-w-0 flex-1'>
                    <p className='text-[11px] font-semibold uppercase tracking-wide text-[#6b7196]'>
                      {t.basket.groupLabel}
                    </p>
                    <p className='truncate text-sm font-bold text-[#1e2364]'>
                      {serviceGroup.name}
                      {serviceGroup.serviceCount > 0 && (
                        <span className='ms-2 font-semibold text-[#6b7196]'>
                          ·{' '}
                          {interpolate(t.groupServicesCount, {
                            count: serviceGroup.serviceCount,
                          })}
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    type='button'
                    onClick={clearServiceGroup}
                    aria-label={t.deselectGroup}
                    className='inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#6b7196] hover:bg-[#f3f4f8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e2364]'
                  >
                    <X className='size-4' aria-hidden />
                  </button>
                </>
              ) : (
                <button
                  type='button'
                  onClick={() => setDrawerOpen(true)}
                  aria-haspopup='dialog'
                  aria-label={t.basket.open}
                  className='flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-[12px] text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e2364]'
                >
                  <span className='relative inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-[#f3f4f8]'>
                    <ShoppingBasket
                      className='size-5 text-[#1e2364]'
                      aria-hidden
                    />
                    <span className='absolute -end-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-[#00a8f1] px-1 text-[11px] font-bold text-white'>
                      {services.length > 99 ? '99+' : services.length}
                    </span>
                  </span>
                  <span className='truncate text-sm font-bold text-[#1e2364]'>
                    {interpolate(t.basket.selectedCount, {
                      count: services.length,
                    })}
                  </span>
                </button>
              )}
              <Button
                variant='brand'
                type='button'
                onClick={continueToCheckout}
                className='shrink-0 rounded-[14px]'
              >
                {t.basket.continue}
                <ArrowRight className='size-4 rtl:rotate-180' aria-hidden />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <BasketDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onContinue={() => {
          setDrawerOpen(false);
          continueToCheckout();
        }}
      />
    </>
  );
}
