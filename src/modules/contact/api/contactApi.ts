import { http } from '@/shared/lib/http';

interface ContactPayload {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export const contactApi = {
  send: (data: ContactPayload) => http.post<null>('/api/contact', data),
};
