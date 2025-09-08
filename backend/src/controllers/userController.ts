import e, { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authBypass';
import prisma from '../prismaClient';
import {
  findUserByFirebaseUid,
  createOrUpdateUser,
  validateUserRoleAndEmail,
  getAllUsers,
  findUserWithTutorStatus
} from '../services/userService';

/**
 * Controller for user-related HTTP requests
 * Handles request/response logic and delegates business logic to userService
 */

/**
 * Get user by Firebase UID with enhanced tutor status checking
 * GET /api/users/:uid
 */
export const getUserByUid = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { uid } = req.params;
    console.log("🔎 Fetching DB user for UID:", uid);

    if (!uid) {
      return res.status(400).json({ 
        error: 'Firebase UID is required' 
      });
    }

    // Verify the requesting user matches the UID or has admin privileges
    if (req.user?.uid !== uid) {
      return res.status(403).json({ 
        error: 'Access denied: You can only access your own profile' 
      });
    }

    const user = await findUserWithTutorStatus(uid);

    if (!user) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    // For Individual role users, check their tutor status
    if (user.role === 'Individual') {
      console.log(`🔍 User ${user.email} has Individual role, checking tutor status...`);
      console.log(`📊 User Individual_Tutor profiles count: ${user.Individual_Tutor?.length || 0}`);
      
      // Check if user has an approved tutor profile in Individual_Tutor table
      if (!user.Individual_Tutor || user.Individual_Tutor.length === 0) {
        // User is not in Individual_Tutor table, check Candidates table for pending/rejected
        try {
          const candidateApplication = await prisma.candidates.findFirst({
            where: { 
              email: user.email,
              role: 'Individual' 
            }
          });

          if (candidateApplication) {
            // Check status from Candidates table
            // Note: We'll use a raw query to get the actual status since Prisma client might not have it
            try {
              const statusResult = await prisma.$queryRaw`
                SELECT status FROM "Candidates" 
                WHERE email = ${user.email} AND (role = 'Individual')
                LIMIT 1
              ` as any[];
              
              console.log(`🔍 Candidate status check for ${user.email}:`, statusResult);
              const candidateStatus = statusResult[0]?.status || 'pending';
              console.log(`📋 Final candidate status: ${candidateStatus}`);
              
              if (candidateStatus === 'pending') {
                return res.status(200).json({
                  ...user,
                  tutorStatus: 'pending',
                  canAccessDashboard: false,
                  message: 'Your tutor application is pending admin approval'
                });
              } else if (candidateStatus === 'rejected') {
                return res.status(200).json({
                  ...user,
                  tutorStatus: 'rejected',
                  canAccessDashboard: false,
                  message: 'Your tutor application has been rejected'
                });
              } 
            } catch (statusError) {
              // Fallback to pending if status query fails
              return res.status(200).json({
                ...user,
                tutorStatus: 'pending',
                canAccessDashboard: false,
                message: 'Your tutor application is pending admin approval'
              });
            }
          }
        } catch (candidateError) {
          console.log('Error checking candidates table:', candidateError);
        }

        // No application found - user needs to complete registration
        return res.status(200).json({
          ...user,
          tutorStatus: 'not_registered',
          canAccessDashboard: false,
          message: 'Please complete your tutor profile registration'
        });
      }

      // User exists in Individual_Tutor table - check their status from Individual_Tutor table
      const tutorProfile = user.Individual_Tutor[0];
      
      try {
        // Query Individual_Tutor table for active/suspended status
        const tutorStatusResult = await prisma.$queryRaw`
          SELECT status FROM "Individual_Tutor" 
          WHERE i_tutor_id = ${tutorProfile.i_tutor_id}
          LIMIT 1
        ` as any[];
        
        const tutorStatus = tutorStatusResult[0]?.status || 'active';
        const canAccessDashboard = tutorStatus === 'active';

        return res.status(200).json({
          ...user,
          tutorStatus: tutorStatus, // 'active' or 'suspended'
          canAccessDashboard,
          message: tutorStatus === 'active' 
            ? 'Tutor profile active' 
            : 'Your tutor account has been suspended'
        });
      } catch (tutorError) {
        console.log('Error checking Individual_Tutor status:', tutorError);
        // Fallback to active if query fails
        return res.status(200).json({
          ...user,
          tutorStatus: 'active',
          canAccessDashboard: true,
          message: 'Tutor profile active'
        });
      }
    }

    // For Mass role users, check their tutor status
    if (user.role === 'Mass') {
      console.log(`🔍 User ${user.email} has Mass role, checking tutor status...`);
      console.log(`📊 User Mass_Tutor profiles count: ${user.Mass_Tutor?.length || 0}`);
      
      // Check if user has an approved tutor profile in Mass_Tutor table
      if (!user.Mass_Tutor || user.Mass_Tutor.length === 0) {
        // User is not in Mass_Tutor table, check Candidates table for pending/rejected
        try {
          const candidateApplication = await prisma.candidates.findFirst({
            where: { 
              email: user.email,
              role: 'Mass' 
            }
          });

          if (candidateApplication) {
            // Check status from Candidates table
            try {
              const statusResult = await prisma.$queryRaw`
                SELECT status FROM "Candidates" 
                WHERE email = ${user.email} AND role = 'Mass'
                LIMIT 1
              ` as any[];
              
              console.log(`🔍 Candidate status check for ${user.email}:`, statusResult);
              const candidateStatus = statusResult[0]?.status || 'pending';
              console.log(`📋 Final candidate status: ${candidateStatus}`);
              
              if (candidateStatus === 'pending') {
                return res.status(200).json({
                  ...user,
                  tutorStatus: 'pending',
                  canAccessDashboard: false,
                  message: 'Your tutor application is pending admin approval'
                });
              } else if (candidateStatus === 'rejected') {
                return res.status(200).json({
                  ...user,
                  tutorStatus: 'rejected',
                  canAccessDashboard: false,
                  message: 'Your tutor application has been rejected'
                });
              }
            } catch (statusError) {
              // Fallback to pending if status query fails
              return res.status(200).json({
                ...user,
                tutorStatus: 'pending',
                canAccessDashboard: false,
                message: 'Your tutor application is pending admin approval'
              });
            }
          }
        } catch (candidateError) {
          console.log('Error checking candidates table:', candidateError);
        }

        // No application found - user needs to complete registration
        // return res.status(200).json({
        //   ...user,
        //   tutorStatus: 'not_registered',
        //   canAccessDashboard: false,
        //   message: 'Please complete your tutor profile registration'
        // });
      }

      // User exists in Mass_Tutor table - check their status from Mass_Tutor table
      const tutorProfile = user.Mass_Tutor[0];
      
      try {
        // Query Mass_Tutor table for active/suspended status
        const tutorStatusResult = await prisma.$queryRaw`
          SELECT status FROM "Mass_Tutor" 
          WHERE m_tutor_id = ${tutorProfile.m_tutor_id}
          LIMIT 1
        ` as any[];
        
        const tutorStatus = tutorStatusResult[0]?.status || 'active';
        const canAccessDashboard = tutorStatus === 'active';

        return res.status(200).json({
          ...user,
          tutorStatus: tutorStatus, // 'active' or 'suspended'
          canAccessDashboard,
          message: tutorStatus === 'active' 
            ? 'Tutor profile active' 
            : 'Your tutor account has been suspended'
        });
      } catch (tutorError) {
        console.log('Error checking Mass_Tutor status:', tutorError);
        // Fallback to active if query fails
        return res.status(200).json({
          ...user,
          tutorStatus: 'active',
          canAccessDashboard: true,
          message: 'Tutor profile active'
        });
      }
    }

    // For other roles (Student, etc.), return user as is
    return res.status(200).json({
      ...user,
      tutorStatus: 'not_applicable',
      canAccessDashboard: true,
      message: 'User profile active'
    });
  } catch (error: any) {
    console.error('❌ Error in getUserByUid controller:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch user',
      detail: error.message 
    });
  }
};

