'use client';

import { useState } from 'react';
import { CompanyCreateForm } from '@/modules/company/components/CompanyCreateForm';
import { RegisterForm } from './RegisterForm';

type FlowStep = 'register' | 'company';

export function RegisterFlow() {
  const [step, setStep] = useState<FlowStep>('register');

  if (step === 'company') {
    return <CompanyCreateForm />;
  }

  return <RegisterForm onComplete={() => setStep('company')} />;
}
