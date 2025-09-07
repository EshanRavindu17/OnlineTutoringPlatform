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

    // If user is registering as Individual or Mass tutor, create entry in Candidates table
    if (role === 'Individual' || role === 'Mass') {
      try {
        // Check if candidate entry already exists by email
        const existingCandidate = await prisma.candidates.findFirst({
          where: {
            email: email,
            role: role as any
          }
        });

        if (!existingCandidate) {
          await prisma.candidates.create({
            data: {
              name,
              email,
              role: role as any,
              bio,
              dob: dob ? new Date(dob) : null
              // applied_at: new Date() // Will be added once Prisma client is regenerated
              // Default status will be 'pending'
            }
          });
          
          // Update the applied_at field separately as a workaround
          try {
            await prisma.$executeRaw`
              UPDATE "Candidates" 
              SET applied_at = NOW() 
              WHERE email = ${email} AND role = ${role}::user_role_enum
            `;
            console.log(`✅ Created candidate entry for ${role} tutor with applied_at timestamp`);
          } catch (updateError) {
            console.log(`✅ Created candidate entry for ${role} tutor (applied_at update skipped)`);
          }
        } else {
          console.log(`ℹ️ Candidate entry already exists for ${role} tutor: ${email}`);
        }
      } catch (candidateError) {
        console.error('❌ Error creating candidate entry:', candidateError);
        // Don't throw error as user creation was successful
      }
    }

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

// New function to check Individual_Tutor status
export const findIndividualTutorByUserId = async (userId: string) => {
  try {
    const individualTutor = await prisma.individual_Tutor.findFirst({
      where: {
        user_id: userId
      },
      select: {
        i_tutor_id: true,
        // status: true, // TODO: Enable after migration
        user_id: true
      }
    });
    return individualTutor;
  } catch (error: any) {
    console.error('Error finding individual tutor by user ID:', error);
    throw new Error(`Failed to find individual tutor: ${error.message}`);
  }
};

// Enhanced user validation for Individual tutors
export const findUserWithTutorStatus = async (firebaseUid: string) => {
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
        created_at: true,
        Individual_Tutor: {
          select: {
            i_tutor_id: true,
            // status: true // Will be enabled once DB connection is stable
          }
        },
        Mass_Tutor: {
          select: {
            m_tutor_id: true,
            // status: true // Will be enabled once DB connection is stable
          }
        }
      }
    });
    return user;
  } catch (error: any) {
    console.error('Error finding user with tutor status:', error);
    throw new Error(`Failed to find user with tutor status: ${error.message}`);
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