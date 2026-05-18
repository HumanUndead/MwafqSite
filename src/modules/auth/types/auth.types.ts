import type { User } from '@/shared/types/user.types';

export type { User, UserCompanyBranch } from '@/shared/types/user.types';

export interface LoginDto {
  userName: string;
}

export interface LoginResponse {
  userName: string;
  phoneNumber?: string | null;
  raw?: unknown;
}

export interface RegisterDto {
  firstName: string;
  lastName: string;
  identityNumber: string;
  phoneNumber: string;
  dateOfBirth: string;
  image: File | null;
}

export interface RegisterRequestDto {
  phoneNumber: string;
  firstName: string;
  lastName: string;
  countryId: number;
  identityNumber: string;
  relatedTo: string | null;
  dateOfBirth?: string | null;
  id?: string | null;
  image?: File | null;
}

export interface RegisterResponse {
  phoneNumber: string;
  userName: string;
  registrationId?: string | null;
  raw?: unknown;
}

export interface OtpVerificationResponse {
  user: User;
  token: string;
  raw?: unknown;
}

export interface AuthResponse {
  user: User;
  token: string;
}
