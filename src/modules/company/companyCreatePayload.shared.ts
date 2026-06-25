import type { CompanyCreateDto } from './types/company.types';

/** ASP.NET [FromForm] shape for `/api/Company/Company/Create` */
export function buildCompanyCreateUpstreamForm(dto: CompanyCreateDto): FormData {
  const form = new FormData();

  dto.translations.forEach((t, i) => {
    form.set(`Translations[${i}].LangId`, String(t.langId));
    form.set(`Translations[${i}].Name`, t.name.trim());
    form.set(`Translations[${i}].Address`, t.address.trim());
  });

  const contact = dto.contact;
  if (contact.userId) form.set('Contact.UserId', contact.userId);
  if (contact.firstName) form.set('Contact.FirstName', contact.firstName.trim());
  if (contact.lastName) form.set('Contact.LastName', contact.lastName.trim());
  if (contact.email) form.set('Contact.Email', contact.email.trim());
  if (contact.phone) form.set('Contact.Phone', contact.phone.trim());

  form.set('CRNumber', dto.crNumber?.trim() ?? '');
  form.set('VATNumber', dto.vatNumber?.trim() ?? '');
  form.set('Rank', String(dto.rank));
  form.set('CountryId', dto.countryId);
  form.set('CityId', dto.cityId);
  form.set('CompanyTypeId', dto.companyTypeId);
  form.set('Status', dto.status ? 'true' : 'false');

  if (dto.parentCompanyId) form.set('ParentCompanyId', dto.parentCompanyId);
  if (dto.companyPhone) form.set('CompanyPhone', dto.companyPhone.trim());
  if (dto.companySize != null) form.set('CompanySize', String(dto.companySize));
  if (dto.ipan) form.set('Ipan', dto.ipan.trim());
  if (dto.logo) form.set('Logo', dto.logo);

  for (const tagId of dto.tagIds) {
    form.append('Tags', tagId);
  }

  return form;
}

export function forwardCompanyCreateFormData(incoming: FormData): FormData {
  const upstream = new FormData();

  for (const [key, value] of incoming.entries()) {
    if (value instanceof File) {
      if (value.size > 0) upstream.set(key, value);
      continue;
    }

    if (typeof value !== 'string') continue;
    const trimmed = value.trim();
    if (!trimmed) continue;

    if (key === 'Tags') upstream.append(key, trimmed);
    else upstream.set(key, trimmed);
  }

  return upstream;
}
