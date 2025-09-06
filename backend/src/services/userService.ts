import prisma from '../prismaClient';

// Types
interface UserData {
  firebase_uid: string;
  email: string;
  name: string;
  role: string;
  photo_url?: string;
  bio?: string;
  dob?: Date | null;
}

interface GetUsersOptions {
  limit?: number;
  offset?: number;
  role?: string;
}

export const findUserByFirebaseUid = async (firebaseUid: string) => {
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
  } catch (error: any) {
    console.error('Error finding user by Firebase UID:', error);
    throw new Error(`Failed to find user: ${error.message}`);
  }
};

export const createOrUpdateUser = async (userData: UserData) => {
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

    if (!firebase_uid || !email || !name || !role) {
      throw new Error('Missing required fields: firebase_uid, email, name, role');
    }

    const validRoles = ['student', 'Individual', 'Mass', 'Admin'];
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
        role: role as any,
        ...(photo_url && { photo_url }),
        ...(bio && { bio }),
        ...(dob && { dob: new Date(dob) })
      },
      create: {
        firebase_uid,
        email,
        name,
        role: role as any,
        photo_url: photo_url || '',
        bio: bio || '',
        dob: dob ? new Date(dob) : null
      }
    });

    return user;
  } catch (error: any) {
    console.error('Error creating or updating user:', error);
    throw new Error(`Failed to create or update user: ${error.message}`);
  }
};

export const findUserByEmail = async (email: string) => {
  try {
    const user = await prisma.user.findUnique({
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
  } catch (error: any) {
    console.error('Error finding user by email:', error);
    throw new Error(`Failed to find user by email: ${error.message}`);
  }
};

export const getAllUsers = async (options: GetUsersOptions = {}) => {
  try {
    const { limit, offset, role } = options;
    
    const whereClause = role ? { role: role as any } : {};
    
    const users = await prisma.user.findMany({
      where: whereClause,
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
  } catch (error: any) {
    console.error('Error getting users:', error);
    throw new Error(`Failed to get users: ${error.message}`);
  }
};

export const validateUserRoleAndEmail = async (email: string, role: string) => {
  try {
    const user = await findUserByEmail(email);
    
    if (!user) {
      return false;
    }
    
    return user.role === role;
  } catch (error: any) {
    console.error('Error validating user role and email:', error);
    throw new Error(`Failed to validate user: ${error.message}`);
  }
};

  // export const updateStudentProfile = async (id:string ,name: string, img: string) => {
  //     try{
  //         const updatedProfile = await prisma.user.update({
  //             where: { id },
  //             data: { name, photo_url: img }
  //         });
  //         return updatedProfile;
  //     } catch (error) {
  //         throw new Error('Failed to update student profile');
  //     }
  // };


  export const getUserByUid = async (uid: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        firebase_uid: uid
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
  } catch (error: any) {
    console.error('Error finding user by UID:', error);
    throw new Error(`Failed to find user: ${error.message}`);
  }
};