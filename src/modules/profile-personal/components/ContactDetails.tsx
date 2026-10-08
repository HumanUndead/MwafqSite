import type { ReactNode } from 'react';
import { InfoItem, InfoList } from '@/shared/components/product';
import type { PersonalInfoContact } from '@/modules/profile-personal/types/personalInfo.types';

type Labels = {
  name: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  mailingAddress: string;
};

/** Missing values say so instead of showing a blank or a fake value. */
function Value({
  value,
  notAdded,
  ltr = false,
}: {
  value?: string;
  notAdded: string;
  /** Emails and phone numbers keep LTR order inside Arabic text. */
  ltr?: boolean;
}): ReactNode {
  if (!value) {
    return <span className='font-normal text-[#6b7196]'>{notAdded}</span>;
  }
  return ltr ? <bdi dir='ltr'>{value}</bdi> : value;
}

export function ContactDetails({
  contact,
  labels,
  notAdded,
  className,
}: {
  contact: Partial<PersonalInfoContact>;
  labels: Labels;
  notAdded: string;
  className?: string;
}) {
  return (
    <InfoList className={className}>
      <InfoItem label={labels.name}>
        <Value value={contact.name} notAdded={notAdded} />
      </InfoItem>
      <InfoItem label={labels.phone}>
        <Value value={contact.phone} notAdded={notAdded} ltr />
      </InfoItem>
      <InfoItem label={labels.email}>
        <Value value={contact.email} notAdded={notAdded} ltr />
      </InfoItem>
      <InfoItem label={labels.city}>
        <Value value={contact.city} notAdded={notAdded} />
      </InfoItem>
      <InfoItem label={labels.country}>
        <Value value={contact.country} notAdded={notAdded} />
      </InfoItem>
      <InfoItem label={labels.mailingAddress} wide>
        <Value value={contact.mailingAddress} notAdded={notAdded} />
      </InfoItem>
    </InfoList>
  );
}
