'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Spinner } from '@/shared/components/ui/Spinner';

interface MoyasarPayment {
  id: string;
  status: string;
}

interface MoyasarConfig {
  element: string;
  amount: number;
  currency: string;
  description: string;
  publishable_api_key: string;
  callback_url: string;
  supported_networks: string[];
  methods: string[];
  language?: string;
  on_completed?: (payment: MoyasarPayment) => Promise<void> | void;
}

interface MoyasarSdk {
  init: (config: MoyasarConfig) => void;
}

const moyasar = () =>
  (window as unknown as { Moyasar?: MoyasarSdk }).Moyasar;

const MOYASAR_VERSION = '2.2.7';
const MOYASAR_CSS = `https://cdn.jsdelivr.net/npm/moyasar-payment-form@${MOYASAR_VERSION}/dist/moyasar.css`;
const MOYASAR_JS = `https://cdn.jsdelivr.net/npm/moyasar-payment-form@${MOYASAR_VERSION}/dist/moyasar.umd.min.js`;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${src}"]`
    );
    if (existing && moyasar()) {
      resolve();
      return;
    }
    const script = existing ?? document.createElement('script');
    script.addEventListener('load', () => resolve(), { once: true });
    script.addEventListener('error', () => reject(new Error(src)), {
      once: true,
    });
    if (!existing) {
      script.src = src;
      script.async = true;
      document.head.appendChild(script);
    }
  });
}

function loadCss(href: string) {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

interface MoyasarFormProps {
  publishableKey: string;
  /** Amount in halalas. */
  amountHalalas: number;
  description: string;
  callbackUrl: string;
  language: string;
  loadingLabel: string;
  errorLabel: string;
  /** Called with the Moyasar payment id before 3-D Secure redirects away. */
  onCompleted: (paymentId: string) => void;
}

/**
 * Moyasar hosted card form. Handles 3-D Secure itself, then redirects to
 * `callbackUrl?id=<paymentId>&status=…`, where the charge is confirmed.
 */
export function MoyasarForm({
  publishableKey,
  amountHalalas,
  description,
  callbackUrl,
  language,
  loadingLabel,
  errorLabel,
  onCompleted,
}: MoyasarFormProps) {
  const reactId = useId();
  const elementClass = `mysr-form-${reactId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(
    'loading'
  );
  const initialised = useRef(false);
  const onCompletedRef = useRef(onCompleted);
  useEffect(() => {
    onCompletedRef.current = onCompleted;
  });

  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;

    (async () => {
      try {
        loadCss(MOYASAR_CSS);
        await loadScript(MOYASAR_JS);
        const sdk = moyasar();
        if (!sdk) throw new Error('Moyasar missing');
        sdk.init({
          element: `.${elementClass}`,
          amount: amountHalalas,
          currency: 'SAR',
          description,
          publishable_api_key: publishableKey,
          callback_url: callbackUrl,
          supported_networks: ['mada', 'visa', 'mastercard', 'amex'],
          methods: ['creditcard'],
          language,
          on_completed: (payment) => {
            onCompletedRef.current(payment.id);
          },
        });
        setStatus('ready');
      } catch {
        setStatus('error');
      }
    })();
  }, [
    amountHalalas,
    callbackUrl,
    description,
    elementClass,
    language,
    publishableKey,
  ]);

  return (
    <div className='w-full'>
      {status === 'loading' && (
        <div
          className='flex flex-col items-center justify-center gap-3 py-10'
          aria-live='polite'
        >
          <Spinner />
          <p className='text-sm text-[#6b7196]'>{loadingLabel}</p>
        </div>
      )}
      {status === 'error' && (
        <p className='py-8 text-center text-sm font-semibold text-red-600' role='alert'>
          {errorLabel}
        </p>
      )}
      <div
        dir='ltr'
        className={status === 'ready' ? elementClass : `${elementClass} hidden`}
      />
    </div>
  );
}
