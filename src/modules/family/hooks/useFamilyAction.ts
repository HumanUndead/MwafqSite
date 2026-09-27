'use client';

import { useState } from 'react';
import { useTranslations } from '@/i18n/DictionaryProvider';
import { toast } from '@/shared/components/feedback/Toast';
import { ApiError } from '@/shared/lib/http';
import { RelatedUserStatus } from '../types/family.types';
import { useFamilyMutations } from './useFamily';

export type FamilyActionKind = 'remove' | 'cancelRequest' | 'accept' | 'reject';

interface PendingAction {
  kind: FamilyActionKind;
  relationId: number;
}

/** Confirm-then-run for unlink / cancel / accept / reject. */
export function useFamilyAction() {
  const t = useTranslations('family');
  const { remove, updateStatus } = useFamilyMutations();
  const [pending, setPending] = useState<PendingAction | null>(null);

  const copy: Record<
    FamilyActionKind,
    { title: string; message: string; confirm: string; done: string }
  > = {
    remove: {
      title: t.confirm.removeTitle,
      message: t.confirm.removeMessage,
      confirm: t.actions.remove,
      done: t.toasts.removed,
    },
    cancelRequest: {
      title: t.confirm.cancelRequestTitle,
      message: t.confirm.cancelRequestMessage,
      confirm: t.actions.cancelRequest,
      done: t.toasts.requestCancelled,
    },
    accept: {
      title: t.confirm.acceptTitle,
      message: t.confirm.acceptMessage,
      confirm: t.actions.accept,
      done: t.toasts.accepted,
    },
    reject: {
      title: t.confirm.rejectTitle,
      message: t.confirm.rejectMessage,
      confirm: t.actions.reject,
      done: t.toasts.rejected,
    },
  };

  async function run() {
    if (!pending) return;
    const { kind, relationId } = pending;
    try {
      if (kind === 'remove' || kind === 'cancelRequest') {
        await remove.mutateAsync(relationId);
      } else {
        await updateStatus.mutateAsync({
          id: relationId,
          status:
            kind === 'accept'
              ? RelatedUserStatus.Accepted
              : RelatedUserStatus.Rejected,
        });
      }
      toast.success(copy[kind].done);
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : t.errors.generic);
    } finally {
      setPending(null);
    }
  }

  return {
    request: (kind: FamilyActionKind, relationId: number) =>
      setPending({ kind, relationId }),
    dialog: pending
      ? {
          ...copy[pending.kind],
          destructive: pending.kind !== 'accept',
        }
      : null,
    busy: remove.isPending || updateStatus.isPending,
    confirm: run,
    cancel: () => setPending(null),
    cancelLabel: t.cancel,
  };
}
