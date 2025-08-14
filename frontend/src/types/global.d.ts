export type UserRole = 'student' | 'Individual' | 'Mass' | 'Admin';

export interface UserProfile {
  id?: string;
  firebase_uid: string;
  email: string;
  name: string;
  role: UserRole;
  photo_url?: string | null;
  bio?: string | null;
  dob?: string | null;
  created_at?: string;
}
