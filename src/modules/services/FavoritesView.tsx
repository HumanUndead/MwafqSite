'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslations } from '@/i18n/DictionaryProvider';
import {
  PageHeader,
  productTabsListClass,
  productTabsTriggerClass,
} from '@/shared/components/product';
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
      <PageHeader title={nav.favorites} description={t.favoritesSubtitle} />
      <Tabs value={tab} onValueChange={(next) => setTab(next as CatalogKind)}>
        <TabsList
          variant='line'
          aria-label={t.tabsAriaLabel}
          className={cn(
            productTabsListClass,
            // shadcn sets h-8 via a group variant; plain h-auto loses to it.
            'group-data-[orientation=horizontal]/tabs:h-auto'
          )}
        >
          <TabsTrigger value='services' className={productTabsTriggerClass}>
            {t.tabs.services}
          </TabsTrigger>
          <TabsTrigger value='groups' className={productTabsTriggerClass}>
            {t.tabs.groups}
          </TabsTrigger>
        </TabsList>
        <TabsContent value='services' className='mt-3'>
          <FavoritesCatalog kind='services' />
        </TabsContent>
        <TabsContent value='groups' className='mt-3'>
          <FavoritesCatalog kind='groups' />
        </TabsContent>
      </Tabs>
      <BasketBar />
    </CatalogActionsProvider>
  );
}
