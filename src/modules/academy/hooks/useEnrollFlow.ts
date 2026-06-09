'use client';

import { useState } from 'react';
import { useAuthStore } from '@/modules/auth/store/authStore';
import { ApiError } from '@/shared/lib/http';
import { academyLearnApi } from '../api/academyLearnApi';
import type { PaymentInitData } from '../types/payment.types';

/**
 * Orchestrates enroll -> start-payment. Reads the current user from the auth
 * store for the payment billing fields. Returns the payment init data on
 * success (Moyasar publishable key + pending transaction).
 */
export function useEnrollFlow() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [paymentInit, setPaymentInit] = useState<PaymentInitData | null>(null);

  async function proceed(
    courseId: number,
    selectedService: number,
    amount: number
  ): Promise<PaymentInitData | null> {
    if (!user) {
      setError('NOT_AUTHENTICATED');
      return null;
    }

    setProcessing(true);
    setError('');

    try {
      const enrollResponse = await academyLearnApi.enrollCourse(
        courseId,
        selectedService
      );
      const userCourseId = enrollResponse.data.userCourseId;

      const paymentResponse = await academyLearnApi.startCreditCardPayment({
        userCourseId,
        amount,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        city: user.cityName,
        address: user.address,
        country: user.countryName || 'SA',
      });

      setPaymentInit(paymentResponse.data);
      return paymentResponse.data;
    } catch (err) {
      setError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : 'PAYMENT_FAILED'
      );
      return null;
    } finally {
      setProcessing(false);
    }
  }

  function reset() {
    setPaymentInit(null);
    setError('');
    setProcessing(false);
  }

  return {
    user,
    isAuthenticated,
    processing,
    error,
    paymentInit,
    proceed,
    reset,
  };
}
