// Jest setup file
import { beforeEach, afterEach } from '@jest/globals';

// Global test setup
beforeEach(() => {
  // Reset environment variables if needed
  process.env.NODE_ENV = 'test';
});

afterEach(() => {
  // Clean up after each test
  jest.clearAllMocks();
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock environment variables
process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb';