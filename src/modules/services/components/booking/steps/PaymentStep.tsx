'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { AnimatePresence, motion, type Variants } from 'framer-motion';
import {
  Building2,
  Calendar,
  Clock,
  CreditCard,
  RotateCcw,
} from 'lucide-react';
import dayjs from 'dayjs';

import { Button } from '@/shared/components/ui/Button';
import { Spinner } from '@/shared/components/ui/Spinner';
import { SarIcon } from '@/shared/components/icons/booking/SarIcon';
import { cn } from '@/shared/lib/cn';
import type { Locale } from '@/i18n/config';
import type {
  BookingTimeSlot,
  ServiceProviderBranch,
} from '@/modules/services/types/booking.types';
import type { User } from '@/shared/types/user.types';
import { submitReservation } from '@/modules/services/api/bookingApi';
import {
  checkPaymentStatus,
  initCreditCardPayment,
  type MoyasarDirectPaymentResult,
} from '@/modules/services/api/paymentApi';
import { CreditCardForm } from './CreditCardForm';

export type PaymentStepLabels = {
  title: string;
  subtitle: string;
  facility: string;
  date: string;
  services: string;
  basePrice: string;
  tax: string;
  total: string;
  payNow: string;
  processing: string;
  sar: string;
  dialog: {
    title: string;
    secureNote: string;
    cardNumber: string;
    cardHolder: string;
    expiryDate: string;
    cvv: string;
    pay: string;
    cancel: string;
    paying: string;
  };
  error: string;
  reservationError: string;
};

type PaymentStepProps = {
  locale: Locale;
  selectedBranch: ServiceProviderBranch;
  selectedDate: string;
  selectedSlots: BookingTimeSlot[];
  selectedCourseId: number | null;
  user: User;
  onPaymentSuccess: () => void;
  labels: PaymentStepLabels;
};

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const row: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 280, damping: 28 },
  },
};

function formatSlotTime(iso: string) {
  return dayjs(iso).format('hh:mm A');
}

function PriceRow({
  label,
  amount,
  sar,
  bold,
}: {
  label: string;
  amount: number;
  sar: string;
  bold?: boolean;
}) {
  return (
    <motion.div
      variants={row}
      className={cn(
        'flex items-center justify-between py-1',
        bold && 'font-bold text-[#1e2364]'
      )}
    >
      <span
        className={cn(
          'text-[13.5px]',
          bold ? 'text-[#1e2364]' : 'text-[#6b7196]'
        )}
      >
        {label}
      </span>
      <span className='flex items-center gap-1'>
        <span
          className={cn(
            'text-[13.5px]',
            bold ? 'text-[15px] text-[#1e2364]' : 'text-[#1e2364]'
          )}
        >
          {amount.toFixed(2)}
        </span>
        <SarIcon
          className={cn('inline-block', bold ? 'size-[11px]' : 'size-[9px]')}
          style={{ color: '#1e2364' }}
          aria-label={sar}
        />
      </span>
    </motion.div>
  );
}

