// Global Jest setup for route tests
import { jest } from '@jest/globals';

// Increase timeout for route tests
jest.setTimeout(10000);

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'mock://test-database';
process.env.JWT_SECRET = 'test-secret';
process.env.FIREBASE_PROJECT_ID = 'test-project';

// Global error handler to prevent unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Global cleanup
afterAll(async () => {
  // Wait a bit to allow any pending operations to complete
  await new Promise<void>(resolve => setTimeout(() => resolve(), 500));
});