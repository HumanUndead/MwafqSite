'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Layers, ShoppingBasket, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslations } from '@/i18n/DictionaryProvider';
import { Button } from '@/shared/components/ui/Button';
import { useHydrated } from '@/shared/hooks/useHydrated';
import { interpolate } from '@/shared/lib/interpolate';
import { useBasketStore } from '../../store/basketStore';
import { BasketDrawer } from './BasketDrawer';
import { useCatalogActions } from './CatalogActionsProvider';

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Floating cart in the bottom-right corner with a count badge. Individual
 * services open the basket drawer; a selected group opens a small summary
 * card above the button (remove / continue). Hidden while the basket is empty.
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
  const [groupCardOpen, setGroupCardOpen] = useState(false);

  const visible = hydrated && (services.length > 0 || !!serviceGroup);
  const count = serviceGroup ? 1 : services.length;
  const cardOpen = groupCardOpen && !!serviceGroup;

  useEffect(() => {
    if (!cardOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setGroupCardOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cardOpen]);

  const openBasket = () => {
    if (serviceGroup) setGroupCardOpen((open) => !open);
    else setDrawerOpen(true);
  };

  return (
    <>
      {cardOpen && (
        // Invisible layer: a click anywhere else closes the summary card.
        <div
          aria-hidden
          className='fixed inset-0 z-40'
          onClick={() => setGroupCardOpen(false)}
        />
      )}

      <AnimatePresence>
        {visible && (
          <motion.div
            key='basket-fab'
            initial={reduceMotion ? false : { scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            // Fixed page chrome: pinned to the physical right corner in both
            // languages, like a shop cart.
            className='fixed bottom-5 right-5 z-50'
          >
            <AnimatePresence>
              {cardOpen && serviceGroup && (
                <motion.div
                  key='basket-group-card'
                  role='dialog'
                  aria-label={t.basket.groupLabel}
                  initial={reduceMotion ? false : { y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={reduceMotion ? { opacity: 0 } : { y: 8, opacity: 0 }}
                  transition={{ duration: 0.2, ease: EASE }}
                  // Anchored above the button (physical right, like the
                  // button) so opening it never shifts the cart.
                  className='absolute bottom-full right-0 mb-3 w-[min(20rem,calc(100vw-2.5rem))] rounded-[20px] border border-[#e5e7f0] bg-white p-4 shadow-[0_16px_40px_-16px_rgba(30,35,100,0.35)]'
                >
                  <div className='flex items-start gap-3'>
                    <span className='inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-[#e6f6fe] text-[#00a8f1]'>
                      <Layers className='size-5' aria-hidden />
                    </span>
                    <div className='min-w-0 flex-1'>
                      <p className='text-xs font-semibold text-[#6b7196]'>
                        {t.basket.groupLabel}
                      </p>
                      <p className='mt-0.5 line-clamp-2 text-sm font-bold leading-snug text-[#1e2364]'>
                        {serviceGroup.name}
                      </p>
                      {serviceGroup.serviceCount > 0 && (
                        <p className='mt-1 text-xs text-[#6b7196]'>
                          {interpolate(t.groupServicesCount, {
                            count: serviceGroup.serviceCount,
                          })}
                        </p>
                      )}
                    </div>
                    <button
                      type='button'
                      onClick={() => setGroupCardOpen(false)}
                      aria-label={t.close}
                      className='inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#6b7196] hover:bg-[#f3f4f8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a8f1]'
                    >
                      <X className='size-4' aria-hidden />
                    </button>
                  </div>

                  <div className='mt-4 flex items-center gap-2'>
                    <Button
                      variant='brand'
                      type='button'
                      onClick={() => {
                        setGroupCardOpen(false);
                        continueToCheckout();
                      }}
                      className='flex-1 rounded-[12px]'
                    >
                      {t.basket.continue}
                      <ArrowRight className='size-4 rtl:rotate-180' aria-hidden />
                    </Button>
                    <button
                      type='button'
                      onClick={() => {
                        setGroupCardOpen(false);
                        clearServiceGroup();
                      }}
                      aria-label={t.deselectGroup}
                      title={t.deselectGroup}
                      className='inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-[12px] border border-[#e5e7f0] text-red-600 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a8f1]'
                    >
                      <Trash2 className='size-4' aria-hidden />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type='button'
              onClick={openBasket}
              aria-haspopup='dialog'
              aria-expanded={serviceGroup ? cardOpen : drawerOpen}
              aria-label={`${t.basket.open} (${count})`}
              className='relative inline-flex size-14 cursor-pointer items-center justify-center rounded-full bg-[#1e2364] text-white shadow-[0_12px_28px_-10px_rgba(30,35,100,0.6)] transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a8f1] focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:scale-100'
            >
              <ShoppingBasket className='size-6' aria-hidden />
              <span className='absolute -end-1 -top-1 inline-flex min-w-6 items-center justify-center rounded-full bg-[#00a8f1] px-1.5 py-0.5 text-xs font-bold text-white ring-2 ring-white'>
                {count > 99 ? '99+' : count}
              </span>
            </button>
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
