import { sendVerificationEmail, isEmailVerified, reloadUserVerificationStatus } from '../emailVerification';
import { sendEmailVerification, User } from 'firebase/auth';

// Mock Firebase auth
jest.mock('firebase/auth', () => ({
  sendEmailVerification: jest.fn(),
}));

const mockSendEmailVerification = sendEmailVerification as jest.MockedFunction<typeof sendEmailVerification>;

describe('emailVerification - Critical Email Verification', () => {
  const mockUser = {
    email: 'test@example.com',
    emailVerified: false,
    reload: jest.fn(),
  } as unknown as User;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('sendVerificationEmail', () => {
    it('should send verification email successfully', async () => {
      mockSendEmailVerification.mockResolvedValueOnce(undefined);

      const result = await sendVerificationEmail(mockUser);

      expect(result).toEqual({ success: true });
      expect(mockSendEmailVerification).toHaveBeenCalledWith(mockUser);
    });

    it('should handle too many requests error', async () => {
      const error = { code: 'auth/too-many-requests' };
      mockSendEmailVerification.mockRejectedValueOnce(error);

      const result = await sendVerificationEmail(mockUser);

      expect(result).toEqual({
        success: false,
        error: 'Too many requests. Please wait before trying again.'
      });
    });

    it('should handle user disabled error', async () => {
      const error = { code: 'auth/user-disabled' };
      mockSendEmailVerification.mockRejectedValueOnce(error);

      const result = await sendVerificationEmail(mockUser);

      expect(result).toEqual({
        success: false,
        error: 'Your account has been disabled.'
      });
    });

    it('should handle invalid user token error', async () => {
      const error = { code: 'auth/invalid-user-token' };
      mockSendEmailVerification.mockRejectedValueOnce(error);

      const result = await sendVerificationEmail(mockUser);

      expect(result).toEqual({
        success: false,
        error: 'Your session has expired. Please sign up again.'
      });
    });

    it('should handle unknown error', async () => {
      const error = { code: 'auth/unknown-error' };
      mockSendEmailVerification.mockRejectedValueOnce(error);

      const result = await sendVerificationEmail(mockUser);

      expect(result).toEqual({
        success: false,
        error: 'Failed to send verification email. Please try again.'
      });
    });

    it('should handle error without code', async () => {
      const error = new Error('Network error');
      mockSendEmailVerification.mockRejectedValueOnce(error);

      const result = await sendVerificationEmail(mockUser);

      expect(result).toEqual({
        success: false,
        error: 'Failed to send verification email. Please try again.'
      });
    });
  });

  describe('isEmailVerified', () => {
    it('should return true for verified user', () => {
      const verifiedUser = { ...mockUser, emailVerified: true };
      const result = isEmailVerified(verifiedUser);
      expect(result).toBe(true);
    });

    it('should return false for unverified user', () => {
      const unverifiedUser = { ...mockUser, emailVerified: false };
      const result = isEmailVerified(unverifiedUser);
      expect(result).toBe(false);
    });

    it('should return false for null user', () => {
      const result = isEmailVerified(null);
      expect(result).toBe(false);
    });

    it('should return false for user without emailVerified property', () => {
      const userWithoutProperty = { email: 'test@example.com' } as User;
      const result = isEmailVerified(userWithoutProperty);
      expect(result).toBe(false);
    });
  });

  describe('reloadUserVerificationStatus', () => {
    it('should reload user and return verification status', async () => {
      const mockReload = jest.fn().mockResolvedValue(undefined);
      const userWithReload = { ...mockUser, reload: mockReload, emailVerified: true };

      const result = await reloadUserVerificationStatus(userWithReload);

      expect(mockReload).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should handle reload error gracefully', async () => {
      const mockReload = jest.fn().mockRejectedValue(new Error('Reload failed'));
      const userWithReload = { ...mockUser, reload: mockReload };

      const result = await reloadUserVerificationStatus(userWithReload);

      expect(mockReload).toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should return false if user emailVerified is false after reload', async () => {
      const mockReload = jest.fn().mockResolvedValue(undefined);
      const userWithReload = { ...mockUser, reload: mockReload, emailVerified: false };

      const result = await reloadUserVerificationStatus(userWithReload);

      expect(mockReload).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });
});