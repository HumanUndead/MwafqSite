'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Lock } from 'lucide-react';

import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { SarIcon } from '@/shared/components/icons/booking/SarIcon';
import { cn } from '@/shared/lib/cn';
import {
  processMoyasarPayment,
  type MoyasarDirectPaymentResult,
} from '@/modules/services/api/paymentApi';

type CardBrand = 'visa' | 'mastercard' | 'mada' | 'amex' | null;

function detectBrand(num: string): CardBrand {
  const n = num.replace(/\s/g, '');
  if (/^4/.test(n)) return 'visa';
  if (/^5[1-5]/.test(n) || /^2[2-7]\d{2}/.test(n)) return 'mastercard';
  if (/^(9[0-9])/.test(n)) return 'mada';
  if (/^3[47]/.test(n)) return 'amex';
  return null;
}

function formatCardNumber(value: string): string {
  return value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

function maskNumber(num: string): string {
  const clean = num.replace(/\s/g, '');
  const padded = clean.padEnd(16, '•');
  return [
    padded.slice(0, 4),
    padded.slice(4, 8),
    padded.slice(8, 12),
    padded.slice(12, 16),
  ].join(' ');
}

function BrandBadge({ brand }: { brand: CardBrand }) {
  if (!brand) return null;
  const map: Record<
    NonNullable<CardBrand>,
    { label: string; className: string }
  > = {
    visa: {
      label: 'VISA',
      className: 'font-black italic tracking-tight text-[#1a1f71]',
    },
    mastercard: { label: 'MC', className: 'font-black text-[#eb001b]' },
    mada: { label: 'mada', className: 'font-bold text-[#1b3c6e]' },
    amex: { label: 'AMEX', className: 'font-bold text-[#007bc1]' },
  };
  const { label, className } = map[brand];
  return (
    <span
      className={cn(
        'inline-flex h-7 items-center rounded-md bg-white px-2 text-[13px] shadow',
        className
      )}
    >
      {label}
    </span>
  );
}

type CreditCardFormProps = {
  publishableKey: string;
  amount: number;
  description: string;
  payLabel: string;
  payingLabel: string;
  errorLabel: string;
  labels: {
    cardNumber: string;
    cardHolder: string;
    expiryDate: string;
    cvv: string;
    secureNote: string;
  };
  onCompleted: (result: MoyasarDirectPaymentResult) => void;
  onFailure: (message: string) => void;
};

export function CreditCardForm({
  publishableKey,
  amount,
  description,
  payLabel,
  payingLabel,
  errorLabel,
  labels,
  onCompleted,
  onFailure,
}: CreditCardFormProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cvvFocused, setCvvFocused] = useState(false);

  const brand = detectBrand(cardNumber);
  const displayAmount = (amount / 100).toFixed(2);
  const canPay =
    cardNumber.replace(/\s/g, '').length >= 13 &&
    !!cardHolder.trim() &&
    expiry.length === 5 &&
    cvv.length >= 3;

  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: () => {
      const [month, year] = expiry.split('/');
      return processMoyasarPayment({
        publishableKey,
        amount,
        description,
        callbackUrl: `${window.location.origin}/payment/callback`,
        name: cardHolder.trim(),
        number: cardNumber.replace(/\s/g, ''),
        cvc: cvv,
        month: month ?? '',
        year: year ?? '',
      });
    },
    onSuccess: onCompleted,
    onError: (err) => {
      onFailure(err instanceof Error ? err.message : errorLabel);
    },
  });

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    if (!canPay || isPending) return;
    reset();
    mutate();
  }

  const formError = error instanceof Error ? error.message : null;

  return (
    <form onSubmit={handleSubmit} className='space-y-4' noValidate>
      {/* Card visual */}
      <div className='perspective-1000 relative mx-auto h-44 w-full max-w-[320px]'>
        <AnimatePresence initial={false} mode='wait'>
          {!cvvFocused ? (
            <motion.div
              key='front'
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -90, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className='absolute inset-0 rounded-2xl bg-linear-to-br from-[#1e2364] via-[#2b3580] to-[#00a8f1] p-5 text-white shadow-xl'
              style={{
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
              }}
            >
              {/* Chip */}
              <div className='mb-3 flex items-center justify-between'>
                <div className='flex size-8 items-center justify-center rounded-md bg-yellow-300/80'>
                  <div className='size-5 rounded-sm border border-yellow-500/50 bg-yellow-400/60' />
                </div>
                <BrandBadge brand={brand} />
              </div>
              {/* Number */}
              <p className='mb-4 font-mono text-[18px] tracking-[0.22em] text-white/90'>
                {maskNumber(cardNumber)}
              </p>
              {/* Holder + Expiry */}
              <div className='flex items-end justify-between'>
                <div>
                  <p className='text-[9px] uppercase tracking-widest text-white/50'>
                    Card Holder
                  </p>
                  <p className='truncate text-[13px] font-semibold uppercase tracking-wide'>
                    {cardHolder.trim() || 'YOUR NAME'}
                  </p>
                </div>
                <div className='text-right'>
                  <p className='text-[9px] uppercase tracking-widest text-white/50'>
                    Expires
                  </p>
                  <p className='text-[13px] font-semibold tracking-wider'>
                    {expiry || 'MM/YY'}
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key='back'
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: -90, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className='absolute inset-0 rounded-2xl bg-linear-to-br from-[#1e2364] via-[#2b3580] to-[#00a8f1] shadow-xl'
              style={{
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
              }}
            >
              {/* Magnetic stripe */}
              <div className='mt-6 h-10 bg-black/50' />
              {/* CVC strip */}
              <div className='mx-5 mt-4 flex items-center justify-end rounded-md bg-white/90 px-4 py-2'>
                <span className='font-mono text-[13px] tracking-widest text-gray-800'>
                  {cvv.replace(/./g, '•') || '•••'}
                </span>
              </div>
              <p className='mt-2 px-5 text-right text-[10px] text-white/50'>
                CVC / CVV
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Inputs */}
      <Input
        label={labels.cardNumber}
        placeholder='1234 5678 9012 3456'
        value={cardNumber}
        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
        inputMode='numeric'
        autoComplete='cc-number'
        maxLength={19}
      />

      <Input
        label={labels.cardHolder}
        placeholder='John Doe'
        value={cardHolder}
        onChange={(e) => setCardHolder(e.target.value)}
        autoComplete='cc-name'
      />

      <div className='grid grid-cols-2 gap-3'>
        <Input
          label={labels.expiryDate}
          placeholder='MM/YY'
          value={expiry}
          onChange={(e) => setExpiry(formatExpiry(e.target.value))}
          inputMode='numeric'
          autoComplete='cc-exp'
          maxLength={5}
        />
        <Input
          label={labels.cvv}
          placeholder='•••'
          value={cvv}
          type='password'
          onChange={(e) =>
            setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))
          }
          onFocus={() => setCvvFocused(true)}
          onBlur={() => setCvvFocused(false)}
          inputMode='numeric'
          autoComplete='cc-csc'
          maxLength={4}
        />
      </div>

      <AnimatePresence>
        {formError && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className='rounded-lg bg-red-50 px-3 py-2 text-[12.5px] font-medium text-red-600'
          >
            {formError}
          </motion.p>
        )}
      </AnimatePresence>

      <Button
        type='submit'
        variant='brand'
        size='lg'
        shape='pill'
        loading={isPending}
        disabled={isPending || !canPay}
        className='w-full gap-2'
      >
        <Lock className='size-3.5' aria-hidden />
        {isPending ? (
          payingLabel
        ) : (
          <span className='flex items-center gap-1'>
            {payLabel} {displayAmount}
            <SarIcon
              className='inline size-2.25'
              style={{ color: 'white' }}
              aria-hidden
            />
          </span>
        )}
      </Button>

      <p className='text-center text-[11px] text-[#6b7196]'>
        Powered by <span className='font-semibold text-[#1e2364]'>Moyasar</span>
      </p>
    </form>
  );
}
