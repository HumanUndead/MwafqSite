'use client';

import { useState } from 'react';

function WrenchIcon() {
  return (
    <svg
      className='h-16 w-16 text-[#1e2364]'
      fill='none'
      viewBox='0 0 24 24'
      stroke='currentColor'
      strokeWidth={1.5}
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.087 4.113'
      />
    </svg>
  );
}

function Spinner() {
  return (
    <span className='inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
  );
}

export default function GlobalErrorFallback({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [status, setStatus] = useState<'idle' | 'checking' | 'down'>('idle');

  const handleRetry = async () => {
    setStatus('checking');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
        signal: AbortSignal.timeout(10000),
      });
      if (res.ok || res.status >= 400) {
        reset();
        return;
      }
    } catch {
      // API still unreachable
    }
    setStatus('down');
  };

  return (
    <div className='flex min-h-screen flex-col items-center justify-center bg-[#f3f4f8] px-4'>
      <div className='w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-100'>
        <div className='mb-6 flex justify-center'>
          <div className='flex h-20 w-20 items-center justify-center rounded-full bg-[#1e2364]/5'>
            <WrenchIcon />
          </div>
        </div>
        <h1 className='mb-2 text-2xl font-bold text-[#1e2364]'>
          Something went wrong
        </h1>
        <p className='mb-8 text-sm leading-relaxed text-gray-600'>
          We&apos;re working on getting this fixed. Please try again in a
          moment.
        </p>

        {status === 'down' && (
          <p className='mb-4 text-sm font-medium text-red-600'>
            Still unable to reach the server. Please try again shortly.
          </p>
        )}

        <div className='flex flex-col gap-3'>
          <button
            onClick={handleRetry}
            disabled={status === 'checking'}
            className='inline-flex items-center justify-center gap-2 rounded-lg bg-[#1e2364] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2a3178] focus:outline-none focus:ring-2 focus:ring-[#1e2364] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {status === 'checking' ? (
              <>
                <Spinner />
                Retrying...
              </>
            ) : (
              'Try again'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
