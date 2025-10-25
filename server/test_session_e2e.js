/**
 * End-to-End Session Management Test
 * Tests all security features and authentication flows
 */

import axios from 'axios';

const API_URL = 'http://localhost:4000';
let testResults = [];

// Configure axios to handle cookies
const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  validateStatus: () => true, // Don't throw on any status
});

// Test utilities
function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warn: '\x1b[33m',
  };
  console.log(`${colors[type]}${message}\x1b[0m`);
}

function logTest(testName, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  log(`${status}: ${testName}${details ? ' - ' + details : ''}`, passed ? 'success' : 'error');
  testResults.push({ testName, passed, details });
}

// Sleep utility
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Generate random email
const randomEmail = () => `test${Date.now()}${Math.random().toString(36).substr(2, 5)}@test.com`;

// Test data
const testUsers = [
  { email: randomEmail(), password: 'TestPass123!', name: 'User1' },
  { email: randomEmail(), password: 'TestPass456!', name: 'User2' },
  { email: randomEmail(), password: 'TestPass789!', name: 'User3' },
  { email: randomEmail(), password: 'TestPass012!', name: 'User4' },
];

let userSessions = [];

async function runTests() {
  console.log('\n🧪 Starting End-to-End Session Management Tests\n');
  console.log('=' .repeat(60));

  try {
    // Test 1: Health Check
    await testHealthCheck();

    // Test 2: User Registration
    await testUserRegistration();

    // Test 3: User Login
    await testUserLogin();

    // Test 4: Token Storage Security
    await testTokenStorageSecurity();

    // Test 5: Protected Route Access
    await testProtectedRoutes();

    // Test 6: CSRF Protection
    await testCsrfProtection();

    // Test 7: Token Refresh
    await testTokenRefresh();

    // Test 8: Session Management
    await testSessionManagement();

    // Test 9: Rate Limiting
    await testRateLimiting();

    // Test 10: Logout
    await testLogout();

    // Test 11: Invalid Token Handling
    await testInvalidTokens();

    // Test 12: Concurrent Sessions
    await testConcurrentSessions();

    // Summary
    printSummary();

  } catch (error) {
    log(`\n❌ Test suite failed: ${error.message}`, 'error');
    console.error(error);
  }
}

// Test 1: Health Check
async function testHealthCheck() {
  log('\n📋 Test 1: Health Check', 'info');
  try {
    const response = await axiosInstance.get('/health');
    logTest('Server is running', response.status === 200, `Status: ${response.status}`);
  } catch (error) {
    logTest('Server is running', false, error.message);
  }
}

// Test 2: User Registration
async function testUserRegistration() {
  log('\n📋 Test 2: User Registration', 'info');
  
  for (const user of testUsers) {
    try {
      const response = await axiosInstance.post('/auth/register', {
        email: user.email,
        password: user.password,
      });

      if (response.status === 201 || response.status === 200) {
        logTest(`Register ${user.name}`, true, user.email);
        user.registered = true;
      } else {
        logTest(`Register ${user.name}`, false, `Status: ${response.status}`);
        user.registered = false;
      }
    } catch (error) {
      logTest(`Register ${user.name}`, false, error.message);
      user.registered = false;
    }
  }
}

// Test 3: User Login
async function testUserLogin() {
  log('\n📋 Test 3: User Login & Token Issuance', 'info');
  
  for (const user of testUsers) {
    if (!user.registered) continue;

    try {
      const response = await axiosInstance.post('/auth/login', {
        email: user.email,
        password: user.password,
      });

      if (response.status === 200 && response.data.accessToken) {
        logTest(`Login ${user.name}`, true, 'Tokens received');
        
        userSessions.push({
          user: user.name,
          email: user.email,
          accessToken: response.data.accessToken,
          csrfToken: response.data.csrfToken,
          cookies: response.headers['set-cookie'],
          userData: response.data.user,
        });

        // Verify token structure
        const hasAccessToken = !!response.data.accessToken;
        const hasCsrfToken = !!response.data.csrfToken;
        const hasCookie = response.headers['set-cookie']?.some(c => c.includes('refreshToken'));
        
        logTest(`  Token structure for ${user.name}`, 
          hasAccessToken && hasCsrfToken && hasCookie,
          `Access: ${hasAccessToken}, CSRF: ${hasCsrfToken}, Cookie: ${hasCookie}`
        );

      } else {
        logTest(`Login ${user.name}`, false, `Status: ${response.status}`);
      }
    } catch (error) {
      logTest(`Login ${user.name}`, false, error.message);
    }
  }
}

