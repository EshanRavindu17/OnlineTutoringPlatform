import { signAccessToken, signRefreshToken, verifyAccess, verifyRefresh } from '../jwt';
import jwt from 'jsonwebtoken';

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

const mockJwt = jwt as jest.Mocked<typeof jwt>;

describe('JWT Utils - Critical Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_ACCESS_SECRET = 'test-access-secret';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
  });

  describe('signAccessToken', () => {
    it('should create access token with correct payload', () => {
      const mockToken = 'mock-access-token';
      (mockJwt.sign as jest.Mock).mockReturnValue(mockToken);

      const result = signAccessToken('admin123', 'admin@example.com', 1);

      expect(result).toBe(mockToken);
      expect(mockJwt.sign).toHaveBeenCalledWith(
        {
          sub: 'admin123',
          email: 'admin@example.com',
          tv: 1,
          typ: 'access'
        },
        'test-access-secret',
        { expiresIn: '15m' }
      );
    });

    it('should handle different admin data', () => {
      const mockToken = 'mock-access-token';
      (mockJwt.sign as jest.Mock).mockReturnValue(mockToken);

      signAccessToken('admin456', 'test@example.com', 5);

      expect(mockJwt.sign).toHaveBeenCalledWith(
        {
          sub: 'admin456',
          email: 'test@example.com',
          tv: 5,
          typ: 'access'
        },
        'test-access-secret',
        { expiresIn: '15m' }
      );
    });
  });

  describe('signRefreshToken', () => {
    it('should create refresh token with correct payload', () => {
      const mockToken = 'mock-refresh-token';
      (mockJwt.sign as jest.Mock).mockReturnValue(mockToken);

      const result = signRefreshToken('admin123', 'admin@example.com', 1);

      expect(result).toBe(mockToken);
      expect(mockJwt.sign).toHaveBeenCalledWith(
        {
          sub: 'admin123',
          email: 'admin@example.com',
          tv: 1,
          typ: 'refresh'
        },
        'test-refresh-secret',
        { expiresIn: '7d' }
      );
    });
  });

  describe('verifyAccess', () => {
    it('should verify valid access token', () => {
      const mockPayload = {
        sub: 'admin123',
        email: 'admin@example.com',
        tv: 1,
        typ: 'access',
        iat: 1234567890,
        exp: 1234567890
      };
      (mockJwt.verify as jest.Mock).mockReturnValue(mockPayload);

      const result = verifyAccess('valid-access-token');

      expect(result).toEqual(mockPayload);
      expect(mockJwt.verify).toHaveBeenCalledWith('valid-access-token', 'test-access-secret');
    });

    it('should throw error for invalid token', () => {
      mockJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => verifyAccess('invalid-token')).toThrow('Invalid token');
    });

    it('should throw error for refresh token used as access token', () => {
      const mockPayload = {
        sub: 'admin123',
        email: 'admin@example.com',
        tv: 1,
        typ: 'refresh',
        iat: 1234567890,
        exp: 1234567890
      };
      (mockJwt.verify as jest.Mock).mockReturnValue(mockPayload);

      expect(() => verifyAccess('refresh-token')).toThrow('Not an access token');
    });

    it('should throw error for invalid payload type', () => {
      (mockJwt.verify as jest.Mock).mockReturnValue('invalid-payload-type');

      expect(() => verifyAccess('invalid-token')).toThrow('Invalid token payload type');
    });

    it('should throw error for invalid payload shape', () => {
      const invalidPayload = {
        sub: 'admin123',
        email: 'admin@example.com',
        tv: 'invalid-tv', // should be number
        typ: 'access'
      };
      (mockJwt.verify as jest.Mock).mockReturnValue(invalidPayload);

      expect(() => verifyAccess('invalid-token')).toThrow('Invalid token payload shape');
    });
  });

  describe('verifyRefresh', () => {
    it('should verify valid refresh token', () => {
      const mockPayload = {
        sub: 'admin123',
        email: 'admin@example.com',
        tv: 1,
        typ: 'refresh',
        iat: 1234567890,
        exp: 1234567890
      };
      (mockJwt.verify as jest.Mock).mockReturnValue(mockPayload);

      const result = verifyRefresh('valid-refresh-token');

      expect(result).toEqual(mockPayload);
      expect(mockJwt.verify).toHaveBeenCalledWith('valid-refresh-token', 'test-refresh-secret');
    });

    it('should throw error for access token used as refresh token', () => {
      const mockPayload = {
        sub: 'admin123',
        email: 'admin@example.com',
        tv: 1,
        typ: 'access',
        iat: 1234567890,
        exp: 1234567890
      };
      (mockJwt.verify as jest.Mock).mockReturnValue(mockPayload);

      expect(() => verifyRefresh('access-token')).toThrow('Not a refresh token');
    });

    it('should throw error for invalid token', () => {
      mockJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => verifyRefresh('invalid-token')).toThrow('Invalid token');
    });
  });
});