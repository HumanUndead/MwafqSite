'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslations } from '@/i18n/DictionaryProvider';
import {
  profileTabListClass,
  profileTabTriggerClass,
} from '@/modules/profile/tabStyles';
import { ScrollReveal } from '@/shared/components/motion/ScrollReveal';
import { cn } from '@/shared/lib/cn';
import { BasketBar } from './components/catalog/BasketBar';
import { CatalogActionsProvider } from './components/catalog/CatalogActionsProvider';
import { FavoritesCatalog } from './components/catalog/FavoritesCatalog';
import type { CatalogKind } from './types/catalog.types';

/** Profile favorites: saved services and service groups (local only). */
export function FavoritesView() {
  const t = useTranslations('catalog');
  const nav = useTranslations('profileLayout').nav;
  const [tab, setTab] = useState<CatalogKind>('services');

  return (
    <CatalogActionsProvider>
      <section className='relative pt-2'>
        <ScrollReveal className='mb-7'>
          <h1 className='text-[clamp(30px,4vw,44px)] font-extrabold leading-[1.1] tracking-[-1.4px] text-[#1e2364]'>
            {nav.favorites}
          </h1>
        </ScrollReveal>
        <Tabs value={tab} onValueChange={(next) => setTab(next as CatalogKind)}>
          <TabsList
            variant='line'
            aria-label={t.tabsAriaLabel}
            className={profileTabListClass}
          >
            <TabsTrigger
              value='services'
              className={cn(profileTabTriggerClass, 'flex-initial')}
            >
              {t.tabs.services}
            </TabsTrigger>
            <TabsTrigger
              value='groups'
              className={cn(profileTabTriggerClass, 'flex-initial')}
            >
              {t.tabs.groups}
            </TabsTrigger>
          </TabsList>
          <TabsContent value='services' className='mt-4 outline-none'>
            <FavoritesCatalog kind='services' />
          </TabsContent>
          <TabsContent value='groups' className='mt-4 outline-none'>
            <FavoritesCatalog kind='groups' />
          </TabsContent>
        </Tabs>
      </section>
      <BasketBar />
    </CatalogActionsProvider>
  );
}
