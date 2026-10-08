'use client';

import { cn } from '@/shared/lib/cn';
import { modalVariants } from '@/shared/lib/variants';
import type { VariantProps } from 'class-variance-authority';
import { useEffect, useId, useRef, type ReactNode } from 'react';

interface ModalProps extends VariantProps<typeof modalVariants> {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** Id of a heading rendered by the children, when `title` isn't used. */
  ariaLabelledBy?: string;
  children: ReactNode;
  className?: string;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({
  open,
  onClose,
  title,
  ariaLabelledBy,
  children,
  size,
  className,
}: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Esc closes, Tab stays inside, focus returns to the opener on close.
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    if (panel && !panel.contains(document.activeElement)) {
      (panel.querySelector<HTMLElement>('[autofocus]') ??
        panel.querySelector<HTMLElement>(FOCUSABLE) ??
        panel
      ).focus();
    }

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab' || !panel) return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      opener?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div
        className='absolute inset-0 bg-[#0f1238]/50'
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panelRef}
        role='dialog'
        aria-modal='true'
        aria-labelledby={title ? titleId : ariaLabelledBy}
        tabIndex={-1}
        className={cn(
          modalVariants({ size }),
          'max-h-[calc(100dvh-2rem)] overflow-y-auto outline-none',
          className
        )}
      >
        {title && (
          <h2 id={titleId} className='mb-4 text-xl font-bold text-[#1e2364]'>
            {title}
          </h2>
        )}
        {children}
      </div>
    </div>
  );
}
