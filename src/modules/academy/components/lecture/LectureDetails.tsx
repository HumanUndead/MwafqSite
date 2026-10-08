'use client';

import { Download, FileText } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Dictionary } from '@/locales/types';
import {
  EmptyState,
  Panel,
  productCountClass,
  productTabsListClass,
  productTabsTriggerClass,
} from '@/shared/components/product';
import { buttonVariants } from '@/shared/components/ui/Button';
import { cn } from '@/shared/lib/cn';
import { attachmentUrl } from '@/shared/lib/media';
import { safeHtml } from '@/shared/lib/safeHtml';

export type LectureTab = 'overview' | 'resources';

export interface LectureResource {
  id: string;
  name: string;
  path: string;
}

const proseClass =
  'prose prose-sm max-w-none leading-7 text-[#1e2364] prose-headings:text-[#1e2364] prose-a:text-[#0077ad] prose-strong:text-[#1e2364] sm:prose-base';

/** Lecture description + text content, and downloadable attachments. */
export function LectureDetails({
  activeTab,
  onTabChange,
  description,
  textContent,
  resources,
  labels: t,
}: {
  activeTab: LectureTab;
  onTabChange: (tab: LectureTab) => void;
  description?: string | null;
  textContent?: string | null;
  resources: LectureResource[];
  labels: Dictionary['academyLecture'];
}) {
  return (
    <Panel className='pt-2 sm:pt-3'>
      <Tabs value={activeTab} onValueChange={(value) => onTabChange(value as LectureTab)}>
        <TabsList variant='line' aria-label={t.lecture} className={productTabsListClass}>
          <TabsTrigger value='overview' className={productTabsTriggerClass}>
            {t.overview}
          </TabsTrigger>
          <TabsTrigger value='resources' className={productTabsTriggerClass}>
            {t.resources}
            {resources.length > 0 ? (
              <span className={productCountClass}>{resources.length}</span>
            ) : null}
          </TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='pt-4'>
          <div
            className={proseClass}
            dangerouslySetInnerHTML={{ __html: safeHtml(description) || t.noDescription }}
          />
          {textContent ? (
            <div
              className={cn(proseClass, 'mt-6 border-t border-[#eef0f7] pt-6')}
              dangerouslySetInnerHTML={{ __html: safeHtml(textContent) }}
            />
          ) : null}
        </TabsContent>

        <TabsContent value='resources' className='pt-2'>
          {resources.length > 0 ? (
            <ul className='divide-y divide-[#eef0f7]'>
              {resources.map((resource) => (
                <li key={resource.id} className='flex items-center gap-3 py-3'>
                  <FileText className='size-5 shrink-0 text-[#6b7196]' aria-hidden />
                  <p className='min-w-0 flex-1 break-all text-[14px] font-semibold text-[#1e2364]'>
                    <bdi>{resource.name}</bdi>
                  </p>
                  <a
                    href={attachmentUrl(resource.path)}
                    target='_blank'
                    rel='noopener noreferrer'
                    aria-label={`${t.download} ${resource.name}`}
                    className={cn(
                      buttonVariants({ variant: 'productSecondary', size: 'compact' }),
                      'shrink-0'
                    )}
                  >
                    <Download className='size-4' aria-hidden />
                    <span className='max-sm:sr-only'>{t.download}</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title={t.noResources} className='py-8' />
          )}
        </TabsContent>
      </Tabs>
    </Panel>
  );
}
