// Jest setup file
// Mock environment variables
process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb';
process.env.NODE_ENV = 'test';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};