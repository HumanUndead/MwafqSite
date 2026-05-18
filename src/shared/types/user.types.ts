/** Company branch assignment on the authenticated user (upstream API). */
export interface UserCompanyBranch {
  id: number;
  companyBranchId: number;
  companyBranchName: string;
  companyName: string;
}

/**
 * Authenticated user profile from Mwafq upstream (`GetUserByToken`, session, store).
 * Convenience fields (`name`, `username`, `role`) are set when parsing upstream JSON.
 */
export interface User {
  id: string;
  userName: string;
  firstName: string;
  email: string;
  lastName: string;
  nationalityId: number;
  nationalityName: string;
  phoneNo: string;
  address: string;
  countryId: number;
  countryName: string;
  cityId: number;
  cityName: string;
  /** Present on some API responses only; omit when persisting session when possible. */
  otp?: string;
  roleId: number | null;
  roleName: string | null;
  companyId: number;
  companyName: string;
  companyIds: number[];
  companyNames: string[];
  companyDepartmentId: number;
  companyDepartmentName: string;
  serviceProviderId: number | null;
  serviceProviderName: string;
  isManagement: boolean;
  postCode: string;
  img: string;
  isActive: boolean;
  groupId: number;
  identityNumber: string;
  dateOfBirth: string;
  userTags: unknown[];
  userServiceProviderBranches: unknown[];
  userCompanyBranches: UserCompanyBranch[];
  rolePermissions: unknown | null;

  /** `${firstName} ${lastName}` — filled by `parseUpstreamUser` / `buildUserFromToken`. */
  name: string;
  /** Alias of `userName` for legacy UI. */
  username: string;
  role: 'user' | 'admin';
  /** Optional; falls back to `dateOfBirth` in UI when absent. */
  createdAt?: string;
}
