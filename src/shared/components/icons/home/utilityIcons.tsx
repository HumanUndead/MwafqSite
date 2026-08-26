import type { ReactNode } from 'react';
import { AppleIcon } from './AppleIcon';
import { BellIcon } from './BellIcon';
import { CalendarIcon } from './CalendarIcon';
import { EmailIcon } from './EmailIcon';
import { GooglePlayIcon } from './GooglePlayIcon';
import { HeartPulseIcon } from './HeartPulseIcon';
import { LocationIcon } from './LocationIcon';
import { PdfIcon } from './PdfIcon';
import { PhoneIcon } from './PhoneIcon';
import { SafetyBundleIcon } from './SafetyBundleIcon';
import { ShieldCheckIcon } from './ShieldCheckIcon';

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
    case 'bell-solid-full':
      return <BellIcon />;
    default:
      return null;
  }
}
