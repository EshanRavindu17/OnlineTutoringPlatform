import { adminSignupService, adminLoginService, adminRefreshService } from '../admin.service';
import prisma from '../../prismaClient';
import { hashPassword, verifyPassword } from '../../utils/password';
import { signAccessToken, signRefreshToken, verifyRefresh } from '../../utils/jwt';

// Mock dependencies
jest.mock('../../prismaClient');
jest.mock('../../utils/password');
jest.mock('../../utils/jwt');

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockHashPassword = hashPassword as jest.MockedFunction<typeof hashPassword>;
const mockVerifyPassword = verifyPassword as jest.MockedFunction<typeof verifyPassword>;
const mockSignAccessToken = signAccessToken as jest.MockedFunction<typeof signAccessToken>;
const mockSignRefreshToken = signRefreshToken as jest.MockedFunction<typeof signRefreshToken>;
const mockVerifyRefresh = verifyRefresh as jest.MockedFunction<typeof verifyRefresh>;

describe('Admin Service - Critical Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('adminSignupService', () => {
    it('should create new admin successfully', async () => {
      const adminData = {
        name: 'Test Admin',
        email: 'admin@example.com',
        password: 'password123',
        inviteCode: 'valid-invite-code'
      };

      const mockHashedPassword = 'hashed-password';
      const mockAdmin = {
        admin_id: 'admin123',
        name: adminData.name,
        email: adminData.email,
        password_hash: mockHashedPassword,
        token_version: 1,
        created_at: new Date(),
        last_login_at: null
      };

      mockHashPassword.mockResolvedValue(mockHashedPassword);
      (mockPrisma.admin.findUnique as jest.Mock).mockResolvedValue(null); // No existing admin
      (mockPrisma.admin.create as jest.Mock).mockResolvedValue(mockAdmin);
      mockSignAccessToken.mockReturnValue('access-token');
      mockSignRefreshToken.mockReturnValue('refresh-token');

      const result = await adminSignupService(
        adminData.name,
        adminData.email,
        adminData.password,
        adminData.inviteCode
      );

      expect(result).toEqual({
        admin: {
          admin_id: mockAdmin.admin_id,
          name: mockAdmin.name,
          email: mockAdmin.email,
          token_version: mockAdmin.token_version,
          created_at: mockAdmin.created_at,
          last_login_at: mockAdmin.last_login_at,
        },
        tokens: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token'
        }
      });

      expect(mockHashPassword).toHaveBeenCalledWith(adminData.password);
      expect(mockPrisma.admin.create).toHaveBeenCalledWith({
        data: {
          name: adminData.name,
          email: adminData.email,
          password_hash: mockHashedPassword
        }
      });
    });

    it('should throw error for missing required fields', async () => {
      await expect(adminSignupService('', 'admin@example.com', 'password123'))
        .rejects.toThrow('Missing fields');

      await expect(adminSignupService('Admin', '', 'password123'))
        .rejects.toThrow('Missing fields');

      await expect(adminSignupService('Admin', 'admin@example.com', ''))
        .rejects.toThrow('Missing fields');
    });

    it('should throw error for existing admin', async () => {
      const existingAdmin = {
        admin_id: 'existing123',
        name: 'Existing Admin',
        email: 'admin@example.com',
        password_hash: 'hash',
        token_version: 1
      };

      (mockPrisma.admin.findUnique as jest.Mock).mockResolvedValue(existingAdmin as any);

      await expect(adminSignupService('Test Admin', 'admin@example.com', 'password123'))
        .rejects.toThrow('Email already registered');
    });

    it('should handle password hashing errors', async () => {
      (mockPrisma.admin.findUnique as jest.Mock).mockResolvedValue(null);
      mockHashPassword.mockRejectedValue(new Error('Hashing failed'));

      await expect(adminSignupService('Test Admin', 'admin@example.com', 'password123'))
        .rejects.toThrow('Hashing failed');
    });
  });

  describe('adminLoginService', () => {
    it('should login admin successfully', async () => {
      const loginData = {
        email: 'admin@example.com',
        password: 'password123'
      };

      const mockAdmin = {
        admin_id: 'admin123',
        name: 'Test Admin',
        email: loginData.email,
        password_hash: 'hashed-password',
        token_version: 1,
        created_at: new Date(),
        last_login_at: null
      };

      (mockPrisma.admin.findUnique as jest.Mock).mockResolvedValue(mockAdmin as any);
      mockVerifyPassword.mockResolvedValue(true);
      (mockPrisma.admin.update as jest.Mock).mockResolvedValue(mockAdmin as any);
      mockSignAccessToken.mockReturnValue('access-token');
      mockSignRefreshToken.mockReturnValue('refresh-token');

      const result = await adminLoginService(loginData.email, loginData.password);

      expect(result).toEqual({
        admin: {
          admin_id: mockAdmin.admin_id,
          name: mockAdmin.name,
          email: mockAdmin.email,
          token_version: mockAdmin.token_version,
          created_at: mockAdmin.created_at,
          last_login_at: mockAdmin.last_login_at,
        },
        tokens: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token'
        }
      });

      expect(mockVerifyPassword).toHaveBeenCalledWith(loginData.password, mockAdmin.password_hash);
      expect(mockPrisma.admin.update).toHaveBeenCalledWith({
        where: { admin_id: mockAdmin.admin_id },
        data: { last_login_at: expect.any(Date) }
      });
    });

    it('should throw error for missing credentials', async () => {
      await expect(adminLoginService('', 'password123'))
        .rejects.toThrow('Missing fields');

      await expect(adminLoginService('admin@example.com', ''))
        .rejects.toThrow('Missing fields');
    });

    it('should throw error for non-existent admin', async () => {
      (mockPrisma.admin.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(adminLoginService('admin@example.com', 'password123'))
        .rejects.toThrow('Invalid credentials');
    });

    it('should throw error for wrong password', async () => {
      const mockAdmin = {
        admin_id: 'admin123',
        email: 'admin@example.com',
        password_hash: 'hashed-password'
      };

      (mockPrisma.admin.findUnique as jest.Mock).mockResolvedValue(mockAdmin as any);
      mockVerifyPassword.mockResolvedValue(false);

      await expect(adminLoginService('admin@example.com', 'wrongpassword'))
        .rejects.toThrow('Invalid credentials');
    });
  });

  describe('adminRefreshService', () => {
    it('should refresh tokens successfully', async () => {
      const refreshToken = 'valid-refresh-token';
      const mockDecodedToken = {
        sub: 'admin123',
        email: 'admin@example.com',
        tv: 1,
        typ: 'refresh'
      };

      const mockAdmin = {
        admin_id: 'admin123',
        name: 'Test Admin',
        email: 'admin@example.com',
        token_version: 1
      };

      mockVerifyRefresh.mockReturnValue(mockDecodedToken as any);
      (mockPrisma.admin.findUnique as jest.Mock).mockResolvedValue(mockAdmin as any);
      mockSignAccessToken.mockReturnValue('new-access-token');
      mockSignRefreshToken.mockReturnValue('new-refresh-token');

      const result = await adminRefreshService(refreshToken);

      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token'
      });

      expect(mockVerifyRefresh).toHaveBeenCalledWith(refreshToken);
      expect(mockPrisma.admin.findUnique).toHaveBeenCalledWith({
        where: { admin_id: mockDecodedToken.sub }
      });
    });

    it('should throw error for invalid refresh token', async () => {
      mockVerifyRefresh.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await expect(adminRefreshService('invalid-token'))
        .rejects.toThrow('Invalid token');
    });

    it('should throw error for non-existent admin', async () => {
      const mockDecodedToken = {
        sub: 'admin123',
        email: 'admin@example.com',
        tv: 1,
        typ: 'refresh'
      };

      mockVerifyRefresh.mockReturnValue(mockDecodedToken as any);
      (mockPrisma.admin.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(adminRefreshService('valid-token'))
        .rejects.toThrow('Admin not found');
    });

    it('should throw error for revoked token', async () => {
      const mockDecodedToken = {
        sub: 'admin123',
        email: 'admin@example.com',
        tv: 1,
        typ: 'refresh'
      };

      const mockAdmin = {
        admin_id: 'admin123',
        token_version: 2 // Different from token version
      };

      mockVerifyRefresh.mockReturnValue(mockDecodedToken as any);
      (mockPrisma.admin.findUnique as jest.Mock).mockResolvedValue(mockAdmin as any);

      await expect(adminRefreshService('valid-token'))
        .rejects.toThrow('Token revoked');
    });
  });
});
