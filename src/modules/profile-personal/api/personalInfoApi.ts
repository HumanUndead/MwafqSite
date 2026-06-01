import { fetchWithErrorHandlingClient } from '@/shared/lib/fetchWithErrorHandling.shared';
import type { PaginatedResponse } from '@/shared/types/api.types';
import { EntityTranslation } from '@/shared/types/entity-translation.types';
import type { User } from '@/shared/types/user.types';

export interface CityTranslation extends EntityTranslation {
  cityId: number;
}

export interface City {
  id: number;
  countryId: number;
  isDeleted: boolean;
  image: string;
  translations: CityTranslation[];
}

export interface UpdateUserInfoInput {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNo: string;
  cityId: number;
}

export async function fetchCities(countryId: number, signal?: AbortSignal) {
  const result = await fetchWithErrorHandlingClient<PaginatedResponse<City>>(
    `/api/General/City/List?countryId=${countryId}`,
    { signal }
  );
  return result;
}

function toUpdateUserFormData(input: UpdateUserInfoInput): FormData {
  const formData = new FormData();
  formData.set('Id', input.id);
  formData.set('FirstName', input.firstName);
  formData.set('LastName', input.lastName);
  formData.set('Email', input.email);
  formData.set('PhoneNo', input.phoneNo);
  formData.set('CityId', String(input.cityId));
  return formData;
}

export async function updateUserInfo(
  input: UpdateUserInfoInput
): Promise<User> {
  return fetchWithErrorHandlingClient<User>('/api/Authenticate/User/Update', {
    method: 'PUT',
    body: toUpdateUserFormData(input),
  });
}
