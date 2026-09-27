/** `payment` namespace: shared checkout payment (services + academy). */
const paymentEn = {
  dialogTitle: 'Payment',
  amountDue: 'Amount due',
  securedNote: 'Secured payment',
  poweredBy: 'Card payments are processed securely by Moyasar.',
  loadingForm: 'Loading secure payment form…',
  formError: 'The payment form could not be loaded. Please try again.',
  close: 'Close',
  preparing: 'Preparing your payment…',
  reservationDescription: 'Medical appointment reservation',
  courseDescription: 'Course payment',
  sessionExpiredTitle: 'Session expired',
  sessionExpired:
    'Your payment session has expired for your security. Please try again.',
  gatewayDisabledTitle: 'Payments Temporarily Unavailable',
  gatewayDisabled:
    "Online payment has been turned off by the administrator, so this payment can't be completed right now. Nothing has been charged. Your booking details are saved — please try again later or contact support.",
  errors: {
    generic: 'Something went wrong while starting the payment. Please try again.',
    orderFailed: "We couldn't create your order. Please try again.",
    amountUnavailable: "We couldn't get the amount to charge. Please try again.",
    alreadySettled: 'This payment has already been completed.',
    declined: 'The card was declined. Nothing was charged.',
    amountMismatch:
      "The payment was reversed because the amount didn't match. Please contact support.",
    notOwned: 'This payment belongs to a different account.',
    targetMissing:
      "We couldn't find what this payment is for. Please contact support.",
    unsupportedTarget: "This item can't be paid for right now.",
  },
  status: {
    metaTitle: 'Payment status',
    verifying: 'Verifying payment…',
    settledTitle: 'Payment Successful!',
    settledReservation:
      'Your reservation has been created successfully. You can follow it from My Reservations.',
    settledCourse:
      'Your course has been added successfully. You can start learning right away.',
    declinedTitle: 'Payment Failed',
    declined: 'The card was declined. Nothing was charged.',
    unverifiedTitle: 'Payment Not Confirmed',
    unverified:
      "We couldn't confirm your payment yet. Don't pay again — try confirming once more.",
    blockedTitle: 'Payment could not be completed',
    missingTitle: 'Payment information is missing',
    missing:
      "We couldn't find the payment to verify. If you were charged, it will be confirmed automatically.",
    confirmAgain: 'Confirm Again',
    tryAgain: 'Try again',
    continue: 'Continue',
    goToReservations: 'Go to My Reservations',
    goToCourses: 'Go to My Courses',
  },
  resume: {
    settled: 'A payment you started earlier has gone through. There is nothing else to do.',
    declined: 'A payment you started earlier was declined. Nothing was charged.',
  },
} as const;

export default paymentEn;
