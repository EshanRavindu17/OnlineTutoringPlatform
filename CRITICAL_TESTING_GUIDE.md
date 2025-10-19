# 🔒 Critical Unit Testing Guide - Online Tutoring Platform

This guide focuses on testing the most critical components that are essential for system reliability and security.

## 🎯 Critical Components Tested

### **Backend Critical Tests**

- **JWT Utils** - Authentication token management and validation
- **Password Utils** - Secure password hashing and verification
- **Admin Service** - Admin authentication and authorization
- **User Service** - User creation, validation, and management
- **Payment Service** - Stripe payment processing integration

### **Frontend Critical Tests**

- **Time Slot Utils** - Critical time management functions
- **Token Manager** - Authentication state management
- **Email Verification** - User email verification flow

## 🚀 Quick Start

```bash
# Run all critical tests
npm test

# Run with coverage reports
npm run test:coverage

# Run in watch mode (for development)
npm run test:watch

# Run only backend critical tests
npm run test:backend

# Run only frontend critical tests
npm run test:frontend
```

## 📊 Coverage Goals

**Minimum Coverage Thresholds:**

- **Branches**: 60%
- **Functions**: 60%
- **Lines**: 60%
- **Statements**: 60%

These thresholds focus on critical paths that could cause system failures.

## 🔐 What These Tests Cover

### **Authentication Security**

- JWT token creation, validation, and refresh
- Password hashing with bcrypt
- Admin authentication flow
- Token expiration and revocation

### **Payment Processing**

- Stripe payment intent creation
- Payment record management
- Error handling for failed payments
- Currency conversion and validation

### **User Management**

- User creation and validation
- Role-based access control
- Data validation and sanitization
- Database operations

### **Time Management**

- Session scheduling validation
- Time slot formatting and normalization
- Future date/time validation
- Display formatting

### **State Management**

- Token storage and retrieval
- Authentication state persistence
- Error handling for corrupted data
- Local storage management

## 🧪 Test Structure

```
OnlineTutoringPlatform/
├── backend/
│   ├── src/
│   │   ├── __tests__/
│   │   │   ├── utils/
│   │   │   │   ├── jwt.test.ts
│   │   │   │   └── password.test.ts
│   │   │   └── services/
│   │   │       ├── admin.service.test.ts
│   │   │       ├── userService.test.ts
│   │   │       └── paymentService.test.ts
│   │   └── setupTests.ts
│   └── jest.config.js
├── frontend/
│   ├── src/
│   │   ├── __tests__/
│   │   │   └── utils/
│   │   │       ├── timeSlotUtils.test.ts
│   │   │       ├── tokenManager.test.ts
│   │   │       └── emailVerification.test.ts
│   │   └── setupTests.ts
│   └── jest.config.cjs
├── test-runner.js
└── CRITICAL_TESTING_GUIDE.md
```

## 🔧 Running Individual Tests

### Backend Tests

```bash
cd backend

# Run all backend tests
npm test

# Run specific test file
npm test -- jwt.test.ts

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### Frontend Tests

```bash
cd frontend

# Run all frontend tests
npm test

# Run specific test file
npm test -- timeSlotUtils.test.ts

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

## 📈 Coverage Reports

After running tests with coverage, view detailed reports:

- **Backend**: `backend/coverage/lcov-report/index.html`
- **Frontend**: `frontend/coverage/lcov-report/index.html`
- **Combined**: `critical-test-report.html`

## 🛠️ Test Examples

### Backend JWT Test

```typescript
describe("JWT Utils - Critical Authentication", () => {
  it("should create access token with correct payload", () => {
    const result = signAccessToken("admin123", "admin@example.com", 1);
    expect(result).toBeDefined();
    expect(mockJwt.sign).toHaveBeenCalledWith(
      expect.objectContaining({
        sub: "admin123",
        email: "admin@example.com",
        typ: "access",
      }),
      "test-access-secret",
      { expiresIn: "15m" }
    );
  });
});
```

### Frontend Time Utils Test

```typescript
describe("timeSlotUtils - Critical Time Management", () => {
  it("should format Date object to YYYY-MM-DD string", () => {
    const date = new Date("2024-01-15T10:30:00Z");
    const result = formatDateToString(date);
    expect(result).toBe("2024-01-15");
  });
});
```

## 🚨 Critical Test Scenarios

### **Authentication Failures**

- Invalid JWT tokens
- Expired tokens
- Wrong password verification
- Missing authentication data

### **Payment Failures**

- Stripe API errors
- Invalid payment amounts
- Network connectivity issues
- Database transaction failures

### **User Management Errors**

- Invalid user data
- Role validation failures
- Database constraint violations
- Missing required fields

### **Time Management Issues**

- Invalid date formats
- Past time slot selection
- Timezone handling errors
- Malformed time data

## 🔍 Debugging Tests

### Common Issues

1. **Mock not working**: Ensure mocks are defined before imports
2. **Async test failures**: Use `await` and proper error handling
3. **Database errors**: Check Prisma mock setup
4. **Environment variables**: Verify test environment setup

### Debug Commands

```bash
# Run tests in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand

# Run specific test with verbose output
npm test -- --verbose jwt.test.ts

# Clear Jest cache
npx jest --clearCache
```

## 📋 Test Checklist

Before deploying, ensure:

- [ ] All critical tests pass
- [ ] Coverage meets minimum thresholds
- [ ] Authentication flows work correctly
- [ ] Payment processing is secure
- [ ] User data validation is robust
- [ ] Time management is accurate
- [ ] Error handling is comprehensive

## 🎯 Why These Tests Matter

These critical unit tests focus on:

1. **Security**: Authentication and authorization
2. **Reliability**: Payment processing and data integrity
3. **User Experience**: Time management and state persistence
4. **System Stability**: Error handling and edge cases

**These are the components that, if they fail, would cause the entire system to malfunction or become insecure.**

---

**Remember**: These tests are your safety net for the most critical parts of your application. Always run them before deploying to production! 🚀
