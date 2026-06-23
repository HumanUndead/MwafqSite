'use client';

import { useState } from 'react';
import { CompanyCreateForm } from '@/modules/company/components/CompanyCreateForm';
import { useAuthStore } from '@/modules/auth/store/authStore';
import { RegisterForm } from './RegisterForm';

type FlowStep = 'register' | 'company';

interface RegisterFlowProps {
  initialStep?: FlowStep;
}

export function RegisterFlow({ initialStep = 'register' }: RegisterFlowProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [completedRegister, setCompletedRegister] = useState(false);

  const showCompany =
    initialStep === 'company' || completedRegister || isAuthenticated;

  if (showCompany) {
    return <CompanyCreateForm />;
  }

  return <RegisterForm onComplete={() => setCompletedRegister(true)} />;
}
