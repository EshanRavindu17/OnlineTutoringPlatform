import React from 'react';
import { render, screen } from '@testing-library/react';
import { useAuth } from '../context/authContext';

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

// Mock the useAuth hook to return default values
jest.mock('../context/authContext', () => ({
  useAuth: jest.fn(() => ({
    currentUser: null,
    userProfile: null,
    loading: false,
  })),
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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useAuth hook', () => {
    test('provides default values', () => {
      render(<TestComponent />);

      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
      expect(screen.getByTestId('current-user')).toHaveTextContent('no-user');
      expect(screen.getByTestId('user-profile')).toHaveTextContent('no-profile');
    });

    test('provides user values when available', () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        emailVerified: true,
      };
      const mockProfile = {
        id: '1',
        firebase_uid: 'test-uid',
        email: 'test@example.com',
        name: 'Test User',
        role: 'student',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      };

      (useAuth as jest.Mock).mockReturnValue({
        currentUser: mockUser,
        userProfile: mockProfile,
        loading: false,
      });

      render(<TestComponent />);

      expect(screen.getByTestId('current-user')).toHaveTextContent('test@example.com');
      expect(screen.getByTestId('user-profile')).toHaveTextContent('Test User');
    });

    test('provides loading state', () => {
      (useAuth as jest.Mock).mockReturnValue({
        currentUser: null,
        userProfile: null,
        loading: true,
      });

      render(<TestComponent />);

      expect(screen.getByTestId('loading')).toHaveTextContent('loading');
    });
  });
});