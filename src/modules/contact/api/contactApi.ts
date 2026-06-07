import { fetchWithErrorHandlingClient } from '@/shared/lib/fetchWithErrorHandling.shared';
import type {
  ContactFormDto,
  ContactUsCreatePayload,
} from '../types/contact.types';

function toContactUsPayload(input: ContactFormDto): ContactUsCreatePayload {
  return {
    fullName: input.name.trim(),
    email: input.email.trim(),
    phone: input.phone.trim(),
    message: input.message.trim(),
  };
}

export const contactApi = {
  send: async (data: ContactFormDto) => {
    const payload = toContactUsPayload(data);

    if (!payload.fullName || !payload.email || !payload.message) {
      throw new Error('Required fields missing');
    }

    return fetchWithErrorHandlingClient<null>(
      '/api/General/ContactUs/Create',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  },
};
