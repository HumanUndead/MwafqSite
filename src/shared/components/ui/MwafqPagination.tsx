'use client';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import {
  ScrollReveal,
  type ScrollRevealProps,
} from '@/shared/components/motion/ScrollReveal';
import { paginationScrollReveal } from '@/shared/components/motion/revealPresets';

export type MwafqPaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  ariaLabel?: string;
  previousLabel?: string;
  nextLabel?: string;
  /** Max page buttons before ellipsis (default 7). */
  siblingCount?: number;
  /**
   * ScrollReveal behavior. Defaults to global {@link paginationScrollReveal}.
   * Pass `false` to render without animation.
   */
  reveal?: false | Omit<ScrollRevealProps, 'children'>;
};

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function getPaginationItems(
  current: number,
  total: number,
  siblingCount: number
): (number | 'ellipsis')[] {
  if (total <= 1) return [];

  const totalPageNumbers = siblingCount + 5;

  if (total <= totalPageNumbers) {
    return range(1, total);
  }

  const leftSibling = Math.max(current - siblingCount, 1);
  const rightSibling = Math.min(current + siblingCount, total);

  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < total - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftRange = range(1, 3 + 2 * siblingCount);
    return [...leftRange, 'ellipsis', total];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightRange = range(total - (3 + 2 * siblingCount) + 1, total);
    return [1, 'ellipsis', ...rightRange];
  }

  if (showLeftEllipsis && showRightEllipsis) {
    const middleRange = range(leftSibling, rightSibling);
    return [1, 'ellipsis', ...middleRange, 'ellipsis', total];
  }

  return range(1, total);
}

export function MwafqPagination({
  page,
  totalPages,
  onPageChange,
  className,
  ariaLabel = 'Pagination',
  previousLabel = 'Go to previous page',
  nextLabel = 'Go to next page',
  siblingCount = 1,
  reveal = paginationScrollReveal,
}: MwafqPaginationProps) {
  if (totalPages <= 1) return null;

  const items = getPaginationItems(page, totalPages, siblingCount);

  const pagination = (
    <Pagination
      aria-label={ariaLabel}
      className={cn('mt-14 w-auto', className)}
    >
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            aria-label={previousLabel}
            disabled={page <= 1}
            onClick={() => onPageChange(Math.max(1, page - 1))}
            className='disabled:pointer-events-none disabled:opacity-40'
          />
        </PaginationItem>

        {items.map((item, index) =>
          item === 'ellipsis' ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink
                isActive={item === page}
                onClick={() => onPageChange(item)}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          )
        )}

        <PaginationItem>
          <PaginationNext
            aria-label={nextLabel}
            disabled={page >= totalPages}
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            className='disabled:pointer-events-none disabled:opacity-40'
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );

  if (!reveal) {
    return pagination;
  }

  const { className: revealClassName, ...revealRest } = reveal;

  return (
    <ScrollReveal
      className={cn('flex w-full justify-center', revealClassName)}
      {...paginationScrollReveal}
      {...revealRest}
    >
      {pagination}
    </ScrollReveal>
  );
}
