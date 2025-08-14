export type UserRole = 'student' | 'Individual' | 'Mass' | 'Admin';

export interface UserBase {
  id?: string;
  firebase_uid: string;
  email: string;
  name: string;
  role: UserRole;
  photo_url?: string | null;
  bio?: string | null;
  dob?: Date | string | null;
  created_at?: Date;
}

export interface CreateOrUpdateUserRequest {
  firebase_uid: string;
  email: string;
  name: string;
  role: UserRole;
  photo_url?: string | null;
  bio?: string | null;
  dob?: Date | string | null;
}

export interface GetUsersOptions {
  limit?: number;
  offset?: number;
  role?: UserRole;
}

export interface ApiError extends Error {
  status?: number;
}
