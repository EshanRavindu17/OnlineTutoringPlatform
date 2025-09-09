import { sendEmailVerification, User } from 'firebase/auth';

export interface EmailVerificationResult {
  success: boolean;
  error?: string;
}

/**
 * Sends a verification email to the given Firebase user
 */
export const sendVerificationEmail = async (user: User): Promise<EmailVerificationResult> => {
  try {
    await sendEmailVerification(user);
    return { success: true };
  } catch (error: any) {
    console.error('Send verification email error:', error);
    
    let errorMessage = 'Failed to send verification email. Please try again.';
    
    switch (error.code) {
      case 'auth/too-many-requests':
        errorMessage = 'Too many requests. Please wait before trying again.';
        break;
      case 'auth/user-disabled':
        errorMessage = 'Your account has been disabled.';
        break;
      case 'auth/invalid-user-token':
        errorMessage = 'Your session has expired. Please sign up again.';
        break;
    }
    
    return { success: false, error: errorMessage };
  }
};

/**
 * Checks if a Firebase user's email is verified
 */
export const isEmailVerified = (user: User | null): boolean => {
  return user?.emailVerified ?? false;
};

/**
 * Reloads the Firebase user to get the latest email verification status
 */
export const reloadUserVerificationStatus = async (user: User): Promise<boolean> => {
  try {
    await user.reload();
    return user.emailVerified;
  } catch (error) {
    console.error('Error reloading user verification status:', error);
    return false;
  }
};
