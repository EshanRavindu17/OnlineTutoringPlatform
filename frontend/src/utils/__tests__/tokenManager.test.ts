import { TokenManager, AuthStateManager } from '../tokenManager';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock console methods
const consoleSpy = {
  log: jest.spyOn(console, 'log').mockImplementation(),
  error: jest.spyOn(console, 'error').mockImplementation(),
};

describe('TokenManager - Critical Authentication State', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-15T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('storeTokenInfo', () => {
    it('should store valid token information', () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyNDI2MjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      
      TokenManager.storeTokenInfo(mockToken);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'firebase_token_info',
        expect.stringContaining('"token":"' + mockToken + '"')
      );
      expect(consoleSpy.log).toHaveBeenCalledWith('💾 Token info stored successfully');
    });

    it('should handle invalid token gracefully', () => {
      const invalidToken = 'invalid.token';
      
      TokenManager.storeTokenInfo(invalidToken);
      
      expect(consoleSpy.error).toHaveBeenCalledWith(
        '❌ Failed to store token info:',
        expect.any(Error)
      );
    });
  });

  describe('getStoredTokenInfo', () => {
    it('should return stored token info when valid', () => {
      const mockTokenInfo = {
        token: 'mock-token',
        expiresAt: 1516242622,
        refreshedAt: 1516239022
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockTokenInfo));
      
      const result = TokenManager.getStoredTokenInfo();
      
      expect(result).toEqual(mockTokenInfo);
    });

    it('should return null when no token stored', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const result = TokenManager.getStoredTokenInfo();
      
      expect(result).toBeNull();
    });

    it('should handle invalid JSON and clear storage', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');
      
      const result = TokenManager.getStoredTokenInfo();
      
      expect(result).toBeNull();
      expect(consoleSpy.error).toHaveBeenCalledWith(
        '❌ Failed to parse stored token info:',
        expect.any(Error)
      );
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('firebase_token_info');
    });
  });

  describe('isStoredTokenValid', () => {
    it('should return true for valid token', () => {
      const futureTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
      const mockTokenInfo = {
        token: 'mock-token',
        expiresAt: futureTime,
        refreshedAt: Math.floor(Date.now() / 1000)
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockTokenInfo));
      
      const result = TokenManager.isStoredTokenValid();
      
      expect(result).toBe(true);
    });

    it('should return false for expired token', () => {
      const pastTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const mockTokenInfo = {
        token: 'mock-token',
        expiresAt: pastTime,
        refreshedAt: Math.floor(Date.now() / 1000)
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockTokenInfo));
      
      const result = TokenManager.isStoredTokenValid();
      
      expect(result).toBe(false);
      expect(consoleSpy.log).toHaveBeenCalledWith('⚠️ Stored token is expired or expiring soon');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('firebase_token_info');
    });

    it('should return false when no token stored', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const result = TokenManager.isStoredTokenValid();
      
      expect(result).toBe(false);
    });
  });

  describe('getValidStoredToken', () => {
    it('should return token when valid', () => {
      const futureTime = Math.floor(Date.now() / 1000) + 3600;
      const mockTokenInfo = {
        token: 'valid-token',
        expiresAt: futureTime,
        refreshedAt: Math.floor(Date.now() / 1000)
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockTokenInfo));
      
      const result = TokenManager.getValidStoredToken();
      
      expect(result).toBe('valid-token');
    });

    it('should return null when token is invalid', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const result = TokenManager.getValidStoredToken();
      
      expect(result).toBeNull();
    });
  });

  describe('clearStoredToken', () => {
    it('should clear stored token', () => {
      TokenManager.clearStoredToken();
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('firebase_token_info');
      expect(consoleSpy.log).toHaveBeenCalledWith('🗑️ Stored token cleared');
    });
  });
});

describe('AuthStateManager - Critical User State', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('storeAuthState', () => {
    it('should store authentication state with userType', () => {
      const uid = 'user123';
      const email = 'test@example.com';
      const role = 'tutor';
      
      AuthStateManager.storeAuthState(uid, email, role);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'auth_state',
        expect.stringContaining('"uid":"user123"')
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith('userType', role);
      expect(consoleSpy.log).toHaveBeenCalledWith('💾 Auth state and userType stored successfully');
    });
  });

  describe('getStoredAuthState', () => {
    it('should return stored auth state when valid', () => {
      const mockAuthState = {
        uid: 'user123',
        email: 'test@example.com',
        role: 'tutor',
        lastLogin: Date.now(),
        isAuthenticated: true
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockAuthState));
      
      const result = AuthStateManager.getStoredAuthState();
      
      expect(result).toEqual(mockAuthState);
    });

    it('should return null when no auth state stored', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const result = AuthStateManager.getStoredAuthState();
      
      expect(result).toBeNull();
    });

    it('should handle invalid JSON and clear storage', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');
      
      const result = AuthStateManager.getStoredAuthState();
      
      expect(result).toBeNull();
      expect(consoleSpy.error).toHaveBeenCalledWith(
        '❌ Failed to parse auth state:',
        expect.any(Error)
      );
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_state');
    });
  });

  describe('clearAuthState', () => {
    it('should clear all auth-related storage', () => {
      AuthStateManager.clearAuthState();
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_state');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('userType');
      expect(consoleSpy.log).toHaveBeenCalledWith('🗑️ Auth state and userType cleared');
    });
  });

  describe('wasPreviouslyAuthenticated', () => {
    it('should return true for previously authenticated user', () => {
      const mockAuthState = {
        uid: 'user123',
        email: 'test@example.com',
        role: 'tutor',
        lastLogin: Date.now(),
        isAuthenticated: true
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockAuthState));
      
      const result = AuthStateManager.wasPreviouslyAuthenticated();
      
      expect(result).toBe(true);
    });

    it('should return false for unauthenticated user', () => {
      const mockAuthState = {
        uid: 'user123',
        email: 'test@example.com',
        role: 'tutor',
        lastLogin: Date.now(),
        isAuthenticated: false
      };
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockAuthState));
      
      const result = AuthStateManager.wasPreviouslyAuthenticated();
      
      expect(result).toBe(false);
    });

    it('should return false when no auth state stored', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const result = AuthStateManager.wasPreviouslyAuthenticated();
      
      expect(result).toBe(false);
    });
  });
});