'use client';

import type { Dictionary } from '@/locales/types';
import { B2BServicesMobileView } from './B2BServicesMobileView';
import { B2BServicesStack } from './B2BServicesStack';

interface Props {
  content: Dictionary['b2b']['services'];
  isRtl: boolean;
}

export function B2BServicesCards({ content, isRtl }: Props) {
  const cards = content.items.slice(0, 3);

  const sectionLabel = [content.titleLead, content.titleAccent]
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <B2BServicesMobileView
        cards={cards}
        dashboard={content.dashboard}
        isRtl={isRtl}
        sectionLabel={sectionLabel}
      />

      <div className='hidden lg:block'>
        <B2BServicesStack
          cards={cards}
          content={content}
          isRtl={isRtl}
          sectionLabel={sectionLabel}
        />
      </div>
    </>
  );
}