/**
 * Add or update user
 * POST /api/users
 */
export const addUser = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userData = req.body;
    console.log("Received user data from frontend:", userData);

    const user = await createOrUpdateUser(userData);

    return res.status(201).json({
      created: true,
      user: user
    });
  } catch (error: any) {
    console.error('Error in addUser controller:', error);
    
    // Check if it's a validation error
    if (error.message.includes('Missing required fields') || 
        error.message.includes('Invalid role')) {
      return res.status(400).json({ 
        detail: error.message 
      });
    }

    return res.status(400).json({ 
      detail: error.message 
    });
  }
};

/**
 * Check if user exists and has the specified role
 * POST /api/users/check-role
 */
export const checkRole = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ 
        detail: 'Email and role are required' 
      });
    }

    const isValid = await validateUserRoleAndEmail(email, role);

    if (isValid) {
      return res.status(200).json({});
    } else {
      return res.status(400).json({ 
        detail: 'Invalid role or email' 
      });
    }
  } catch (error: any) {
    console.error('Error in checkRole controller:', error);
    return res.status(400).json({ 
      detail: error.message 
    });
  }
};

/**
 * Get all users (admin only)
 * GET /api/users
 */
export const getUsers = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { limit, offset, role } = req.query;
    
    const options = {
      ...(limit && { limit: parseInt(limit as string) }),
      ...(offset && { offset: parseInt(offset as string) }),
      ...(role && { role: role as string })
    };

    const users = await getAllUsers(options);

    return res.status(200).json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error: any) {
    console.error('Error in getUsers controller:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch users',
      detail: error.message 
    });
  }
};

