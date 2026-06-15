'use client';

import { useEffect, useRef } from 'react';

export interface MoyasarPaymentResult {
  id: string;
  status: string;
  amount: number;
  currency: string;
  message?: string | null;
}

interface MoyasarInitConfig {
  element: HTMLElement | string;
  amount: number;
  currency: string;
  description: string;
  publishable_api_key: string;
  callback_url: string;
  methods: string[];
  supported_networks?: string[];
  save_card?: boolean;
  language?: string;
  on_completed?: (payment: MoyasarPaymentResult) => void;
  on_failure?: (error: { message: string }) => void;
}

const MOYASAR_JS = 'https://cdn.moyasar.com/mpf/1.14.0/moyasar.js';
const MOYASAR_CSS = 'https://cdn.moyasar.com/mpf/1.14.0/moyasar.css';

type MoyasarFormProps = {
  publishableKey: string;
  amount: number;
  description: string;
  locale: string;
  onCompleted: (payment: MoyasarPaymentResult) => void;
  onFailure?: (message: string) => void;
};

export function MoyasarForm({
  publishableKey,
  amount,
  description,
  locale,
  onCompleted,
  onFailure,
}: MoyasarFormProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!publishableKey || !containerRef.current || initializedRef.current) return;

    if (!document.querySelector(`link[href="${MOYASAR_CSS}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = MOYASAR_CSS;
      document.head.appendChild(link);
    }

    function initForm() {
      if (!window.Moyasar || !containerRef.current) return;
      initializedRef.current = true;
      containerRef.current.innerHTML = '';
      const config: MoyasarInitConfig = {
        element: containerRef.current,
        amount,
        currency: 'SAR',
        description,
        publishable_api_key: publishableKey,
        callback_url: `${window.location.origin}/payment/callback`,
        methods: ['creditcard'],
        supported_networks: ['mada', 'visa', 'mastercard', 'amex'],
        save_card: false,
        language: locale === 'ar' ? 'ar' : 'en',
        on_completed: onCompleted,
        on_failure: (err: { message: string }) => onFailure?.(err.message ?? ''),
      };
      (window.Moyasar.init as (config: MoyasarInitConfig) => void)(config);
    }

    if (window.Moyasar) {
      initForm();
      return;
    }

    let script = document.querySelector<HTMLScriptElement>(`script[src="${MOYASAR_JS}"]`);
    if (!script) {
      script = document.createElement('script');
      script.src = MOYASAR_JS;
      document.head.appendChild(script);
    }
    script.addEventListener('load', initForm, { once: true });
  }, [publishableKey, amount, description, locale, onCompleted, onFailure]);

  return <div ref={containerRef} className='moyasar-form-container' />;
}
