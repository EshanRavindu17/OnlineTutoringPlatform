import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/authContext';
import { onAuthStateChanged } from 'firebase/auth';

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
}));

// Mock Firebase config
jest.mock('../firebase.tsx', () => ({
  auth: {
    currentUser: null,
  },
}));

// Test component to consume auth context
const TestComponent = () => {
  const { currentUser, userProfile, loading } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="current-user">{currentUser ? currentUser.email : 'no-user'}</div>
      <div data-testid="user-profile">{userProfile ? userProfile.name : 'no-profile'}</div>
    </div>
  );
};

describe('AuthContext', () => {
  let mockUnsubscribe: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUnsubscribe = jest.fn();
    (onAuthStateChanged as jest.Mock).mockReturnValue(mockUnsubscribe);
    
    // Mock fetch globally
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('AuthProvider', () => {
    test('provides initial loading state', () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      expect(screen.getByTestId('current-user')).toHaveTextContent('no-user');
      expect(screen.getByTestId('user-profile')).toHaveTextContent('no-profile');
    });

    test('handles user with verified email', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        emailVerified: true,
        getIdToken: jest.fn().mockResolvedValue('mock-token'),
      };

      const mockProfile = {
        id: '1',
        firebase_uid: 'test-uid',
        email: 'test@example.com',
        name: 'Test User',
        role: 'student' as const,
        created_at: '2023-01-01',
        updated_at: '2023-01-01',
      };

      // Mock successful profile fetch
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockProfile),
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Simulate auth state change
      const authCallback = (onAuthStateChanged as jest.Mock).mock.calls[0][1];
      await authCallback(mockUser);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });

      await waitFor(() => {
        expect(screen.getByTestId('current-user')).toHaveTextContent('test@example.com');
      });

      await waitFor(() => {
        expect(screen.getByTestId('user-profile')).toHaveTextContent('Test User');
      });

      expect(mockUser.getIdToken).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:5000/api/user/test-uid',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-token',
          },
        }
      );
    });

    test('handles user with unverified email', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        emailVerified: false,
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Simulate auth state change
      const authCallback = (onAuthStateChanged as jest.Mock).mock.calls[0][1];
      await authCallback(mockUser);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });

      expect(screen.getByTestId('current-user')).toHaveTextContent('no-user');
      expect(screen.getByTestId('user-profile')).toHaveTextContent('no-profile');
      expect(global.fetch).not.toHaveBeenCalled();
    });

    test('handles no user (signed out)', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Simulate auth state change with no user
      const authCallback = (onAuthStateChanged as jest.Mock).mock.calls[0][1];
      await authCallback(null);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      });

      expect(screen.getByTestId('current-user')).toHaveTextContent('no-user');
      expect(screen.getByTestId('user-profile')).toHaveTextContent('no-profile');
    });

    test('handles profile fetch error with retry', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        emailVerified: true,
        getIdToken: jest.fn().mockResolvedValue('mock-token'),
      };

      // Mock failed then successful profile fetch
      (global.fetch as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({
            id: '1',
            firebase_uid: 'test-uid',
            email: 'test@example.com',
            name: 'Test User',
            role: 'student',
            created_at: '2023-01-01',
            updated_at: '2023-01-01',
          }),
        });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Simulate auth state change
      const authCallback = (onAuthStateChanged as jest.Mock).mock.calls[0][1];
      await authCallback(mockUser);

      await waitFor(() => {
        expect(screen.getByTestId('user-profile')).toHaveTextContent('Test User');
      });

      // Should have made 3 attempts
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    test('handles unauthorized response with token refresh', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        emailVerified: true,
        getIdToken: jest.fn()
          .mockResolvedValueOnce('old-token')
          .mockResolvedValueOnce('new-token'),
      };

      // Mock 401 response then success
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 401,
          statusText: 'Unauthorized',
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue({
            id: '1',
            firebase_uid: 'test-uid',
            email: 'test@example.com',
            name: 'Test User',
            role: 'student',
            created_at: '2023-01-01',
            updated_at: '2023-01-01',
          }),
        });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Simulate auth state change
      const authCallback = (onAuthStateChanged as jest.Mock).mock.calls[0][1];
      await authCallback(mockUser);

      await waitFor(() => {
        expect(screen.getByTestId('user-profile')).toHaveTextContent('Test User');
      });

      // Should have called getIdToken at least twice (refresh token)
      expect(mockUser.getIdToken).toHaveBeenCalledWith(true); // Force refresh
    });

    test('handles token expiration correctly', async () => {
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MDk0NTkyMDB9.'; // Expired token
      const freshToken = 'fresh-token';

      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        emailVerified: true,
        getIdToken: jest.fn()
          .mockResolvedValueOnce(expiredToken)
          .mockResolvedValueOnce(freshToken),
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          id: '1',
          firebase_uid: 'test-uid',
          email: 'test@example.com',
          name: 'Test User',
          role: 'student',
          created_at: '2023-01-01',
          updated_at: '2023-01-01',
        }),
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Simulate auth state change
      const authCallback = (onAuthStateChanged as jest.Mock).mock.calls[0][1];
      await authCallback(mockUser);

      await waitFor(() => {
        expect(screen.getByTestId('user-profile')).toHaveTextContent('Test User');
      });

      // Should have refreshed token due to expiration
      expect(mockUser.getIdToken).toHaveBeenCalledTimes(2);
    });

    test('cleans up localStorage on sign out', async () => {
      const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem');

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Simulate user sign in first
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        emailVerified: true,
        getIdToken: jest.fn().mockResolvedValue('mock-token'),
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          id: '1',
          name: 'Test User',
          role: 'student',
        }),
      });

      const authCallback = (onAuthStateChanged as jest.Mock).mock.calls[0][1];
      await authCallback(mockUser);

      // Then sign out
      await authCallback(null);

      await waitFor(() => {
        expect(removeItemSpy).toHaveBeenCalledWith('userType');
      });

      removeItemSpy.mockRestore();
    });

    test('sets userType in localStorage on successful profile fetch', async () => {
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');

      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        emailVerified: true,
        getIdToken: jest.fn().mockResolvedValue('mock-token'),
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          id: '1',
          firebase_uid: 'test-uid',
          email: 'test@example.com',
          name: 'Test User',
          role: 'Individual',
          created_at: '2023-01-01',
          updated_at: '2023-01-01',
        }),
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const authCallback = (onAuthStateChanged as jest.Mock).mock.calls[0][1];
      await authCallback(mockUser);

      await waitFor(() => {
        expect(setItemSpy).toHaveBeenCalledWith('userType', 'Individual');
      });

      setItemSpy.mockRestore();
    });

    test('handles complete profile fetch failure', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        emailVerified: true,
        getIdToken: jest.fn().mockResolvedValue('mock-token'),
      };

      // All fetch attempts fail
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const authCallback = (onAuthStateChanged as jest.Mock).mock.calls[0][1];
      await authCallback(mockUser);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch user profile after retries');
      });

      expect(screen.getByTestId('current-user')).toHaveTextContent('test@example.com');
      expect(screen.getByTestId('user-profile')).toHaveTextContent('no-profile');

      consoleSpy.mockRestore();
    });
  });

  describe('useAuth hook', () => {
    test('throws error when used outside AuthProvider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('Auth state persistence', () => {
    test('unsubscribes from auth state changes on unmount', () => {
      const { unmount } = render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(onAuthStateChanged).toHaveBeenCalled();

      unmount();

      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });
});
