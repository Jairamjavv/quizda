# Quick Test Reference Guide

## Running Tests

```bash
# Install dependencies (if not already done)
npm install

# Run all tests
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test File Structure

```
server/
├── __tests__/
│   ├── setup.ts              # Test environment configuration
│   ├── auth.test.ts          # Authentication endpoint tests
│   ├── quiz.test.ts          # Quiz endpoint tests
│   ├── admin.test.ts         # Admin endpoint tests
│   └── dashboard.test.ts     # Dashboard endpoint tests
├── jest.config.cjs           # Jest configuration
└── TEST_SUMMARY.md           # Detailed test documentation
```

## Endpoint Test Coverage by File

### auth.test.ts

- POST `/auth/register` - Create new user account
- POST `/auth/login` - User authentication

### quiz.test.ts

- GET `/quizzes` - List published quizzes
- GET `/quizzes/:id` - Get quiz details
- GET `/quizzes/:id/questions` - Get quiz questions
- POST `/quizzes/:id/attempt` - Submit quiz attempt

### admin.test.ts

**Quizzes:**

- GET `/admin/quizzes` - List all quizzes
- GET `/admin/quizzes/:id` - Get quiz details
- POST `/admin/quizzes` - Create quiz
- PUT `/admin/quizzes/:id` - Update quiz
- DELETE `/admin/quizzes/:id` - Delete quiz

**Questions:**

- GET `/admin/questions/:quiz_id` - List quiz questions
- POST `/admin/questions` - Create question
- PUT `/admin/questions/:id` - Update question
- DELETE `/admin/questions/:id` - Delete question

**Groups:**

- GET `/admin/groups` - List all groups
- GET `/admin/groups/:id` - Get group details
- POST `/admin/groups` - Create group
- PUT `/admin/groups/:id` - Update group
- DELETE `/admin/groups/:id` - Delete group

### dashboard.test.ts

- GET `/dashboard` - User analytics and metrics
- GET `/dashboard?groupId=X` - Filtered analytics

## Test Statistics

- **Total Test Suites**: 4
- **Total Tests**: 46
- **All Tests**: ✅ PASSING
- **Average Run Time**: ~4 seconds

## Coverage Report

```
File           | % Stmts | % Branch | % Funcs | % Lines
---------------|---------|----------|---------|--------
All files      |   62.5  |   61.6   |  50.58  |  62.46
 middleware    |  94.44  |   90.9   |   100   |   100
 routes        |  74.8   |   63.8   |    75   |  75.1
```

## Test Examples

### Testing Authentication

```typescript
// Register a new user
const response = await request(app).post("/auth/register").send({
  email: "test@example.com",
  password: "password123",
});

expect(response.status).toBe(200);
expect(response.body).toHaveProperty("token");
```

### Testing Protected Endpoints

```typescript
// Get quizzes with authentication
const response = await request(app)
  .get("/quizzes")
  .set("Authorization", `Bearer ${authToken}`);

expect(response.status).toBe(200);
```

### Testing Admin Endpoints

```typescript
// Create quiz (admin only)
const response = await request(app)
  .post("/admin/quizzes")
  .set("Authorization", `Bearer ${adminToken}`)
  .send({
    title: "New Quiz",
    description: "Quiz description",
  });

expect(response.status).toBe(200);
```

## Common Test Patterns

### Success Cases

- Valid data returns 200/201
- Response includes expected fields
- Data structure matches schema

### Error Cases

- Missing authentication returns 401
- Non-admin access returns 403
- Invalid data returns 400
- Not found returns 404

## Debugging Tests

### View detailed output

```bash
npm test -- --verbose
```

### Run specific test file

```bash
npm test auth.test.ts
```

### Run specific test case

```bash
npm test -- -t "should register a new user"
```

## Environment Variables

The test suite uses these environment variables (configured in `__tests__/setup.ts`):

- `JWT_SECRET`: Secret key for JWT tokens
- `NODE_ENV`: Set to 'test'

## Mocking Strategy

All tests use mocked database models:

- `User` model - Authentication operations
- `Quiz` model - Quiz CRUD operations
- `Question` model - Question CRUD operations
- `Group` model - Group CRUD operations
- `Attempt` model - Quiz attempt tracking

This ensures tests run quickly without database dependencies.

## CI/CD Integration

Add to your CI pipeline:

```yaml
# GitHub Actions example
- name: Run tests
  run: npm test

- name: Check coverage
  run: npm run test:coverage
```

## Next Steps

1. **Integration Tests**: Test with real database
2. **E2E Tests**: Test complete user workflows
3. **Performance Tests**: Load and stress testing
4. **Security Tests**: Penetration testing
5. **API Contract Tests**: Validate API specifications

## Troubleshooting

### Tests fail with "Cannot find module"

```bash
npm install
```

### Tests timeout

Increase timeout in jest.config.cjs:

```javascript
testTimeout: 10000; // 10 seconds
```

### Mock not working

Ensure `jest.clearAllMocks()` in `beforeEach()`:

```typescript
beforeEach(() => {
  jest.clearAllMocks();
});
```

## Contributing

When adding new endpoints:

1. Create tests in appropriate test file
2. Test all success cases
3. Test all error cases (401, 403, 404, etc.)
4. Update this documentation

---

For detailed test results and analysis, see [TEST_SUMMARY.md](./TEST_SUMMARY.md)
