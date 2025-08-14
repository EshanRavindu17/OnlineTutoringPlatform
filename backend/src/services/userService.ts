import { User as PrismaUser } from '@prisma/client';
import { CreateOrUpdateUserRequest, GetUsersOptions, UserBase, UserRole } from '../types/user';
import prisma from '../prisma';
const validRoles: UserRole[] = ['student', 'Individual', 'Mass', 'Admin'];

const mapPrismaUser = (u: PrismaUser): UserBase => ({
  id: String(u.id),
  firebase_uid: u.firebase_uid,
  email: u.email,
  name: u.name,
  role: u.role as UserRole,
  photo_url: u.photo_url,
  bio: u.bio,
  dob: u.dob ?? null,
  created_at: u.created_at
});

export const findUserByFirebaseUid = async (firebaseUid: string): Promise<UserBase | null> => {
  try {
  const user = await prisma.user.findUnique({ where: { firebase_uid: firebaseUid } });
  return user ? mapPrismaUser(user) : null;
  } catch (error: any) {
    console.error('Error finding user by Firebase UID:', error);
    throw new Error(`Failed to find user: ${error.message}`);
  }
};

export const createOrUpdateUser = async (userData: CreateOrUpdateUserRequest): Promise<UserBase> => {
  try {
  let { firebase_uid, email, name, role, photo_url, bio = '', dob = null } = userData;
  if (bio == null) bio = '';
    if (!firebase_uid || !email || !name || !role) throw new Error('Missing required fields: firebase_uid, email, name, and role are required');
    if (!validRoles.includes(role)) throw new Error(`Invalid role: ${role}. Must be one of: ${validRoles.join(', ')}`);
    const user = await prisma.user.upsert({
      where: { firebase_uid },
      update: {
        email,
        name,
        role,
        photo_url: photo_url ?? null,
        bio: bio, // ensured string
        dob: dob ? new Date(dob) : null
      },
      create: {
        firebase_uid,
        email,
        name,
        role,
        photo_url: photo_url ?? null,
        bio: bio, // ensured string
        dob: dob ? new Date(dob) : null
      }
    });
    return mapPrismaUser(user);
  } catch (error: any) {
    console.error('Error creating or updating user:', error);
    throw new Error(`Failed to create or update user: ${error.message}`);
  }
};

export const findUserByEmail = async (email: string): Promise<UserBase | null> => {
  try {
    if (!email) throw new Error('Email is required');
  const user = await prisma.user.findFirst({ where: { email } });
  return user ? mapPrismaUser(user) : null;
  } catch (error: any) {
    console.error('Error finding user by email:', error);
    throw new Error(`Failed to find user by email: ${error.message}`);
  }
};

export const getAllUsers = async (options: GetUsersOptions = {}): Promise<UserBase[]> => {
  try {
    const { limit, offset, role } = options;
    const where = role ? { role } : {};
    const users = await prisma.user.findMany({
      where,
      ...(limit ? { take: limit } : {}),
      ...(offset ? { skip: offset } : {}),
      orderBy: { created_at: 'desc' }
    });
    return users.map(mapPrismaUser);
  } catch (error: any) {
    console.error('Error getting all users:', error);
    throw new Error(`Failed to get users: ${error.message}`);
  }
};

export const validateUserRoleAndEmail = async (email: string, role: UserRole): Promise<boolean> => {
  try {
    if (!email || !role) throw new Error('Email and role are required');
    const user = await findUserByEmail(email);
    if (!user) return false;
    return user.role === role;
  } catch (error: any) {
    console.error('Error validating user role and email:', error);
    throw new Error(`Failed to validate user: ${error.message}`);
  }
};
