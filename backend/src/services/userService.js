import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/**
 * Service layer for user-related business logic
 * Handles all database operations and business rules for users
 */

/**
 * Find a user by their Firebase UID
 * @param {string} firebaseUid - The Firebase UID of the user
 * @returns {Promise<Object|null>} User object or null if not found
 */
export const findUserByFirebaseUid = async (firebaseUid) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        firebase_uid: firebaseUid
      },
      select: {
        id: true,
        firebase_uid: true,
        email: true,
        name: true,
        role: true,
        photo_url: true,
        bio: true,
        dob: true,
        created_at: true
      }
    });
    return user;
  } catch (error) {
    console.error('Error finding user by Firebase UID:', error);
    throw new Error(`Failed to find user: ${error.message}`);
  }
};

/**
 * Create or update a user (upsert operation)
 * @param {Object} userData - The user data to create or update
 * @param {string} userData.firebase_uid - The Firebase UID
 * @param {string} userData.email - The user's email
 * @param {string} userData.name - The user's name
 * @param {string} userData.role - The user's role
 * @param {string} [userData.photo_url] - The user's profile picture URL
 * @param {string} [userData.bio] - The user's bio
 * @param {Date} [userData.dob] - The user's date of birth
 * @returns {Promise<Object>} The created or updated user
 */
export const createOrUpdateUser = async (userData) => {
  try {
    const {
      firebase_uid,
      email,
      name,
      role,
      photo_url,
      bio = '',
      dob = null
    } = userData;

    // Validate required fields
    if (!firebase_uid || !email || !name || !role) {
      throw new Error('Missing required fields: firebase_uid, email, name, and role are required');
    }

    // Validate role
    const validRoles = ['student', 'Individual','Mass' ,'Admin'];
    if (!validRoles.includes(role)) {
      throw new Error(`Invalid role: ${role}. Must be one of: ${validRoles.join(', ')}`);
    }

    const user = await prisma.user.upsert({
      where: {
        firebase_uid: firebase_uid
      },
      update: {
        email,
        name,
        role,
        photo_url,
        bio,
        dob
      },
      create: {
        firebase_uid,
        email,
        name,
        role,
        photo_url,
        bio,
        dob
      }
    });

    return user;
  } catch (error) {
    console.error('Error creating or updating user:', error);
    throw new Error(`Failed to create or update user: ${error.message}`);
  }
};

/**
 * Find a user by email
 * @param {string} email - The email to search for
 * @returns {Promise<Object|null>} User object or null if not found
 */
export const findUserByEmail = async (email) => {
  try {
    if (!email) {
      throw new Error('Email is required');
    }

    const user = await prisma.user.findFirst({
      where: {
        email: email
      },
      select: {
        id: true,
        firebase_uid: true,
        email: true,
        name: true,
        role: true,
        photo_url: true,
        bio: true,
        dob: true,
        created_at: true
      }
    });

    return user;
  } catch (error) {
    console.error('Error finding user by email:', error);
    throw new Error(`Failed to find user by email: ${error.message}`);
  }
};

/**
 * Get all users (for admin purposes)
 * @param {Object} options - Query options
 * @param {number} [options.limit] - Limit the number of results
 * @param {number} [options.offset] - Offset for pagination
 * @param {string} [options.role] - Filter by role
 * @returns {Promise<Array>} Array of users
 */
export const getAllUsers = async (options = {}) => {
  try {
    const { limit, offset, role } = options;
    
    const where = role ? { role } : {};
    
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firebase_uid: true,
        email: true,
        name: true,
        role: true,
        photo_url: true,
        bio: true,
        dob: true,
        created_at: true
      },
      ...(limit && { take: limit }),
      ...(offset && { skip: offset }),
      orderBy: {
        created_at: 'desc'
      }
    });

    return users;
  } catch (error) {
    console.error('Error getting all users:', error);
    throw new Error(`Failed to get users: ${error.message}`);
  }
};

/**
 * Validate user role and email combination
 * @param {string} email - The email to validate
 * @param {string} role - The role to validate
 * @returns {Promise<boolean>} True if valid, false otherwise
 */
export const validateUserRoleAndEmail = async (email, role) => {
  try {
    if (!email || !role) {
      throw new Error('Email and role are required');
    }

    const user = await findUserByEmail(email);
    
    if (!user) {
      return false;
    }

    // Check if the user has the expected role
    return user.role === role;
  } catch (error) {
    console.error('Error validating user role and email:', error);
    throw new Error(`Failed to validate user: ${error.message}`);
  }
};
