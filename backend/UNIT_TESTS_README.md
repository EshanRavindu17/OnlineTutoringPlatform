# Student Service Unit Tests

This document outlines the comprehensive Jest unit tests created for the `studentService.ts` file in the Online Tutoring Platform backend.

## 📋 Test Coverage

The test suite covers the following functions from `studentService.ts`:

### ✅ Fully Tested Functions

1. **`addStudent`**
   - ✅ Creates new student when user exists and no existing student
   - ✅ Throws error when user not found
   - ✅ Updates existing student with customer_id
   - ⚠️ Note: Stripe integration test needs proper mocking configuration

2. **`getStudentIDByUserID`**
   - ✅ Returns student_id when student exists
   - ✅ Returns null when student does not exist

3. **`getAllIndividualTutors`**
   - ✅ Returns filtered tutors with default parameters
   - ✅ Applies filters correctly (subjects, titles, price range, rating, name)
   - ✅ Handles pagination and sorting

4. **`getIndividualTutorById`**
   - ✅ Returns tutor with additional counts (unique students, completed sessions)
   - ✅ Returns null when tutor not found

5. **`updateSlotStatus`**
   - ✅ Updates slot status successfully

6. **`findTimeSlots`**
   - ✅ Finds available time slots based on criteria

7. **`updateAccessTimeinFreeSlots`**
   - ✅ Updates access time in free slots

8. **`getAllSessionByStudentId`**
   - ✅ Returns all sessions for a student with review status

9. **`getSlotsOfIndividualTutorById`**
   - ✅ Returns slots for a tutor with date filtering

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install --save-dev jest @types/jest ts-jest
```

### 2. Configuration Files

#### `jest.config.json`
```json
{
  "preset": "ts-jest",
  "testEnvironment": "node",
  "roots": ["<rootDir>/src"],
  "testMatch": ["**/__tests__/**/*.test.ts"],
  "collectCoverageFrom": [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/index.ts",
    "!src/**/__tests__/**"
  ],
  "coverageDirectory": "coverage",
  "coverageReporters": ["text", "lcov", "html"],
  "setupFilesAfterEnv": ["<rootDir>/jest.setup.js"],
  "clearMocks": true,
  "resetMocks": true,
  "restoreMocks": true
}
```

#### `jest.setup.js`
```javascript
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
```

#### `tsconfig.json` (add Jest types)
```json
{
  "compilerOptions": {
    // ... other options
    "types": ["node", "jest"]
  }
}
```

#### `package.json` (update scripts)
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

## 🧪 Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Specific Test File
```bash
npx jest src/services/__tests__/studentService.simple.test.ts
```

## 📊 Test Results Summary

**Total Tests:** 14  
**Passing Tests:** 13  
**Failing Tests:** 1 (Stripe integration mock needs fixing)

### Test Breakdown

| Function | Test Cases | Status |
|----------|------------|--------|
| `addStudent` | 3 | 2/3 ✅ (1 needs Stripe mock fix) |
| `getStudentIDByUserID` | 2 | 2/2 ✅ |
| `getAllIndividualTutors` | 2 | 2/2 ✅ |
| `getIndividualTutorById` | 2 | 2/2 ✅ |
| `updateSlotStatus` | 1 | 1/1 ✅ |
| `findTimeSlots` | 1 | 1/1 ✅ |
| `updateAccessTimeinFreeSlots` | 1 | 1/1 ✅ |
| `getAllSessionByStudentId` | 1 | 1/1 ✅ |
| `getSlotsOfIndividualTutorById` | 1 | 1/1 ✅ |

## 🔧 Mock Strategy

The tests use comprehensive mocking for:

- **Prisma Client**: All database operations
- **Zoom Service**: Meeting creation
- **Payment Service**: Refund processing
- **Email Service**: Notification sending
- **Stripe**: Customer creation (needs refinement)

## 📈 Additional Tests Needed

### Functions Not Yet Tested
1. `createASession` - Session creation with Zoom integration
2. `cancelSession` - Complex session cancellation with refunds
3. `getTutorsByStudentId` - Student's tutor relationships
4. `getPaymentSummaryByStudentId` - Payment history
5. `getTutorNameAndTypeById` - Tutor information lookup
6. `getAllMassClasses` - Mass class listings
7. `getMassTutorById` - Mass tutor details
8. `getClassByClassIdAndStudentId` - Class enrollment details
9. `getClassSlotsByClassID` - Class scheduling

### Integration Tests
- Database integration tests with real Prisma setup
- API endpoint integration tests
- End-to-end workflow tests

## 🚀 Best Practices Implemented

1. **Arrange-Act-Assert Pattern**: Clear test structure
2. **Comprehensive Mocking**: All external dependencies mocked
3. **Edge Case Testing**: Error conditions and null cases
4. **Descriptive Test Names**: Clear understanding of test purpose
5. **Mock Isolation**: Each test starts with clean mocks
6. **Type Safety**: Full TypeScript support in tests

## 🔍 Known Issues & Solutions

### Issue 1: Stripe Mock
**Problem**: Stripe constructor not properly mocked  
**Solution**: Implement proper Stripe constructor mocking pattern

### Issue 2: Complex Object Mocking
**Problem**: Some Prisma return objects need nested property mocking  
**Solution**: Create factory functions for mock data generation

### Issue 3: Date/Time Dependencies
**Problem**: Functions using current date/time are hard to test consistently  
**Solution**: Mock DateTime/Date objects for consistent testing

## 📝 Example Test Structure

```typescript
describe('Function Name', () => {
  it('should do something when condition is met', async () => {
    // Arrange
    const mockData = { /* test data */ };
    mockPrismaClient.table.method.mockResolvedValue(mockData);

    // Act
    const result = await serviceFunction(inputParams);

    // Assert
    expect(mockPrismaClient.table.method).toHaveBeenCalledWith(expectedParams);
    expect(result).toEqual(expectedResult);
  });
});
```

This comprehensive test suite provides a solid foundation for ensuring the reliability and correctness of the student service functionality in the Online Tutoring Platform.