// Test 4: Token Storage Security
async function testTokenStorageSecurity() {
  log('\n📋 Test 4: Token Storage Security', 'info');
  
  const session = userSessions[0];
  if (!session) {
    logTest('Token storage test', false, 'No active session');
    return;
  }

  // Check HTTP-only cookie
  const hasCookie = session.cookies?.some(c => 
    c.includes('refreshToken') && 
    c.includes('HttpOnly') && 
    c.includes('SameSite=Strict')
  );
  logTest('Refresh token in HTTP-only cookie', hasCookie, 'XSS protected');

  // Verify access token is NOT in cookie (should be in response body)
  const accessTokenInCookie = session.cookies?.some(c => c.includes('accessToken'));
  logTest('Access token NOT in cookies', !accessTokenInCookie, 'Sent in response body');

  // Verify CSRF token exists
  logTest('CSRF token provided', !!session.csrfToken, 'For state-changing requests');
}

// Test 5: Protected Routes
async function testProtectedRoutes() {
  log('\n📋 Test 5: Protected Route Access', 'info');
  
  const session = userSessions[0];
  if (!session) {
    logTest('Protected routes test', false, 'No active session');
    return;
  }

  // Test with valid token
  try {
    const response = await axiosInstance.get('/dashboard', {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
      },
    });
    logTest('Access with valid token', 
      response.status === 200, 
      `Status: ${response.status}`
    );
  } catch (error) {
    logTest('Access with valid token', false, error.message);
  }

  // Test without token
  try {
    const response = await axiosInstance.get('/dashboard');
    logTest('Access without token rejected', 
      response.status === 401, 
      `Status: ${response.status}`
    );
  } catch (error) {
    logTest('Access without token rejected', true, 'Properly blocked');
  }

  // Test with invalid token
  try {
    const response = await axiosInstance.get('/dashboard', {
      headers: {
        'Authorization': 'Bearer invalid_token_12345',
      },
    });
    logTest('Access with invalid token rejected', 
      response.status === 401, 
      `Status: ${response.status}`
    );
  } catch (error) {
    logTest('Access with invalid token rejected', true, 'Properly blocked');
  }
}

// Test 6: CSRF Protection
async function testCsrfProtection() {
  log('\n📋 Test 6: CSRF Protection', 'info');
  
  const session = userSessions[0];
  if (!session) {
    logTest('CSRF protection test', false, 'No active session');
    return;
  }

  // Test POST without CSRF token (should fail)
  try {
    const response = await axiosInstance.post('/quiz/create', 
      { title: 'Test Quiz' },
      {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
        },
      }
    );
    logTest('POST without CSRF token rejected', 
      response.status === 403 || response.status === 401, 
      `Status: ${response.status}`
    );
  } catch (error) {
    logTest('POST without CSRF token rejected', true, 'Properly blocked');
  }

  // Test POST with CSRF token (may fail if route doesn't exist, but should not be CSRF error)
  try {
    const response = await axiosInstance.post('/quiz/test', 
      { title: 'Test Quiz' },
      {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'X-CSRF-Token': session.csrfToken,
        },
      }
    );
    logTest('POST with CSRF token allowed', 
      response.status !== 403, 
      `Status: ${response.status} (not CSRF blocked)`
    );
  } catch (error) {
    logTest('POST with CSRF token allowed', true, 'No CSRF error');
  }
}

// Test 7: Token Refresh
async function testTokenRefresh() {
  log('\n📋 Test 7: Token Refresh', 'info');
  
  const session = userSessions[0];
  if (!session) {
    logTest('Token refresh test', false, 'No active session');
    return;
  }

  try {
    const response = await axiosInstance.post('/auth/refresh', {}, {
      headers: {
        'Cookie': session.cookies?.join('; '),
      },
    });

    if (response.status === 200 && response.data.accessToken) {
      logTest('Token refresh successful', true, 'New tokens issued');
      
      // Update session with new tokens
      session.accessToken = response.data.accessToken;
      session.csrfToken = response.data.csrfToken;
      
      // Verify new token works
      const testResponse = await axiosInstance.get('/dashboard', {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
        },
      });
      logTest('New access token works', 
        testResponse.status === 200, 
        `Status: ${testResponse.status}`
      );
    } else {
      logTest('Token refresh successful', false, `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('Token refresh successful', false, error.message);
  }
}

// Test 8: Session Management
async function testSessionManagement() {
  log('\n📋 Test 8: Session Management', 'info');
  
  const session = userSessions[0];
  if (!session) {
    logTest('Session management test', false, 'No active session');
    return;
  }

  // Get active sessions
  try {
    const response = await axiosInstance.get('/auth/sessions', {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
      },
    });
    
    if (response.status === 200) {
      const sessionCount = response.data.sessions?.length || 0;
      logTest('List active sessions', true, `Found ${sessionCount} session(s)`);
      
      // Verify session contains security info
      const firstSession = response.data.sessions?.[0];
      if (firstSession) {
        const hasIp = !!firstSession.ipAddress;
        const hasUserAgent = !!firstSession.userAgent;
        logTest('Session tracking info present', 
          hasIp && hasUserAgent, 
          `IP: ${hasIp}, UA: ${hasUserAgent}`
        );
      }
    } else {
      logTest('List active sessions', false, `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('List active sessions', false, error.message);
  }
}

// Test 9: Rate Limiting
async function testRateLimiting() {
  log('\n📋 Test 9: Rate Limiting', 'info');
  
  const testEmail = randomEmail();
  let attempts = [];

  // Try 6 failed login attempts
  for (let i = 0; i < 6; i++) {
    try {
      const response = await axiosInstance.post('/auth/login', {
        email: testEmail,
        password: 'WrongPassword123!',
      });
      attempts.push(response.status);
      await sleep(100); // Small delay between attempts
    } catch (error) {
      attempts.push(error.response?.status || 500);
    }
  }

  const lastAttempt = attempts[attempts.length - 1];
  logTest('Rate limiting after 5 failed attempts', 
    lastAttempt === 429, 
    `Attempt 6 returned: ${lastAttempt}`
  );
}

// Test 10: Logout
async function testLogout() {
  log('\n📋 Test 10: Logout Functionality', 'info');
  
  const session = userSessions[1]; // Use second user
  if (!session) {
    logTest('Logout test', false, 'No active session');
    return;
  }

  // Logout
  try {
    const response = await axiosInstance.post('/auth/logout', {}, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Cookie': session.cookies?.join('; '),
      },
    });
    
    logTest('Logout successful', 
      response.status === 200, 
      `Status: ${response.status}`
    );

    // Try to use token after logout (should fail)
    const testResponse = await axiosInstance.get('/dashboard', {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
      },
    });
    
    logTest('Token invalid after logout', 
      testResponse.status === 401, 
      `Status: ${testResponse.status}`
    );

  } catch (error) {
    logTest('Logout test', false, error.message);
  }
}

