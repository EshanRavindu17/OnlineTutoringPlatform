import { hashPassword, verifyPassword } from '../password';
import bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('Password Utils - Critical Security', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash password with correct rounds', async () => {
      const mockHash = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewPVEQYMUVgQu.1K';
      (mockBcrypt.hash as jest.Mock).mockResolvedValue(mockHash);

      const result = await hashPassword('password123');

      expect(result).toBe(mockHash);
      expect(mockBcrypt.hash).toHaveBeenCalledWith('password123', 12);
    });

    it('should handle different passwords', async () => {
      const mockHash = '$2b$12$DifferentHashForDifferentPassword';
      (mockBcrypt.hash as jest.Mock).mockResolvedValue(mockHash);

      const result = await hashPassword('differentPassword');

      expect(result).toBe(mockHash);
      expect(mockBcrypt.hash).toHaveBeenCalledWith('differentPassword', 12);
    });

    it('should handle empty password', async () => {
      const mockHash = '$2b$12$EmptyPasswordHash';
      (mockBcrypt.hash as jest.Mock).mockResolvedValue(mockHash);

      const result = await hashPassword('');

      expect(result).toBe(mockHash);
      expect(mockBcrypt.hash).toHaveBeenCalledWith('', 12);
    });

    it('should handle special characters in password', async () => {
      const specialPassword = 'p@ssw0rd!@#$%^&*()';
      const mockHash = '$2b$12$SpecialCharsHash';
      (mockBcrypt.hash as jest.Mock).mockResolvedValue(mockHash);

      const result = await hashPassword(specialPassword);

      expect(result).toBe(mockHash);
      expect(mockBcrypt.hash).toHaveBeenCalledWith(specialPassword, 12);
    });

    it('should propagate bcrypt errors', async () => {
      const error = new Error('Bcrypt hashing failed');
      (mockBcrypt.hash as jest.Mock).mockRejectedValue(error);

      await expect(hashPassword('password123')).rejects.toThrow('Bcrypt hashing failed');
    });
  });

  describe('verifyPassword', () => {
    it('should return true for matching password and hash', async () => {
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await verifyPassword('password123', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewPVEQYMUVgQu.1K');

      expect(result).toBe(true);
      expect(mockBcrypt.compare).toHaveBeenCalledWith(
        'password123',
        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewPVEQYMUVgQu.1K'
      );
    });

    it('should return false for non-matching password and hash', async () => {
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await verifyPassword('wrongpassword', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewPVEQYMUVgQu.1K');

      expect(result).toBe(false);
      expect(mockBcrypt.compare).toHaveBeenCalledWith(
        'wrongpassword',
        '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewPVEQYMUVgQu.1K'
      );
    });

    it('should handle empty password', async () => {
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await verifyPassword('', '$2b$12$SomeHash');

      expect(result).toBe(false);
      expect(mockBcrypt.compare).toHaveBeenCalledWith('', '$2b$12$SomeHash');
    });

    it('should handle empty hash', async () => {
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await verifyPassword('password123', '');

      expect(result).toBe(false);
      expect(mockBcrypt.compare).toHaveBeenCalledWith('password123', '');
    });

    it('should handle malformed hash', async () => {
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await verifyPassword('password123', 'invalid-hash');

      expect(result).toBe(false);
      expect(mockBcrypt.compare).toHaveBeenCalledWith('password123', 'invalid-hash');
    });

    it('should propagate bcrypt errors', async () => {
      const error = new Error('Bcrypt comparison failed');
      (mockBcrypt.compare as jest.Mock).mockRejectedValue(error);

      await expect(verifyPassword('password123', 'hash')).rejects.toThrow('Bcrypt comparison failed');
    });
  });

  describe('integration scenarios', () => {
    it('should work with typical admin login flow', async () => {
      const password = 'adminPassword123';
      const mockHash = '$2b$12$GeneratedHashForPassword';
      
      // Simulate password hashing during admin signup
      (mockBcrypt.hash as jest.Mock).mockResolvedValue(mockHash);
      const hashedPassword = await hashPassword(password);
      expect(hashedPassword).toBe(mockHash);

      // Simulate password verification during admin login
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(true);
      const isValid = await verifyPassword(password, hashedPassword);
      expect(isValid).toBe(true);
    });

    it('should reject wrong password in admin login flow', async () => {
      const correctPassword = 'correctPassword123';
      const wrongPassword = 'wrongPassword123';
      const mockHash = '$2b$12$HashForCorrectPassword';
      
      // Simulate password hashing during admin signup
      (mockBcrypt.hash as jest.Mock).mockResolvedValue(mockHash);
      const hashedPassword = await hashPassword(correctPassword);
      expect(hashedPassword).toBe(mockHash);

      // Simulate password verification with wrong password
      (mockBcrypt.compare as jest.Mock).mockResolvedValue(false);
      const isValid = await verifyPassword(wrongPassword, hashedPassword);
      expect(isValid).toBe(false);
    });
  });
});