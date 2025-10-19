import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AuthPage from '../pages/auth';
import { AuthProvider } from '../context/authContext';
import { signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail, signOut } from 'firebase/auth';

// Mock TextEncoder/TextDecoder for React Router
global.TextEncoder = global.TextEncoder || require('util').TextEncoder;
global.TextDecoder = global.TextDecoder || require('util').TextDecoder;

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  signInWithPopup: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
  sendEmailVerification: jest.fn(),
  signOut: jest.fn(),
  GoogleAuthProvider: jest.fn(),
}));

// Mock Firebase config
jest.mock('../firebase.tsx', () => ({
  auth: {
    currentUser: null,
  },
}));

// Mock API calls
jest.mock('../api/Student.ts', () => ({
  addStudent: jest.fn(),
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({
    state: null,
  }),
}));

// Mock AuthContext
const mockAuthContext = {
  currentUser: null,
  userProfile: null,
  loading: false,
};

jest.mock('../context/authContext', () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Wrapper component for tests
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        {children}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('AuthPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
  });

  describe('Component Rendering', () => {
    test('renders login form by default', () => {
      render(
        <TestWrapper>
          <AuthPage />
        </TestWrapper>
      );

      expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    test('renders role selection for login', () => {
      render(
        <TestWrapper>
          <AuthPage />
        </TestWrapper>
      );

      expect(screen.getByText('Select Your Role')).toBeInTheDocument();
      expect(screen.getByText('Student')).toBeInTheDocument();
      expect(screen.getByText('Individual Tutor')).toBeInTheDocument();
      expect(screen.getByText('Mass Tutor')).toBeInTheDocument();
    });

    test('renders Google sign-in for students', () => {
      render(
        <TestWrapper>
          <AuthPage />
        </TestWrapper>
      );

      expect(screen.getByText('Continue with Google')).toBeInTheDocument();
    });

    test('renders forgot password link', () => {
      render(
        <TestWrapper>
          <AuthPage />
        </TestWrapper>
      );

      expect(screen.getByText('Forgot your password?')).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    test('updates email input correctly', () => {
      render(
        <TestWrapper>
          <AuthPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement;
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      
      expect(emailInput.value).toBe('test@example.com');
    });

    test('updates password input correctly', () => {
      render(
        <TestWrapper>
          <AuthPage />
        </TestWrapper>
      );

      const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      expect(passwordInput.value).toBe('password123');
    });

    test('toggles password visibility', () => {
      render(
        <TestWrapper>
          <AuthPage />
        </TestWrapper>
      );

      const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
      // Find the toggle button by looking for the button that's a sibling of the password input
      const passwordContainer = passwordInput.closest('div');
      const toggleButton = passwordContainer?.querySelector('button[type="button"]') as HTMLButtonElement;

      expect(passwordInput.type).toBe('password');
      
      fireEvent.click(toggleButton);
      expect(passwordInput.type).toBe('text');
      
      fireEvent.click(toggleButton);
      expect(passwordInput.type).toBe('password');
    });

    test('changes role selection', () => {
      render(
        <TestWrapper>
          <AuthPage />
        </TestWrapper>
      );

      const tutorRadio = screen.getByDisplayValue('Individual');
      fireEvent.click(tutorRadio);
      
      expect(tutorRadio).toBeChecked();
    });
  });

  describe('Authentication Flow', () => {
    test('handles successful login with verified email', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        emailVerified: true,
      };

      (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({ user: mockUser });
      
      // Mock successful role check
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      });

      render(
        <TestWrapper>
          <AuthPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
          expect.anything(),
          'test@example.com',
          'password123'
        );
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/studentprofile');
      });
    });

    test('handles login with unverified email', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        emailVerified: false,
      };

      (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({ user: mockUser });
      (signOut as jest.Mock).mockResolvedValue(undefined);

      // Mock successful role check
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      });

      render(
        <TestWrapper>
          <AuthPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(signOut).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByText(/please verify your email/i)).toBeInTheDocument();
      });
    });

    test('handles invalid role error', async () => {
      // Mock failed role check
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue({ detail: 'Invalid role for this account' }),
      });

      render(
        <TestWrapper>
          <AuthPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid role for this account')).toBeInTheDocument();
      });
    });

    test('handles Firebase auth errors', async () => {
      // Mock successful backend validation but failed Firebase auth
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      });
      
      (signInWithEmailAndPassword as jest.Mock).mockRejectedValue({
        code: 'auth/wrong-password',
      });

      render(
        <TestWrapper>
          <AuthPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);

      // Wait for the error to appear
      await waitFor(() => {
        expect(screen.getByText('Incorrect password')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Google Sign-In', () => {
    test('handles successful Google sign-in for students', async () => {
      const mockUser = {
        uid: 'google-uid',
        email: 'test@gmail.com',
        displayName: 'Test User',
        photoURL: 'https://example.com/photo.jpg',
      };

      (signInWithPopup as jest.Mock).mockResolvedValue({ user: mockUser });

      // Mock successful API calls
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ user: { id: '123' } }),
      });

      render(
        <TestWrapper>
          <AuthPage />
        </TestWrapper>
      );

      const googleButton = screen.getByText('Continue with Google');
      fireEvent.click(googleButton);

      await waitFor(() => {
        expect(signInWithPopup).toHaveBeenCalled();
      });
    });

    test('prevents Google sign-in for non-students', async () => {
      render(
        <TestWrapper>
          <AuthPage />
        </TestWrapper>
      );

      // Select tutor role
      const tutorRadio = screen.getByDisplayValue('Individual');
      fireEvent.click(tutorRadio);

      // Google button should not be visible for non-student roles
      expect(screen.queryByText('Continue with Google')).not.toBeInTheDocument();

      expect(signInWithPopup).not.toHaveBeenCalled();
    });
  });

  describe('Forgot Password Modal', () => {
    test('opens and closes forgot password modal', () => {
      render(
        <TestWrapper>
          <AuthPage />
        </TestWrapper>
      );

      const forgotPasswordLink = screen.getByText('Forgot your password?');
      fireEvent.click(forgotPasswordLink);

      expect(screen.getByText('Reset Password')).toBeInTheDocument();

      // Look for the Cancel button to close the modal
      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(screen.queryByText('Reset Password')).not.toBeInTheDocument();
    });

    test('handles successful password reset', async () => {
      (sendPasswordResetEmail as jest.Mock).mockResolvedValue(undefined);

      render(
        <TestWrapper>
          <AuthPage />
        </TestWrapper>
      );

      const forgotPasswordLink = screen.getByText('Forgot your password?');
      fireEvent.click(forgotPasswordLink);

      const emailInput = screen.getByPlaceholderText('Enter your email address');
      const sendButton = screen.getByRole('button', { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(sendPasswordResetEmail).toHaveBeenCalledWith(
          expect.anything(),
          'test@example.com'
        );
      });

      await waitFor(() => {
        expect(screen.getByText('Email Sent Successfully!')).toBeInTheDocument();
      });
    });

    test('handles password reset errors', async () => {
      (sendPasswordResetEmail as jest.Mock).mockRejectedValue({
        code: 'auth/user-not-found',
      });

      render(
        <TestWrapper>
          <AuthPage />
        </TestWrapper>
      );

      const forgotPasswordLink = screen.getByText('Forgot your password?');
      fireEvent.click(forgotPasswordLink);

      const emailInput = screen.getByPlaceholderText('Enter your email address');
      const sendButton = screen.getByRole('button', { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: 'notfound@example.com' } });
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(screen.getByText('No account found with this email address')).toBeInTheDocument();
      });
    });

    test('validates email format in forgot password', async () => {
      render(
        <TestWrapper>
          <AuthPage />
        </TestWrapper>
      );

      const forgotPasswordLink = screen.getByText('Forgot your password?');
      fireEvent.click(forgotPasswordLink);

      // Wait for modal to appear
      await waitFor(() => {
        expect(screen.getByText('Reset Password')).toBeInTheDocument();
      });

      const emailInput = screen.getByPlaceholderText('Enter your email address');
      const form = emailInput.closest('form');
      
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      
      // Submit the form instead of clicking the button
      fireEvent.submit(form!);
      
      // Wait for the error message to appear
      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      }, { timeout: 3000 });

      expect(sendPasswordResetEmail).not.toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    test('shows loading state during login', async () => {
      (signInWithEmailAndPassword as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      render(
        <TestWrapper>
          <AuthPage />
        </TestWrapper>
      );

      // Fill in the form first
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Processing...')).toBeInTheDocument();
      });
      expect(submitButton).toBeDisabled();
    });

    test('shows loading state during password reset', async () => {
      (sendPasswordResetEmail as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      render(
        <TestWrapper>
          <AuthPage />
        </TestWrapper>
      );

      const forgotPasswordLink = screen.getByText('Forgot your password?');
      fireEvent.click(forgotPasswordLink);

      const emailInput = screen.getByPlaceholderText('Enter your email address');
      const sendButton = screen.getByRole('button', { name: /send reset link/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(sendButton);

      expect(screen.getByText('Sending...')).toBeInTheDocument();
      expect(sendButton).toBeDisabled();
    });
  });

  describe('Navigation', () => {
    test('navigates to student profile after successful student login', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        emailVerified: true,
      };

      (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({ user: mockUser });
      
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      });

      render(
        <TestWrapper>
          <AuthPage />
        </TestWrapper>
      );

      // Fill in the form first
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/studentprofile');
      });
    });

    test('navigates to tutor profile after successful tutor login', async () => {
      const mockUser = {
        uid: 'test-uid',
        email: 'test@example.com',
        emailVerified: true,
      };

      (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({ user: mockUser });
      
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ success: true }),
      });

      render(
        <TestWrapper>
          <AuthPage />
        </TestWrapper>
      );

      // Select Individual tutor role
      const tutorRadio = screen.getByDisplayValue('Individual');
      fireEvent.click(tutorRadio);

      // Fill in the form
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/tutorprofile');
      });
    });
  });
});