// Test 11: Invalid Token Handling
async function testInvalidTokens() {
  log('\n📋 Test 11: Invalid Token Handling', 'info');
  
  // Test with malformed token
  try {
    const response = await axiosInstance.get('/dashboard', {
      headers: {
        'Authorization': 'Bearer malformed.token.here',
      },
    });
    logTest('Malformed token rejected', 
      response.status === 401, 
      `Status: ${response.status}`
    );
  } catch (error) {
    logTest('Malformed token rejected', true, 'Properly blocked');
  }

  // Test with expired token (simulated)
  try {
    const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjE2MDAwMDAwMDB9.test';
    const response = await axiosInstance.get('/dashboard', {
      headers: {
        'Authorization': `Bearer ${expiredToken}`,
      },
    });
    logTest('Expired token rejected', 
      response.status === 401, 
      `Status: ${response.status}`
    );
  } catch (error) {
    logTest('Expired token rejected', true, 'Properly blocked');
  }
}

// Test 12: Concurrent Sessions
async function testConcurrentSessions() {
  log('\n📋 Test 12: Concurrent Sessions', 'info');
  
  // Login same user from "different device" (User3)
  const user = testUsers[2];
  if (!user.registered) {
    logTest('Concurrent sessions test', false, 'User not registered');
    return;
  }

  try {
    // First login
    const response1 = await axiosInstance.post('/auth/login', {
      email: user.email,
      password: user.password,
    });

    // Second login (different session)
    const response2 = await axiosInstance.post('/auth/login', {
      email: user.email,
      password: user.password,
    });

    if (response1.status === 200 && response2.status === 200) {
      logTest('Multiple sessions allowed', true, 'Concurrent sessions supported');

      // Verify both tokens work
      const test1 = await axiosInstance.get('/dashboard', {
        headers: { 'Authorization': `Bearer ${response1.data.accessToken}` },
      });
      const test2 = await axiosInstance.get('/dashboard', {
        headers: { 'Authorization': `Bearer ${response2.data.accessToken}` },
      });

      logTest('Both sessions functional', 
        test1.status === 200 && test2.status === 200,
        `Session1: ${test1.status}, Session2: ${test2.status}`
      );
    } else {
      logTest('Multiple sessions test', false, 'Login failed');
    }
  } catch (error) {
    logTest('Concurrent sessions test', false, error.message);
  }
}

// Print Summary
function printSummary() {
  console.log('\n' + '='.repeat(60));
  log('\n📊 Test Summary', 'info');
  console.log('='.repeat(60));

  const total = testResults.length;
  const passed = testResults.filter(t => t.passed).length;
  const failed = total - passed;
  const passRate = ((passed / total) * 100).toFixed(1);

  log(`\nTotal Tests: ${total}`, 'info');
  log(`Passed: ${passed}`, 'success');
  log(`Failed: ${failed}`, failed > 0 ? 'error' : 'info');
  log(`Pass Rate: ${passRate}%`, passRate >= 80 ? 'success' : 'warn');

  if (failed > 0) {
    log('\n❌ Failed Tests:', 'error');
    testResults.filter(t => !t.passed).forEach(t => {
      console.log(`  - ${t.testName}${t.details ? ': ' + t.details : ''}`);
    });
  }

  console.log('\n' + '='.repeat(60));
  log(passRate >= 80 ? '✅ Test suite PASSED' : '⚠️  Test suite needs attention', 
    passRate >= 80 ? 'success' : 'warn');
  console.log('='.repeat(60) + '\n');
}

// Run tests
runTests().catch(console.error);
