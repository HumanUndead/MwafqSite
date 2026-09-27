'use client';

import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import type { useFamilyAction } from '../hooks/useFamilyAction';

/** Renders the confirmation owned by `useFamilyAction`. */
export function FamilyActionDialog({
  action,
}: {
  action: ReturnType<typeof useFamilyAction>;
}) {
  return (
    <ConfirmDialog
      open={action.dialog !== null}
      title={action.dialog?.title ?? ''}
      message={action.dialog?.message}
      confirmLabel={action.dialog?.confirm ?? ''}
      cancelLabel={action.cancelLabel}
      destructive={action.dialog?.destructive}
      loading={action.busy}
      onConfirm={() => void action.confirm()}
      onCancel={action.cancel}
    />
  );
}
