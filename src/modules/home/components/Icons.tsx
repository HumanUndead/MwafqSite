import type { ReactNode } from 'react';

export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2.2'
      className={['h-4 w-4', className].filter(Boolean).join(' ')}
    >
      <path d='M5 12h14' />
      <path d='m12 5 7 7-7 7' />
    </svg>
  );
}

export function SearchIcon() {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2.2'
      className='h-4 w-4'
    >
      <circle cx='11' cy='11' r='8' />
      <path d='m21 21-4.35-4.35' />
    </svg>
  );
}

export function CarIcon() {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.9'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='h-8 w-8'
    >
      <path d='M5 16l1.2-4.1A2 2 0 0 1 8.12 10.5h7.76a2 2 0 0 1 1.92 1.4L19 16' />
      <path d='M4 16h16v2.2a.8.8 0 0 1-.8.8H18a1 1 0 0 1-1-1V16H7v2a1 1 0 0 1-1 1H4.8a.8.8 0 0 1-.8-.8z' />
      <circle cx='8' cy='16.5' r='1' fill='currentColor' stroke='none' />
      <circle cx='16' cy='16.5' r='1' fill='currentColor' stroke='none' />
    </svg>
  );
}

export function BuildingIcon() {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.9'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='h-8 w-8'
    >
      <path d='M4 20h16' />
      <path d='M7 20V6.8A1.8 1.8 0 0 1 8.8 5h6.4A1.8 1.8 0 0 1 17 6.8V20' />
      <path d='M10 9h.01M14 9h.01M10 12h.01M14 12h.01' />
      <path d='M11 20v-3h2v3' />
    </svg>
  );
}

export function CertificateIcon() {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.9'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='h-8 w-8'
    >
      <path d='M7 5.5h10A1.5 1.5 0 0 1 18.5 7v7A1.5 1.5 0 0 1 17 15.5H7A1.5 1.5 0 0 1 5.5 14V7A1.5 1.5 0 0 1 7 5.5Z' />
      <path d='M8.5 9.5h7M8.5 12h4.5' />
      <path d='M10 15.5v3l2-1.2 2 1.2v-3' />
    </svg>
  );
}

export function BriefcaseIcon() {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.9'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='h-8 w-8'
    >
      <rect x='4' y='7' width='16' height='11' rx='2' />
      <path d='M9 7V5.8A1.8 1.8 0 0 1 10.8 4h2.4A1.8 1.8 0 0 1 15 5.8V7' />
      <path d='M4 12h16' />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2.6'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='h-[18px] w-[18px]'
    >
      <polyline points='20 6 9 17 4 12' />
    </svg>
  );
}

export function StarIcon() {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='currentColor'
      className='h-3.5 w-3.5 text-[#00a8f1]'
      aria-hidden='true'
    >
      <polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26' />
    </svg>
  );
}

export function CalendarIcon() {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='h-5 w-5'
    >
      <rect x='3' y='4' width='18' height='18' rx='2' />
      <line x1='16' y1='2' x2='16' y2='6' />
      <line x1='8' y1='2' x2='8' y2='6' />
      <line x1='3' y1='10' x2='21' y2='10' />
    </svg>
  );
}

export function PdfIcon() {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2.1'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='h-5 w-5'
    >
      <path d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' />
      <polyline points='14 2 14 8 20 8' />
      <path d='M8 13h1.3a1.7 1.7 0 1 0 0-3.4H8V16' />
      <path d='M12 16v-6h1.2a2.3 2.3 0 0 1 0 4.6H12' />
      <path d='M17 13h-2.5' />
      <path d='M14.5 16v-6' />
    </svg>
  );
}

export function AppleIcon() {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='currentColor'
      className='h-5 w-5'
      aria-hidden='true'
    >
      <path d='M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z' />
    </svg>
  );
}

export function GooglePlayIcon() {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='currentColor'
      className='h-5 w-5'
      aria-hidden='true'
    >
      <path d='M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z' />
    </svg>
  );
}

export function EmailIcon() {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='h-4 w-4'
    >
      <path d='M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z' />
      <polyline points='22,6 12,13 2,6' />
    </svg>
  );
}

export function PhoneIcon() {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='h-4 w-4'
    >
      <path d='M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.17 3.38 2 2 0 0 1 3.15 1.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6.06 6.06l1.27-.64a2 2 0 0 1 2.11.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z' />
    </svg>
  );
}

export function LocationIcon() {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='h-4 w-4'
    >
      <path d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z' />
      <circle cx='12' cy='10' r='3' />
    </svg>
  );
}

export function ShieldCheckIcon() {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.8'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='h-6 w-6'
    >
      <path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' />
      <path d='m9 12 2 2 4-4' />
    </svg>
  );
}

export function HeartPulseIcon() {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.8'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='h-6 w-6'
    >
      <path d='M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z' />
      <path d='M3.5 12h4l2-3 3 6 2-3h6' />
    </svg>
  );
}

export function SafetyBundleIcon() {
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.8'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='h-6 w-6'
    >
      <path d='M7 5.5h10A1.5 1.5 0 0 1 18.5 7v7A1.5 1.5 0 0 1 17 15.5H7A1.5 1.5 0 0 1 5.5 14V7A1.5 1.5 0 0 1 7 5.5Z' />
      <path d='M8.5 9.5h7M8.5 12h4.5' />
      <path d='M10 15.5v3l2-1.2 2 1.2v-3' />
    </svg>
  );
}

export function getServiceIconByKey(iconKey?: string | null): ReactNode {
  switch (iconKey) {
    case 'icon-residency-exam':
      return <BuildingIcon />;
    case 'icon-municipality':
      return <CertificateIcon />;
    case 'icon-occupational-health':
      return <BriefcaseIcon />;
    case 'icon-driving-license':
    default:
      return <CarIcon />;
  }
}

export function getWhySpriteClassName(
  iconKey?: string | null,
  index = 0
): string {
  switch (iconKey) {
    case 'icon-tracking':
      return 'ic-refresh';
    case 'icon-reports':
      return 'ic-listdoc';
    case 'icon-certified':
      return 'ic-shield';
    case 'icon-flexibility':
      return 'ic-briefcase';
    default:
      return (
        ['ic-refresh', 'ic-listdoc', 'ic-shield', 'ic-briefcase'][index] ??
        'ic-refresh'
      );
  }
}

export function getUtilityIconByKey(iconKey?: string | null): ReactNode {
  switch (iconKey) {
    case 'icon-apple':
      return <AppleIcon />;
    case 'icon-google-play':
      return <GooglePlayIcon />;
    case 'icon-email':
      return <EmailIcon />;
    case 'icon-phone':
      return <PhoneIcon />;
    case 'icon-location':
      return <LocationIcon />;
    case 'icon-calendar':
      return <CalendarIcon />;
    case 'icon-pdf':
      return <PdfIcon />;
    case 'icon-first-aid':
      return <ShieldCheckIcon />;
    case 'icon-cpr':
      return <HeartPulseIcon />;
    case 'icon-safety-bundle':
      return <SafetyBundleIcon />;
    default:
      return null;
  }
}
