# getAllIndividualTutors Endpoint - Complete Test Suite

## Overview
This is a comprehensive test file for the `router.get('/getAllIndividualTutors', getAllIndividualTutorsController)` endpoint that covers both service layer and API integration testing in a single organized file.

## File Location
📁 `src/__tests__/getAllIndividualTutors.comprehensive.test.ts`

## Test Structure

### 🔧 Test Setup
```typescript
// Environment mocking
process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key';

// Prisma client mocking
jest.mock('../prismaClient', () => ({
  individual_Tutor: {
    findMany: jest.fn(),
  },
}));

// Express app setup for API testing
const app = express();
app.use(express.json());
app.use('/api/students', studentsRoutes);
```

## Test Categories

### 1️⃣ Service Layer Tests (15 tests)
Tests the `getAllIndividualTutors` service function directly:

#### **Filtering Tests:**
- ✅ **No filters** - Returns all tutors
- ✅ **Subject filtering** - Filters by comma-separated subjects
- ✅ **Title filtering** - Filters by comma-separated titles  
- ✅ **Min hourly rate** - Filters tutors above rate threshold
- ✅ **Max hourly rate** - Filters tutors below rate threshold
- ✅ **Rating filtering** - Filters by minimum rating
- ✅ **Combined filters** - Multiple filters simultaneously
- ✅ **Subject spaces** - Handles "Computer Science, Data Analytics"

#### **Sorting Tests:**
- ✅ **Price ascending** - `price_asc` sort
- ✅ **Price descending** - `price_desc` sort  
- ✅ **Rating ascending** - `rating_asc` sort
- ✅ **Default/unknown sort** - Falls back to rating desc

#### **Data Handling Tests:**
- ✅ **Pagination** - Correct skip/take calculations
- ✅ **Empty results** - Returns empty array
- ✅ **Database errors** - Propagates exceptions

### 2️⃣ API Integration Tests (16 tests)
Tests the complete HTTP endpoint using Supertest:

#### **Success Cases:**
- ✅ **Basic GET request** - Returns 200 with tutor data
- ✅ **Subject query param** - `?subjects=Math,Science`
- ✅ **Title query param** - `?titles=PhD,MSc`
- ✅ **Rate range params** - `?min_hourly_rate=30&max_hourly_rate=45`
- ✅ **Rating param** - `?rating=4.3`
- ✅ **Sort param** - `?sort=price_asc`
- ✅ **Multiple params** - Combined query parameters
- ✅ **Empty results** - Returns empty array with 200 status

#### **Error Handling:**
- ✅ **Database errors** - Returns 500 with error message
- ✅ **Invalid params** - Gracefully handles invalid numeric values
- ✅ **Timeout errors** - Handles Prisma client timeouts

#### **Edge Cases:**
- ✅ **Empty strings** - Handles empty filter values
- ✅ **Single subject** - No comma separation needed
- ✅ **Spaces in subjects** - Proper trimming
- ✅ **Invalid sort** - Falls back to default
- ✅ **Large pagination** - Handles extreme values

### 3️⃣ Edge Case Tests (4 tests)
Special scenarios and boundary conditions:

- ✅ **Large pagination values** - Skip: 999000, Take: 1000
- ✅ **Zero pagination** - Skip: -0, Take: 0
- ✅ **Null user data** - Handles missing User relations
- ✅ **Empty arrays** - Empty subjects/titles arrays

## Mock Data Structure

```typescript
const mockTutors = [
  {
    i_tutor_id: 'tutor1',
    subjects: ['Math', 'Science'],
    titles: ['PhD', 'MSc'],
    hourly_rate: 50,
    rating: 4.5,
    description: 'Experienced math tutor',
    heading: 'Math Expert',
    User: {
      name: 'John Doe',
      photo_url: 'https://example.com/photo1.jpg'
    }
  },
  {
    i_tutor_id: 'tutor2',
    subjects: ['English', 'Literature'],
    titles: ['MA', 'BA'],
    hourly_rate: 40,
    rating: 4.2,
    description: 'English language specialist',
    heading: 'Language Expert',
    User: {
      name: 'Jane Smith',
      photo_url: 'https://example.com/photo2.jpg'
    }
  }
];
```

## Test Execution

### **Run Specific Test File:**
```bash
# Using npm script
npm run test:endpoint

# Direct Jest command
npx jest --testPathPatterns=comprehensive

# With verbose output
npx jest --testPathPatterns=comprehensive --verbose

# With coverage
npx jest --testPathPatterns=comprehensive --coverage
```

### **Run All Tests:**
```bash
npm test
```

## Key Features Tested

### ✅ **Complete Functionality Coverage**
- All query parameters (subjects, titles, hourly rates, rating, sort, page, limit)
- All sorting options (price_asc, price_desc, rating_asc, rating_desc, all)
- Pagination with skip/take calculations
- Error handling and edge cases

### ✅ **Realistic Test Scenarios**
- Multiple filter combinations
- Real-world data structures
- Common user input patterns
- Error conditions and recovery

### ✅ **Both Layers Tested**
- **Service Layer**: Direct function calls, pure business logic
- **API Layer**: HTTP requests, middleware, error handling

### ✅ **Comprehensive Error Handling**
- Database connection failures
- Prisma client timeouts  
- Invalid input parameters
- Empty result sets

## Test Assertions

### **Service Layer Assertions:**
```typescript
expect(mockPrisma.individual_Tutor.findMany).toHaveBeenCalledWith({
  where: { subjects: { hasSome: ['Math', 'Science'] } },
  include: { User: { select: { name: true, photo_url: true } } },
  orderBy: { rating: 'desc' },
  skip: 0,
  take: 10
});
```

### **API Layer Assertions:**
```typescript
const response = await request(app)
  .get('/api/students/getAllIndividualTutors')
  .query({ subjects: 'Math,Science' })
  .expect(200);

expect(response.body).toEqual(filteredTutors);
```

## Benefits of This Single File Approach

### ✅ **Comprehensive Coverage**
- **35 total tests** covering all functionality
- Both unit and integration testing
- Service layer and API layer validation

### ✅ **Organized Structure**
- Clear test categories with descriptive names
- Logical grouping of related functionality
- Easy to navigate and maintain

### ✅ **Complete Validation**
- Database query validation
- HTTP response validation
- Error handling validation
- Edge case coverage

### ✅ **Single Source of Truth**
- All endpoint tests in one file
- Consistent mock data and setup
- Unified test configuration

## Expected Results

**Total Tests**: 35
- **Service Layer**: 15 tests ✅
- **API Integration**: 16 tests ✅  
- **Edge Cases**: 4 tests ✅

**Coverage Areas**:
- ✅ Filtering logic
- ✅ Sorting functionality  
- ✅ Pagination handling
- ✅ Error scenarios
- ✅ Input validation
- ✅ Data transformation

This comprehensive test file ensures the `getAllIndividualTutors` endpoint is thoroughly validated for all use cases, providing confidence in the implementation's reliability and correctness.
