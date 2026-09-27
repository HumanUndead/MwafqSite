export const RelatedUserStatus = {
  Pending: 1,
  Accepted: 2,
  Rejected: 4,
} as const;
export type RelatedUserStatus =
  (typeof RelatedUserStatus)[keyof typeof RelatedUserStatus];

/** One relation row (`relatedToUsers` / `belongToUsers`). */
export interface RelatedUser {
  /** Relation id (used for status update / delete). */
  id: number;
  /** The related person's user id (GUID). */
  userId: string;
  fullName: string;
  firstName: string;
  lastName: string;
  /** Owner of the relation (the user who sent it). */
  relatedTo: string;
  image: string | null;
  fullNameRelatedTo: string;
  status: RelatedUserStatus;
}

export interface FamilyOverview {
  /** People I added (I can book for the accepted ones). */
  relatedToUsers: RelatedUser[];
  /** People who added me. */
  belongToUsers: RelatedUser[];
}

/** Safe subset of `Authenticate/User/GetUserByUserName`. */
export interface FamilyLookupUser {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string | null;
  img: string | null;
}

export interface CreateFamilyMemberInput {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  identityNumber: string;
  /** `YYYY-MM-DD`. */
  dateOfBirth: string;
}