export function PaymentStep({
  locale,
  selectedBranch,
  selectedDate,
  selectedSlots,
  selectedCourseId,
  user,
  onPaymentSuccess,
  labels,
}: PaymentStepProps) {
  const basePrice = selectedSlots.reduce((sum, s) => sum + (s.price ?? 0), 0);
  const taxAmount = selectedSlots.reduce(
    (sum, s) => sum + (s.taxPrice ?? 0),
    0
  );
  const totalWithTax = basePrice + taxAmount;
  const amountInHalalas = Math.round(totalWithTax * 100);

  const serviceDescription = selectedSlots
    .map((s) => s.serviceName ?? s.serviceGroupName)
    .filter(Boolean)
    .join(', ');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pendingTransactionId, setPendingTransactionId] = useState('');
  const [pubKey, setPubKey] = useState('');
  const [reservationId, setReservationId] = useState<string | number>('');

  const [payError, setPayError] = useState<string | null>(null);

  const checkPaymentMutation = useMutation({
    mutationFn: async (payment: MoyasarDirectPaymentResult) => {
      const ok = await checkPaymentStatus({
        userId: user.id,
        paymentId: payment.id,
        pendingTransactionId,
        reservationId,
      });
      if (!ok) {
        throw new Error(labels.error);
      }
      return ok;
    },
    onSuccess() {
      setDialogOpen(false);
      onPaymentSuccess();
    },
    onError(error) {
      setPayError(
        error instanceof Error && error.message
          ? error.message
          : labels.error
      );
    },
  });

  const verifying = checkPaymentMutation.isPending;

  const initials =
    `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

  async function handleOpenPayment() {
    setError(null);
    setSubmitting(true);

    try {
      const reservationId = await submitReservation({
        serviceProviderBranchId: selectedBranch.id,
        dateChosen: dayjs(selectedDate).toJSON(),
        ownerId: user.id,
        slots: selectedSlots,
        courseId: selectedCourseId ?? undefined,
      });

      setReservationId(reservationId);

      const { pendingTransactionId: ptxId, pubKey: pk } =
        await initCreditCardPayment({
          userId: user.id,
          amount: amountInHalalas,
          reservationId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          address: user.address,
          city: user.cityName,
          country: user.countryName,
          postCode: user.postCode,
          targetType: 1,
          targetId: reservationId,
        });

      setPendingTransactionId(ptxId);
      setPubKey(pk);
      setPayError(null);
      checkPaymentMutation.reset();
      setDialogOpen(true);
    } catch {
      setError(labels.reservationError);
    } finally {
      setSubmitting(false);
    }
  }

  function handleCardCompleted(payment: MoyasarDirectPaymentResult) {
    setPayError(null);
    checkPaymentMutation.mutate(payment);
  }

  function handleCardFailure(message: string) {
    setPayError(message || labels.error);
  }

  return (
    <>
      <motion.div
        variants={container}
        initial='hidden'
        animate='show'
        className='space-y-4'
      >
        {/* User card */}
        <motion.div
          variants={row}
          className='flex items-center gap-3 rounded-xl border border-[#e5e7f0] bg-[#f7f8fc] px-4 py-3'
        >
          <div className='flex size-10 shrink-0 items-center justify-center rounded-full bg-[#1e2364] text-[13px] font-bold text-white'>
            {initials}
          </div>
          <div>
            <p className='text-[14px] font-bold text-[#1e2364]'>
              {user.firstName} {user.lastName}
            </p>
            {user.email && (
              <p className='text-[12px] text-[#6b7196]'>{user.email}</p>
            )}
          </div>
        </motion.div>

        {/* Facility + date */}
        <motion.div
          variants={row}
          className='space-y-2 rounded-xl border border-[#e5e7f0] bg-white px-4 py-3'
        >
          <div className='flex items-center gap-2 text-[13.5px] text-[#3d4470]'>
            <Building2 className='size-4 shrink-0 text-[#00a8f1]' aria-hidden />
            <span className='font-semibold text-[#1e2364]'>
              {labels.facility}:
            </span>
            <span>{selectedBranch.name}</span>
          </div>
          <div className='flex items-center gap-2 text-[13.5px] text-[#3d4470]'>
            <Calendar className='size-4 shrink-0 text-[#00a8f1]' aria-hidden />
            <span className='font-semibold text-[#1e2364]'>{labels.date}:</span>
            <span>{dayjs(selectedDate).format('D MMM YYYY')}</span>
          </div>
        </motion.div>

        {/* Services list */}
        <motion.div
          variants={row}
          className='rounded-xl border border-[#e5e7f0] bg-white px-4 py-3'
        >
          <p className='mb-2 text-[13px] font-semibold text-[#1e2364]'>
            {labels.services}
          </p>
          <ul className='space-y-2'>
            {selectedSlots.map((slot, i) => (
              <li
                key={slot.slotTimeId ?? i}
                className='flex items-center justify-between rounded-lg bg-[#f7f8fc] px-3 py-2'
              >
                <div>
                  <p className='text-[13px] font-medium text-[#3d4470]'>
                    {slot.serviceName ?? slot.serviceGroupName ?? '—'}
                  </p>
                  <div className='mt-0.5 flex items-center gap-1 text-[11.5px] text-[#6b7196]'>
                    <Clock className='size-3' aria-hidden />
                    <span>
                      {formatSlotTime(slot.from)} – {formatSlotTime(slot.to)}
                    </span>
                  </div>
                </div>
                <span className='flex items-center gap-1 text-[13px] font-bold text-[#1e2364]'>
                  {(slot.price ?? 0).toFixed(2)}
                  <SarIcon
                    className='size-[9px]'
                    style={{ color: '#1e2364' }}
                    aria-hidden
                  />
                </span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Price breakdown */}
        <motion.div
          variants={container}
          className='rounded-xl border border-[#e5e7f0] bg-white px-4 py-3'
        >
          <PriceRow
            label={labels.basePrice}
            amount={basePrice}
            sar={labels.sar}
          />
          <PriceRow label={labels.tax} amount={taxAmount} sar={labels.sar} />
          <div className='my-2 border-t border-[#e5e7f0]' />
          <PriceRow
            label={labels.total}
            amount={totalWithTax}
            sar={labels.sar}
            bold
          />
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className='rounded-lg bg-red-50 px-4 py-3 text-[13px] font-medium text-red-600'
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Pay button */}
        <motion.div variants={row}>
          <Button
            variant='brand'
            size='lg'
            shape='pill'
            loading={submitting}
            disabled={submitting || amountInHalalas <= 0}
            onClick={handleOpenPayment}
            className='w-full gap-2'
          >
            <CreditCard className='size-4' aria-hidden />
            {submitting ? labels.processing : labels.payNow}
          </Button>
        </motion.div>
      </motion.div>

      {/* Payment modal */}
      <AnimatePresence>
        {dialogOpen && (
          <div className='fixed inset-0 z-300 flex items-center justify-center p-4'>
            {/* Backdrop */}
            <motion.div
              key='payment-backdrop'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className='absolute inset-0 bg-black/60 backdrop-blur-sm'
              onClick={() => {
                if (!verifying) setDialogOpen(false);
              }}
            />

            {/* Modal panel */}
            <motion.div
              key='payment-panel'
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{
                type: 'spring' as const,
                stiffness: 320,
                damping: 28,
              }}
              className='relative z-10 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl'
            >
              {/* Header */}
              <div className='flex items-center gap-3 bg-[#1e2364] px-6 py-5'>
                <motion.div
                  initial={{ rotate: -20, scale: 0.7 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{
                    type: 'spring' as const,
                    stiffness: 300,
                    damping: 20,
                    delay: 0.12,
                  }}
                  className='flex size-10 shrink-0 items-center justify-center rounded-full bg-white/20'
                >
                  <CreditCard className='size-5 text-white' aria-hidden />
                </motion.div>
                <div className='flex-1'>
                  <p className='text-[15px] font-bold text-white'>
                    {labels.dialog.title}
                  </p>
                  <p className='mt-0.5 flex items-center gap-1 text-[12px] text-white/70'>
                    {totalWithTax.toFixed(2)}
                    <SarIcon
                      className='inline size-[9px]'
                      style={{ color: 'white' }}
                      aria-hidden
                    />
                  </p>
                </div>
                {!verifying && (
                  <button
                    onClick={() => setDialogOpen(false)}
                    className='flex size-7 items-center justify-center rounded-full bg-white/10 text-white/70 transition hover:bg-white/20 hover:text-white'
                    aria-label='Close'
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Body */}
              <div className='px-6 py-5'>
                {verifying ? (
                  <div className='flex flex-col items-center gap-3 py-8'>
                    <Spinner size='lg' />
                    <p className='text-[13px] text-[#6b7196]'>
                      {labels.dialog.paying}
                    </p>
                  </div>
                ) : payError ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='flex flex-col items-center gap-4 py-6 text-center'
                  >
                    <p className='rounded-lg bg-red-50 px-4 py-3 text-[13px] font-medium text-red-600'>
                      {payError}
                    </p>
                    <Button
                      variant='outline'
                      size='sm'
                      shape='pill'
                      onClick={() => setPayError(null)}
                      className='gap-2'
                    >
                      <RotateCcw className='size-3.5' aria-hidden />
                      Try again
                    </Button>
                  </motion.div>
                ) : pubKey ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className='space-y-4'
                  >
                    <CreditCardForm
                      publishableKey={pubKey}
                      amount={amountInHalalas}
                      description={serviceDescription}
                      payLabel={labels.dialog.pay}
                      payingLabel={labels.dialog.paying}
                      errorLabel={labels.error}
                      labels={{
                        cardNumber: labels.dialog.cardNumber,
                        cardHolder: labels.dialog.cardHolder,
                        expiryDate: labels.dialog.expiryDate,
                        cvv: labels.dialog.cvv,
                        secureNote: labels.dialog.secureNote,
                      }}
                      onCompleted={handleCardCompleted}
                      onFailure={handleCardFailure}
                    />
                  </motion.div>
                ) : null}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
