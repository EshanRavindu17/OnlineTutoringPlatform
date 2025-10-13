
// If you use timers in services later:
// import { jest } from '@jest/globals'; // not needed in ts-jest context

// jest.useFakeTimers().setSystemTime(new Date('2024-01-01T00:00:00Z'));

// backend/tests/setup.ts
process.env.NODE_ENV = 'test';
process.env.TZ = 'UTC';