import type { ReactNode } from 'react';
import { AcademyIcon } from './AcademyIcon';
import { BriefcaseIcon } from './BriefcaseIcon';
import { BuildingIcon } from './BuildingIcon';
import { CarIcon } from './CarIcon';
import { CertificateIcon } from './CertificateIcon';
import { StethoscopeIcon } from './StethoscopeIcon';

export function getServiceIconByKey(iconKey?: string | null): ReactNode {
  switch (iconKey) {
    case 'icon-pre-employment':
      return <BriefcaseIcon />;
    case 'icon-residency-exam':
      return <BuildingIcon />;
    case 'icon-municipality':
      return <CertificateIcon />;
    case 'icon-occupational-health':
      return <BriefcaseIcon />;
    case 'icon-medical-exam':
      return <StethoscopeIcon />;
    case 'icon-academy':
      return <AcademyIcon />;
    case 'icon-driving-license':
    default:
      return <CarIcon />;
  }
}