export const updateUser = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { uid } = req.params;
    const userData = req.body;

    console.log("User data received for update:", userData);

    console.log("🔄 Update user request received for UID:", uid);
    console.log("📄 Request body:", userData);
    console.log("📸 Uploaded file:", req.file);

    if (!uid) {
      return res.status(400).json({ 
        error: 'User ID is required' 
      });
    }

    // Verify the requesting user matches the UID or has admin privileges
    if (req.user?.uid !== uid) {
      return res.status(403).json({ 
        error: 'Access denied: You can only update your own profile' 
      });
    }

    // Handle profile image upload if file is provided
    if (req.file) {
      // Type assertion for multer file with Cloudinary properties
      const file = req.file as Express.Multer.File & { 
        path: string;
        filename: string;
      };

      // Add the Cloudinary URL to userData
      userData.photo_url = file.path;
      console.log("✅ Profile image uploaded to Cloudinary:", file.path);
    }

    // Update user with the provided data (including photo_url if image was uploaded)
    const user = await createOrUpdateUser({
      firebase_uid: uid,
      ...userData
    });

    return res.status(200).json({
      message: 'Profile updated successfully',
      updated: true,
      user: user,
      ...(req.file && { 
        imageUploaded: true, 
        imageUrl: userData.photo_url 
      })
    });
  } catch (error: any) {
    console.error('❌ Error in updateUser controller:', error);
    return res.status(500).json({ 
      error: 'Failed to update user profile',
      detail: error.message 
    });
  }
};

/**
 * Upload profile image only
 * POST /api/users/upload-image/:uid
 */
export const uploadImage = async (req: AuthRequest, res: Response): Promise<Response> => {
  try {
    const { uid } = req.params;

    console.log("📸 Upload image request received for UID:", uid);
    console.log("📄 Uploaded file:", req.file);

    if (!uid) {
      return res.status(400).json({ 
        error: 'User ID is required' 
      });
    }

    if (!req.file) {
      return res.status(400).json({ 
        error: 'No image file provided' 
      });
    }

    // Verify the requesting user matches the UID or has admin privileges
    if (req.user?.uid !== uid) {
      return res.status(403).json({ 
        error: 'Access denied: You can only update your own profile' 
      });
    }

    // Type assertion for multer file with Cloudinary properties
    const file = req.file as Express.Multer.File & { 
      path: string;
      filename: string;
    };

    // Get current user data first
    const currentUser = await findUserByFirebaseUid(uid);
    if (!currentUser) {
      return res.status(404).json({ 
        error: 'User not found' 
      });
    }

    // Update user with just the new image URL
    const user = await createOrUpdateUser({
      firebase_uid: uid,
      email: currentUser.email,
      name: currentUser.name,
      role: currentUser.role,
      photo_url: file.path
    });

    return res.status(200).json({
      message: 'Profile image uploaded successfully',
      updated: true,
      imageUrl: file.path,
      filename: file.filename,
      user: user
    });
  } catch (error: any) {
    console.error('❌ Error in uploadImage controller:', error);
    return res.status(500).json({ 
      error: 'Failed to upload profile image',
      detail: error.message 
    });
  }
};

// export const getUserByUidController = async (req: AuthRequest, res: Response): Promise<Response> => {
//   try {
//     const { uid } = req.params;

//     if (!uid) {
//       return res.status(400).json({ 
//         error: 'User ID is required' 
//       });
//     }

//     const user = await getUserByUid(uid);
//     if (!user) {
//       return res.status(404).json({ 
//         error: 'User not found' 
//       });
//     }

//     return res.status(200).json({
//       message: 'User retrieved successfully',
//       user: user
//     });
//   } catch (error: any) {
//     console.error('❌ Error in getUserByUidController:', error);
//     return res.status(500).json({ 
//       error: 'Failed to retrieve user',
//       detail: error.message 
//     });
//   }
// };
