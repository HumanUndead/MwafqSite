'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from '@/i18n/DictionaryProvider';
import { getLocalizedRoute } from '@/i18n/routing';
import type { Route } from '@/shared/constants/routes';

export function PricingSection() {
  const locale = useLocale();
  const t = useTranslations('landing').pricing;

  return (
    <section className='bg-gray-50 px-4 py-20 sm:px-6'>
      <div className='mx-auto max-w-7xl'>
        <div className='text-center'>
          <h2 className='text-3xl font-bold text-gray-900 sm:text-4xl'>
            {t.title}
          </h2>
          <p className='mt-4 text-lg text-gray-600'>{t.description}</p>
        </div>

        <div className='mt-12 grid gap-8 sm:grid-cols-3'>
          {t.plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 ${
                plan.highlight
                  ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-600'
                  : 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-100'
              }`}
            >
              <h3 className='text-xl font-bold'>{plan.name}</h3>
              <p
                className={`mt-2 text-sm ${plan.highlight ? 'text-blue-100' : 'text-gray-500'}`}
              >
                {plan.description}
              </p>
              <p className='mt-4 text-4xl font-bold'>{plan.price}</p>

              <ul className='mt-6 space-y-3'>
                {plan.features.map((feature) => (
                  <li key={feature} className='flex items-center gap-2 text-sm'>
                    <span>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <Link
                href={getLocalizedRoute(locale, plan.href as Route)}
                className={`mt-8 block rounded-lg px-6 py-3 text-center text-sm font-semibold transition-colors ${
                  plan.highlight
                    ? 'bg-white text-blue-600 hover:bg-blue-50'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
