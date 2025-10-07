import { sendVerificationEmail, isEmailVerified, reloadUserVerificationStatus } from '../utils/emailVerification';
import { sendEmailVerification, User } from 'firebase/auth';

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  sendEmailVerification: jest.fn(),
}));

describe('Email Verification Utilities', () => {
  let mockUser: Partial<User>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      emailVerified: false,
      reload: jest.fn(),
    };
  });

  describe('sendVerificationEmail', () => {
    test('sends verification email successfully', async () => {
      (sendEmailVerification as jest.Mock).mockResolvedValue(undefined);

      const result = await sendVerificationEmail(mockUser as User);

      expect(sendEmailVerification).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual({ success: true });
    });

    test('handles too many requests error', async () => {
      const error = { code: 'auth/too-many-requests' };
      (sendEmailVerification as jest.Mock).mockRejectedValue(error);

      const result = await sendVerificationEmail(mockUser as User);

      expect(result).toEqual({
        success: false,
        error: 'Too many requests. Please wait before trying again.',
      });
    });

    test('handles user disabled error', async () => {
      const error = { code: 'auth/user-disabled' };
      (sendEmailVerification as jest.Mock).mockRejectedValue(error);

      const result = await sendVerificationEmail(mockUser as User);

      expect(result).toEqual({
        success: false,
        error: 'Your account has been disabled.',
      });
    });

    test('handles invalid user token error', async () => {
      const error = { code: 'auth/invalid-user-token' };
      (sendEmailVerification as jest.Mock).mockRejectedValue(error);

      const result = await sendVerificationEmail(mockUser as User);

      expect(result).toEqual({
        success: false,
        error: 'Your session has expired. Please sign up again.',
      });
    });

    test('handles generic error', async () => {
      const error = { code: 'auth/unknown-error' };
      (sendEmailVerification as jest.Mock).mockRejectedValue(error);

      const result = await sendVerificationEmail(mockUser as User);

      expect(result).toEqual({
        success: false,
        error: 'Failed to send verification email. Please try again.',
      });
    });

    test('logs error to console', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Test error');
      (sendEmailVerification as jest.Mock).mockRejectedValue(error);

      await sendVerificationEmail(mockUser as User);

      expect(consoleSpy).toHaveBeenCalledWith('Send verification email error:', error);
      
      consoleSpy.mockRestore();
    });
  });

  describe('isEmailVerified', () => {
    test('returns true for verified user', () => {
      (mockUser as any).emailVerified = true;
      
      const result = isEmailVerified(mockUser as User);
      
      expect(result).toBe(true);
    });

    test('returns false for unverified user', () => {
      (mockUser as any).emailVerified = false;
      
      const result = isEmailVerified(mockUser as User);
      
      expect(result).toBe(false);
    });

    test('returns false for null user', () => {
      const result = isEmailVerified(null);
      
      expect(result).toBe(false);
    });

    test('returns false for undefined user', () => {
      const result = isEmailVerified(undefined as any);
      
      expect(result).toBe(false);
    });

    test('returns false when emailVerified is undefined', () => {
      const userWithoutEmailVerified = { ...mockUser };
      delete (userWithoutEmailVerified as any).emailVerified;
      
      const result = isEmailVerified(userWithoutEmailVerified as User);
      
      expect(result).toBe(false);
    });
  });

  describe('reloadUserVerificationStatus', () => {
    test('returns true for verified user after reload', async () => {
      (mockUser as any).emailVerified = true;
      (mockUser.reload as jest.Mock).mockResolvedValue(undefined);

      const result = await reloadUserVerificationStatus(mockUser as User);

      expect(mockUser.reload).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    test('returns false for unverified user after reload', async () => {
      (mockUser as any).emailVerified = false;
      (mockUser.reload as jest.Mock).mockResolvedValue(undefined);

      const result = await reloadUserVerificationStatus(mockUser as User);

      expect(mockUser.reload).toHaveBeenCalled();
      expect(result).toBe(false);
    });

    test('handles reload error and returns false', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Reload failed');
      (mockUser.reload as jest.Mock).mockRejectedValue(error);

      const result = await reloadUserVerificationStatus(mockUser as User);

      expect(consoleSpy).toHaveBeenCalledWith('Error reloading user verification status:', error);
      expect(result).toBe(false);
      
      consoleSpy.mockRestore();
    });

    test('handles network error during reload', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const networkError = { code: 'auth/network-request-failed' };
      (mockUser.reload as jest.Mock).mockRejectedValue(networkError);

      const result = await reloadUserVerificationStatus(mockUser as User);

      expect(consoleSpy).toHaveBeenCalledWith('Error reloading user verification status:', networkError);
      expect(result).toBe(false);
      
      consoleSpy.mockRestore();
    });

    test('updates user verification status correctly', async () => {
      // Start with unverified user
      (mockUser as any).emailVerified = false;
      
      // Simulate verification happening
      (mockUser.reload as jest.Mock).mockImplementation(() => {
        (mockUser as any).emailVerified = true;
        return Promise.resolve();
      });

      const result = await reloadUserVerificationStatus(mockUser as User);

      expect(result).toBe(true);
    });
  });

  describe('Integration scenarios', () => {
    test('full verification flow', async () => {
      // User starts unverified
      (mockUser as any).emailVerified = false;
      
      // Send verification email
      (sendEmailVerification as jest.Mock).mockResolvedValue(undefined);
      const sendResult = await sendVerificationEmail(mockUser as User);
      expect(sendResult.success).toBe(true);
      
      // Check initial status
      expect(isEmailVerified(mockUser as User)).toBe(false);
      
      // Simulate user clicking verification link (external action)
      // Then reload to check status
      (mockUser.reload as jest.Mock).mockImplementation(() => {
        (mockUser as any).emailVerified = true;
        return Promise.resolve();
      });
      
      const reloadResult = await reloadUserVerificationStatus(mockUser as User);
      expect(reloadResult).toBe(true);
      
      // Final verification check
      expect(isEmailVerified(mockUser as User)).toBe(true);
    });

    test('handles verification timeout scenario', async () => {
      (mockUser as any).emailVerified = false;
      
      // Multiple reload attempts while waiting for verification
      (mockUser.reload as jest.Mock).mockResolvedValue(undefined);
      
      // First check - still not verified
      let result = await reloadUserVerificationStatus(mockUser as User);
      expect(result).toBe(false);
      
      // Second check - still not verified
      result = await reloadUserVerificationStatus(mockUser as User);
      expect(result).toBe(false);
      
      // Third check - now verified
      (mockUser.reload as jest.Mock).mockImplementation(() => {
        (mockUser as any).emailVerified = true;
        return Promise.resolve();
      });
      
      result = await reloadUserVerificationStatus(mockUser as User);
      expect(result).toBe(true);
      
      expect(mockUser.reload).toHaveBeenCalledTimes(3);
    });

    test('handles resend verification email scenario', async () => {
      (mockUser as any).emailVerified = false;
      
      // First attempt
      (sendEmailVerification as jest.Mock).mockResolvedValue(undefined);
      let result = await sendVerificationEmail(mockUser as User);
      expect(result.success).toBe(true);
      
      // User didn't receive email, tries resend
      result = await sendVerificationEmail(mockUser as User);
      expect(result.success).toBe(true);
      
      expect(sendEmailVerification).toHaveBeenCalledTimes(2);
    });

    test('handles rate limiting during resend', async () => {
      (mockUser as any).emailVerified = false;
      
      // First attempt succeeds
      (sendEmailVerification as jest.Mock).mockResolvedValue(undefined);
      let result = await sendVerificationEmail(mockUser as User);
      expect(result.success).toBe(true);
      
      // Second attempt is rate limited
      const rateLimitError = { code: 'auth/too-many-requests' };
      (sendEmailVerification as jest.Mock).mockRejectedValue(rateLimitError);
      
      result = await sendVerificationEmail(mockUser as User);
      expect(result).toEqual({
        success: false,
        error: 'Too many requests. Please wait before trying again.',
      });
    });
  });
});
