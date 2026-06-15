export interface ContactInfoItem {
  label: string;
  value: string;
}

export interface ContactFormContent {
  name: { label: string; placeholder: string };
  email: { label: string; placeholder: string };
  phone: { label: string; placeholder: string };
  message: { label: string; placeholder: string };
  submit: string;
  success: { title: string; description: string };
}

export interface ContactPageContent {
  title: string;
  description: string;
  info: {
    email: ContactInfoItem;
    phone: ContactInfoItem;
    address: ContactInfoItem;
  };
  form: ContactFormContent;
}
