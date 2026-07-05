'use client';

import { CompanyCreateForm } from '@/modules/company/components/CompanyCreateForm';
// import { useState } from 'react';
// import { useAuthStore } from '@/modules/auth/store/authStore';
// import { RegisterForm } from './RegisterForm';

// type FlowStep = 'register' | 'company';

export function RegisterFlow() {
  // const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  // const [completedRegister, setCompletedRegister] = useState(false);
  // const showCompany =
  //   initialStep === 'company' || completedRegister || isAuthenticated;
  //
  // if (showCompany) {
  //   return <CompanyCreateForm />;
  // }
  //
  // return <RegisterForm onComplete={() => setCompletedRegister(true)} />;
 
  return <CompanyCreateForm />;
}
