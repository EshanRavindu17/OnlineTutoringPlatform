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
  // Additional fields for tutors
  phone_number?: string;
  subjects?: string[];
  titles?: string[];
  hourly_rate?: number;
  description?: string;
  heading?: string;
  location?: string;
  qualifications?: string[];
  prices?: number;
  // Document URLs for tutors
  cv_url?: string;
  certificate_urls?: string[];
}

interface GetUsersOptions {
  limit?: number;
  offset?: number;
  role?: string;
}

// Utility function to validate individual tutor data
const validateIndividualTutorData = (userData: UserData) => {
  const errors: string[] = [];
  
  if (!userData.subjects || userData.subjects.length === 0) {
    errors.push('At least one subject is required for individual tutors');
  }
  
  if (!userData.titles || userData.titles.length === 0) {
    errors.push('At least one title/expertise is required for individual tutors');
  }
  
  if (userData.hourly_rate !== undefined && userData.hourly_rate !== null) {
    const rate = parseFloat(userData.hourly_rate.toString());
    if (isNaN(rate) || rate <= 0) {
      errors.push('Invalid hourly rate - must be a positive number');
    }
    if (rate > 1000) {
      errors.push('Hourly rate seems too high - please verify');
    }
  }
  
  if (userData.phone_number) {
    const phoneStr = userData.phone_number.toString();
    if (phoneStr.length < 8 || phoneStr.length > 20) {
      errors.push('Phone number must be between 8 and 20 characters');
    }
  }
  
  return errors;
};

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
      dob = null,

      // Tutor-specific fields
      phone_number,
      subjects,
      titles,
      hourly_rate,
      description,
      heading,
      location,
      qualifications,
      prices,

      // Document URLs
      cv_url,
      certificate_urls
    } = userData;

    // ✅ Validate required fields
    if (!firebase_uid || !email || !name || !role) {
      throw new Error('Missing required fields: firebase_uid, email, name, role');
    }

    const validRoles = ['student', 'Individual', 'Mass', 'Admin'];
    if (!validRoles.includes(role)) {
      throw new Error(`Invalid role: ${role}. Must be one of: ${validRoles.join(', ')}`);
    }

    // ✅ Additional validation for Individual tutors
    if (role === 'Individual') {
      if (!subjects || subjects.length === 0) {
        throw new Error('Individual tutors must have at least one subject');
      }
      if (!titles || titles.length === 0) {
        throw new Error('Individual tutors must have at least one title/expertise');
      }
      if (hourly_rate && (isNaN(parseFloat(hourly_rate.toString())) || parseFloat(hourly_rate.toString()) <= 0)) {
        throw new Error('Invalid hourly rate for individual tutor');
      }
    }

    // ✅ Create or update User
    const user = await prisma.user.upsert({
      where: { firebase_uid },
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

    // ✅ If tutor role → create or update Candidate entry
    if (role === 'Individual' || role === 'Mass') {
      const existingCandidate = await prisma.candidates.findFirst({
        where: { email, role: role as any }
      });

      if (!existingCandidate) {
        await prisma.candidates.create({
          data: {
            user_id: user.id,
            name,
            email,
            role: role as any,
            bio: bio || null,
            dob: dob ? new Date(dob) : null,
            phone_number: phone_number ? phone_number.toString() : null, // Ensure string type
            applied_at: new Date(),
            cvUrl: cv_url || null,
            certificateUrls: certificate_urls || [],

            // Tutor-specific fields with proper validation
            description: description || null,
            heading: heading || null,
            subjects: subjects || [], // Now contains names instead of IDs
            titles: role === 'Individual' ? (titles || []) : [], // Now contains names instead of IDs
            hourly_rate: role === 'Individual' && hourly_rate 
              ? Math.round(parseFloat(hourly_rate.toString()) * 100) / 100 // Round to 2 decimal places
              : null,
            location: role === 'Individual' ? (location || null) : null,
            qualifications: role === 'Individual' ? (qualifications || []) : [],
            prices: role === 'Mass' && prices 
              ? Math.round(parseFloat(prices.toString()) * 100) / 100 // Round to 2 decimal places
              : null
          }
        });

        console.log(`✅ Candidate entry created for ${role} tutor: ${email}`);
      } else {
        await prisma.candidates.update({
          where: { id: existingCandidate.id },
          data: {
            name,
            bio: bio || null,
            dob: dob ? new Date(dob) : null,
            phone_number: phone_number ? phone_number.toString() : null, // Ensure string type
            cvUrl: cv_url || null,
            certificateUrls: certificate_urls || [],

            // Tutor-specific fields with proper validation
            description: description || null,
            heading: heading || null,
            subjects: subjects || [], // Now contains names instead of IDs
            titles: role === 'Individual' ? (titles || []) : [], // Now contains names instead of IDs
            hourly_rate: role === 'Individual' && hourly_rate 
              ? Math.round(parseFloat(hourly_rate.toString()) * 100) / 100 // Round to 2 decimal places
              : null,
            location: role === 'Individual' ? (location || null) : null,
            qualifications: role === 'Individual' ? (qualifications || []) : [],
            prices: role === 'Mass' && prices 
              ? Math.round(parseFloat(prices.toString()) * 100) / 100 // Round to 2 decimal places
              : null
          }
        });

        console.log(`ℹ️ Candidate entry updated for ${role} tutor: ${email}`);
      }
    }

    return user;
  } catch (error: any) {
    console.error('Error creating or updating user:', error);
    
    // Log detailed error information for debugging
    console.error('User data that caused error:', {
      firebase_uid: userData.firebase_uid,
      email: userData.email,
      name: userData.name,
      role: userData.role,
      subjects: userData.subjects?.length || 0,
      titles: userData.titles?.length || 0,
      hourly_rate: userData.hourly_rate,
      phone_number: userData.phone_number
    });
    
    // Provide more specific error messages
    if (error.code === 'P2002') {
      throw new Error('Email or Firebase UID already exists');
    }
    if (error.code === 'P2003') {
      throw new Error('Database constraint violation - check required fields');
    }
    
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