'use client';

import { BookOpen, Download, FileText } from 'lucide-react';
import { useId, type KeyboardEvent, type ReactNode } from 'react';
import type { Dictionary } from '@/locales/types';
import { cn } from '@/shared/lib/cn';
import { attachmentUrl } from '@/shared/lib/media';
import { safeHtml } from '@/shared/lib/safeHtml';
import { GlassPanel } from '../ui/AcademyGlass';

export type LectureTab = 'overview' | 'resources';

export interface LectureResource {
  id: string;
  name: string;
  path: string;
}

const proseClass =
  'prose prose-sm max-w-none leading-relaxed text-[#1e2364]/85 prose-headings:text-[#1e2364] prose-a:text-[#0090d1] prose-strong:text-[#1e2364] sm:prose-base';

/** Tabbed glass panel: lecture description + text content, and attachments. */
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
  const baseId = useId();
  const tabs: Array<{ id: LectureTab; label: string; icon: ReactNode; count?: number }> = [
    { id: 'overview', label: t.overview, icon: <BookOpen className='size-4' aria-hidden /> },
    {
      id: 'resources',
      label: t.resources,
      icon: <Download className='size-4' aria-hidden />,
      count: resources.length,
    },
  ];

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const next: LectureTab = activeTab === 'overview' ? 'resources' : 'overview';
    onTabChange(next);
    document.getElementById(`${baseId}-tab-${next}`)?.focus();
  }

  return (
    <GlassPanel className='overflow-hidden'>
      <div
        role='tablist'
        aria-label={t.lecture}
        onKeyDown={onKeyDown}
        className='flex gap-1 border-b border-[#e5e7f0] px-3 pt-3 sm:px-5'
      >
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`${baseId}-tab-${tab.id}`}
              type='button'
              role='tab'
              aria-selected={active}
              aria-controls={`${baseId}-panel-${tab.id}`}
              tabIndex={active ? 0 : -1}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                '-mb-px inline-flex items-center gap-2 rounded-t-xl border-b-2 px-4 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a8f1]',
                active
                  ? 'border-[#00a8f1] text-[#1e2364]'
                  : 'border-transparent text-[#6b7196] hover:text-[#1e2364]'
              )}
            >
              {tab.icon}
              {tab.label}
              {tab.count ? (
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-bold',
                    active ? 'bg-[#00a8f1]/10 text-[#0090d1]' : 'bg-[#e5e7f0] text-[#6b7196]'
                  )}
                >
                  {tab.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div
        role='tabpanel'
        id={`${baseId}-panel-${activeTab}`}
        aria-labelledby={`${baseId}-tab-${activeTab}`}
        tabIndex={0}
        className='p-5 focus-visible:outline-none sm:p-8'
      >
        {activeTab === 'overview' ? (
          <div className='space-y-6'>
            <div
              className={proseClass}
              dangerouslySetInnerHTML={{
                __html: safeHtml(description) || t.noDescription,
              }}
            />
            {textContent && (
              <div
                className={cn(proseClass, 'border-t border-[#e5e7f0] pt-6')}
                dangerouslySetInnerHTML={{
                  __html: safeHtml(textContent),
                }}
              />
            )}
          </div>
        ) : (
          <div className='space-y-4'>
            <h3 className='text-base font-bold text-[#1e2364]'>
              {t.downloadResources}
            </h3>
            {resources.length > 0 ? (
              <ul className='divide-y divide-[#e5e7f0] overflow-hidden rounded-2xl bg-white/80 ring-1 ring-[#e5e7f0]'>
                {resources.map((resource) => (
                  <li
                    key={resource.id}
                    className='flex items-center justify-between gap-3 p-3 sm:p-4'
                  >
                    <div className='flex min-w-0 items-center gap-3'>
                      <span className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#00a8f1]/10'>
                        <FileText className='size-5 text-[#00a8f1]' aria-hidden />
                      </span>
                      <p className='truncate text-sm font-semibold text-[#1e2364]'>
                        {resource.name}
                      </p>
                    </div>
                    <a
                      href={attachmentUrl(resource.path)}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='inline-flex shrink-0 items-center gap-2 rounded-full bg-[#00a8f1] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0090d1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00a8f1] focus-visible:ring-offset-2'
                    >
                      <Download className='size-4' aria-hidden />
                      <span className='hidden sm:inline'>{t.download}</span>
                      <span className='sr-only sm:hidden'>{t.download}</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className='rounded-2xl border border-dashed border-[#e5e7f0] py-10 text-center text-sm text-[#6b7196]'>
                {t.noResources}
              </p>
            )}
          </div>
        )}
      </div>
    </GlassPanel>
  );
}
