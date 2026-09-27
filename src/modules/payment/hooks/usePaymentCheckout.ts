'use client';

import { useCallback, useRef, useState } from 'react';
import { useTranslations } from '@/i18n/DictionaryProvider';
import { useFeatureToggle } from '@/shared/hooks/useFeatureToggles';
import { ApiError } from '@/shared/lib/http';
import { paymentApi } from '../api/paymentApi';
import { paymentErrorKey } from '../paymentOutcome.shared';
import { usePendingPaymentStore } from '../store/pendingPaymentStore';
import type {
  CreateClientOrderPayload,
  PaymentTarget,
} from '../types/payment.types';

export interface PaymentFormSession {
  pubKey: string;
  /** Server amount in SAR (major units). */
  amount: number;
  pendingTransactionId: string;
  description: string;
  callbackUrl: string;
}

export type PaymentCheckoutPhase =
  | 'idle'
  | 'preparing'
  | 'form'
  | 'gatewayDisabled'
  | 'expired';

export interface StartPaymentArgs {
  /** Order to create. Ignored when `clientOrderId` is given. */
  order?: CreateClientOrderPayload;
  /** Pay an existing order / user course (resume). */
  clientOrderId?: string;
  targetType: PaymentTarget;
  description: string;
}

interface Options {
  /** Localized callback path, e.g. `/en/checkout/payment/callback`. */
  callbackPath: string;
}

function isUsableServerMessage(message: string | undefined): boolean {
  return !!message && !/^missing resource/i.test(message.trim());
}

/**
 * Orchestrates a card payment: create order → open pending transaction →
 * show the Moyasar form. The order id is reused while the order is unchanged,
 * so a retry after a decline pays the same order.
 */
export function usePaymentCheckout({ callbackPath }: Options) {
  const t = useTranslations('payment');
  const gatewayEnabled = useFeatureToggle('paymentGateway');
  const startPendingPayment = usePendingPaymentStore(
    (state) => state.startPendingPayment
  );

  const [phase, setPhase] = useState<PaymentCheckoutPhase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<PaymentFormSession | null>(null);
  const orderRef = useRef<{ key: string; clientOrderId: string } | null>(null);

  const toMessage = useCallback(
    (err: unknown, fallback: string): string => {
      if (err instanceof ApiError) {
        const key = paymentErrorKey(err.code);
        if (key) return t.errors[key];
        if (isUsableServerMessage(err.message)) return err.message;
      }
      return fallback;
    },
    [t]
  );

  const start = useCallback(
    async ({ order, clientOrderId, targetType, description }: StartPaymentArgs) => {
      setError(null);
      if (!gatewayEnabled) {
        setPhase('gatewayDisabled');
        return;
      }
      setPhase('preparing');

      let orderId = clientOrderId ?? null;
      if (!orderId && order) {
        const key = JSON.stringify(order);
        if (orderRef.current?.key === key) {
          orderId = orderRef.current.clientOrderId;
        } else {
          try {
            const created = await paymentApi.createOrder(order);
            orderId = created.data.clientOrderId;
            orderRef.current = { key, clientOrderId: orderId };
          } catch (err) {
            setError(toMessage(err, t.errors.orderFailed));
            setPhase('idle');
            return;
          }
        }
      }
      if (!orderId) {
        setError(t.errors.targetMissing);
        setPhase('idle');
        return;
      }

      try {
        const { data } = await paymentApi.startCard(orderId);
        if (!(data.amount > 0) || !data.pubKey) {
          setError(t.errors.amountUnavailable);
          setPhase('idle');
          return;
        }
        startPendingPayment({
          pendingTransactionId: data.pendingTransactionId,
          targetType,
          targetId: orderId,
          amount: data.amount,
        });
        const callback = new URL(callbackPath, window.location.origin);
        callback.searchParams.set('pt', data.pendingTransactionId);
        setSession({
          pubKey: data.pubKey,
          amount: data.amount,
          pendingTransactionId: data.pendingTransactionId,
          description: description.trim() || t.reservationDescription,
          callbackUrl: callback.toString(),
        });
        setPhase('form');
      } catch (err) {
        setError(toMessage(err, t.errors.generic));
        setPhase('idle');
      }
    },
    [callbackPath, gatewayEnabled, startPendingPayment, t, toMessage]
  );

  const close = useCallback(() => {
    setSession(null);
    setPhase('idle');
  }, []);

  const expire = useCallback(() => {
    setSession(null);
    setPhase('expired');
  }, []);

  return { phase, error, session, start, close, expire, setError };
}
