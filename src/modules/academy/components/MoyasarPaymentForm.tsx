'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    Moyasar?: {
      init: (config: MoyasarConfig) => void;
    };
  }
}

interface MoyasarPayment {
  id: string;
  status: string;
  amount: number;
  currency: string;
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
  on_completed?: (payment: MoyasarPayment) => Promise<void>;
}

const MOYASAR_CSS =
  'https://cdn.jsdelivr.net/npm/moyasar-payment-form@2.2.7/dist/moyasar.css';
const MOYASAR_JS =
  'https://cdn.jsdelivr.net/npm/moyasar-payment-form@2.2.7/dist/moyasar.umd.min.js';

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}

function loadCss(href: string): void {
  if (document.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

interface MoyasarPaymentFormProps {
  publishableKey: string;
  /** Amount in SAR (converted to halalas internally). */
  amountSar: number;
  description: string;
  pendingTransactionId: string;
  userId: string;
  callbackUrl: string;
  loadingLabel: string;
  errorLabel: string;
}

export function MoyasarPaymentForm({
  publishableKey,
  amountSar,
  description,
  pendingTransactionId,
  userId,
  callbackUrl,
  loadingLabel,
  errorLabel,
}: MoyasarPaymentFormProps) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(
    'loading'
  );
  const [errorMsg, setErrorMsg] = useState('');
  const initialised = useRef(false);

  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;

    async function bootstrap() {
      try {
        loadCss(MOYASAR_CSS);
        await loadScript(MOYASAR_JS);

        if (!window.Moyasar) {
          throw new Error(
            'Moyasar script loaded but window.Moyasar is missing'
          );
        }

        window.Moyasar.init({
          element: '.mysr-form',
          amount: Math.round(amountSar * 100),
          currency: 'SAR',
          description,
          publishable_api_key: publishableKey,
          callback_url: callbackUrl,
          supported_networks: ['visa', 'mastercard', 'mada'],
          methods: ['creditcard'],
          on_completed: async (payment: MoyasarPayment) => {
            sessionStorage.setItem('mwafq_pending_tx', pendingTransactionId);
            sessionStorage.setItem('mwafq_user_id', userId);
            sessionStorage.setItem('mwafq_moyasar_payment_id', payment.id);
          },
        });

        setStatus('ready');
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : errorLabel);
        setStatus('error');
      }
    }

    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className='w-full'>
      {status === 'loading' && (
        <div className='flex flex-col items-center justify-center gap-4 py-12'>
          <Loader2 className='size-8 animate-spin text-[#00a8f1]' />
          <p className='text-sm font-medium text-gray-500'>{loadingLabel}</p>
        </div>
      )}

      {status === 'error' && (
        <div className='flex flex-col items-center justify-center gap-3 py-8 text-center'>
          <p className='font-semibold text-red-500'>{errorLabel}</p>
          <p className='text-xs text-gray-400'>{errorMsg}</p>
        </div>
      )}

      <div className={`mysr-form ${status !== 'ready' ? 'hidden' : ''}`} />
    </div>
  );
}
