import { UserRole } from '../types/user.js';

export const isValidEmail = (email: string): boolean => /.+@.+\..+/.test(email);
export const isValidRole = (role: string): role is UserRole => ['student','Individual','Mass','Admin'].includes(role);
