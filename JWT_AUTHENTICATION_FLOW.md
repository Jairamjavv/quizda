# 🔐 JWT Authentication Flow in Quizda

## Overview

Quizda uses **JWT (JSON Web Tokens)** for stateless authentication. This allows the server to verify user identity without maintaining session state, making the API scalable and secure.

---

## 🎯 How JWT Works in Quizda

### The Complete Flow

```
┌─────────┐                  ┌─────────┐                  ┌──────────┐
│ Client  │                  │ Server  │                  │ Database │
└────┬────┘                  └────┬────┘                  └────┬─────┘
     │                            │                            │
     │ 1. POST /auth/login        │                            │
     │ {email, password}          │                            │
     ├───────────────────────────>│                            │
     │                            │ 2. Verify credentials      │
     │                            ├───────────────────────────>│
     │                            │<───────────────────────────┤
     │                            │ 3. Generate JWT            │
     │                            │    jwt.sign({id, role})    │
     │ 4. Return JWT token        │                            │
     │<───────────────────────────┤                            │
     │ {token, email, role}       │                            │
     │                            │                            │
     │ 5. Store token in          │                            │
     │    localStorage            │                            │
     │                            │                            │
     │ 6. GET /quizzes            │                            │
     │ Authorization: Bearer JWT  │                            │
     ├───────────────────────────>│                            │
     │                            │ 7. Verify JWT              │
     │                            │    jwt.verify(token)       │
     │                            │                            │
     │                            │ 8. Extract user from token │
     │                            │    {id: 1, role: "user"}   │
     │                            │                            │
     │                            │ 9. Fetch data              │
     │                            ├───────────────────────────>│
     │ 10. Return data            │<───────────────────────────┤
     │<───────────────────────────┤                            │
     │                            │                            │
```

---

## 📦 JWT Token Structure

A JWT token in Quizda looks like this:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlciI6ImFkbWluIn0.signature
│────────── Header ──────────│ │──── Payload ────│ │─ Signature ─│
```

### Decoded Token Contents:

**Header:**

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload (What Quizda stores):**

```json
{
  "id": 1, // User ID from database
  "role": "user" // User role: "user" or "admin"
}
```

**Signature:**

- Created using `HMAC-SHA256` algorithm
- Signed with `JWT_SECRET` from environment variables
- Prevents token tampering

---

## 🔑 Backend Implementation

### 1. Token Generation (Login/Register)

**File:** `server/routes/auth.ts`

```typescript
// During registration or login
const token = jwt.sign(
  { id: user.id, role: user.role }, // Payload
  process.env.JWT_SECRET // Secret key
);

// Send token to client
res.json({
  token, // JWT token
  email: user.email,
  role: user.role,
});
```

**What happens:**

1. User logs in with email/password
2. Password is verified using bcrypt
3. JWT token is created with user's `id` and `role`
4. Token is sent back to client
5. Client stores token in localStorage

---

### 2. Token Verification (Middleware)

**File:** `server/middleware/auth.ts`

```typescript
function authenticateToken(req: Request, res: Response, next: NextFunction) {
  // 1. Extract token from Authorization header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  // 2. Check if token exists
  if (!token) return res.sendStatus(401); // Unauthorized

  // 3. Verify token
  jwt.verify(token, process.env.JWT_SECRET as string, (err, user) => {
    if (err) return res.sendStatus(403); // Forbidden (invalid token)

    // 4. Attach user data to request
    req.user = user; // Contains {id: 1, role: "user"}
    next(); // Continue to route handler
  });
}
```

**What happens:**

1. Middleware extracts token from `Authorization: Bearer <token>` header
2. Verifies token signature using JWT_SECRET
3. If valid, decodes payload and attaches to `req.user`
4. If invalid or expired, returns 403 error
5. If missing, returns 401 error

---

### 3. Role-Based Access Control

**File:** `server/middleware/role.ts`

```typescript
function requireRole(role: string) {
  return function (req: Request, res: Response, next: NextFunction) {
    // Check if user has required role
    if (
      !req.user ||
      typeof req.user !== "object" ||
      (req.user as any).role !== role
    ) {
      return res.sendStatus(403); // Forbidden
    }
    next(); // User has required role
  };
}
```

**Usage in routes:**

```typescript
// Protect all admin routes
router.use(authenticateToken, requireRole("admin"));
```

---

### 4. Protected Routes

#### User Routes (Auth Required)

**File:** `server/routes/quiz.ts`

```typescript
// Apply auth middleware to ALL routes in this router
router.use(authenticateToken);

router.get("/", async (req, res) => {
  // req.user is available here: {id: 1, role: "user"}
  res.json(await Quiz.getPublished());
});
```

#### Admin Routes (Auth + Admin Role Required)

**File:** `server/routes/admin.ts`

```typescript
// Apply both auth and role middlewares
router.use(authenticateToken, requireRole("admin"));

router.post("/quizzes", async (req, res) => {
  // Only users with role="admin" can access this
  const created_by = req.user.id;
  res.json(await Quiz.create({ ...req.body, created_by }));
});
```

---

## 💻 Frontend Implementation

### 1. Storing Token

**File:** `client/src/contexts/AuthContext.tsx`

```typescript
const login = async (email: string, password: string) => {
  // Make login request
  const response = await axios.post("/auth/login", { email, password });
  const { token, email: userEmail, role } = response.data;

  // Store in state and localStorage
  setToken(token);
  localStorage.setItem("token", token);
  localStorage.setItem("userEmail", userEmail);

  // Set as default header for all future requests
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

  // Decode token to get user info
  const payload = JSON.parse(atob(token.split(".")[1]));
  setUser({
    id: payload.id,
    email: userEmail,
    role: payload.role,
  });
};
```

**What happens:**

1. User submits login form
2. Token received from server
3. Token stored in **localStorage** (persists across page refreshes)
4. Token set as default `Authorization` header for axios
5. Token decoded to extract user info

---

### 2. Sending Token with Requests

**Automatic with Axios:**

```typescript
// Set once during login
axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

// Now ALL axios requests automatically include this header
await axios.get("/quizzes"); // Header included automatically
await axios.post("/quizzes/1/attempt", data); // Header included
```

**Manual approach (if needed):**

```typescript
await axios.get("/quizzes", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

---

### 3. Token Verification on App Load

```typescript
useEffect(() => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    verifyToken(); // Decode and set user
  }
}, [token]);

const verifyToken = async () => {
  try {
    // Decode JWT (client-side, no server call needed)
    const payload = JSON.parse(atob(token!.split(".")[1]));

    setUser({
      id: payload.id,
      email: storedEmail,
      role: payload.role,
    });
  } catch (error) {
    logout(); // Invalid token
  }
};
```

---

### 4. Logout

```typescript
const logout = () => {
  setUser(null);
  setToken(null);
  localStorage.removeItem("token");
  localStorage.removeItem("userEmail");
  delete axios.defaults.headers.common["Authorization"];
};
```

---

## 🔒 Security Features

### 1. Token Security

- ✅ **HMAC-SHA256** signing algorithm
- ✅ **Secret key** stored in environment variables
- ✅ **Stateless** - no server-side session storage
- ✅ **Tamper-proof** - any modification invalidates signature

### 2. Password Security

- ✅ **bcrypt hashing** with salt rounds (10)
- ✅ Passwords never stored in plain text
- ✅ Hash comparison during login

### 3. HTTP Headers

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

- Standard Bearer token format
- Sent with every authenticated request

### 4. Error Responses

- **401 Unauthorized** - Token missing
- **403 Forbidden** - Token invalid or insufficient permissions
- **400 Bad Request** - Invalid credentials

---

## 🎯 Access Control Levels

### Level 1: Public (No Auth)

```typescript
// No middleware
router.post("/auth/login", async (req, res) => {
  // Anyone can access
});
```

### Level 2: Authenticated Users

```typescript
router.use(authenticateToken);

router.get("/quizzes", async (req, res) => {
  // Any logged-in user can access
  // req.user available
});
```

### Level 3: Admin Only

```typescript
router.use(authenticateToken, requireRole("admin"));

router.post("/admin/quizzes", async (req, res) => {
  // Only admin users can access
  // req.user.role === "admin"
});
```

---

## 📊 Request/Response Flow Examples

### Example 1: User Login

```bash
# Request
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

# Response
HTTP/1.1 200 OK
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlciI6InVzZXIifQ...",
  "email": "user@example.com",
  "role": "user"
}
```

### Example 2: Access Protected Route

```bash
# Request
GET /quizzes
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Response (if valid token)
HTTP/1.1 200 OK
[
  { "id": "1", "title": "JavaScript Basics" },
  { "id": "2", "title": "React Fundamentals" }
]

# Response (if invalid/missing token)
HTTP/1.1 401 Unauthorized
```

### Example 3: Admin Access

```bash
# Request
POST /admin/quizzes
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "title": "New Quiz",
  "description": "Test quiz"
}

# Response (if admin token)
HTTP/1.1 200 OK
{ "id": "3", "title": "New Quiz", ... }

# Response (if non-admin token)
HTTP/1.1 403 Forbidden
```

---

## 🔄 Token Lifecycle

```
1. User logs in
   └─> Server generates JWT

2. Client receives token
   └─> Stores in localStorage
   └─> Sets as default axios header

3. User makes requests
   └─> Token sent in Authorization header

4. Server validates token
   └─> Checks signature with JWT_SECRET
   └─> Extracts user data from payload
   └─> Attaches to req.user

5. Route handler executes
   └─> Has access to req.user.id and req.user.role

6. User logs out
   └─> Client removes token from localStorage
   └─> Removes Authorization header
```

---

## 🛠️ Environment Configuration

**`.env` file:**

```env
JWT_SECRET=your-super-secret-key-here-change-in-production
```

**⚠️ Important:**

- Use a strong, random secret key
- Never commit secrets to version control
- Different secrets for dev/staging/production
- Rotate secrets periodically

---

## ⚡ Benefits of JWT Approach

1. **Stateless** - No session storage needed on server
2. **Scalable** - Works across multiple servers/instances
3. **Decoupled** - Frontend and backend can be separate
4. **Mobile-friendly** - Easy to use in mobile apps
5. **Standard** - Industry-standard authentication method
6. **Fast** - No database lookup for every request
7. **Self-contained** - Token includes user info

---

## 🎓 Key Takeaways

1. **Token Creation**: Server creates JWT during login/register with user `id` and `role`
2. **Token Storage**: Client stores in localStorage and sets as default header
3. **Token Sending**: Included in `Authorization: Bearer <token>` header
4. **Token Verification**: Middleware checks signature and extracts user data
5. **Access Control**: Combined with role checking for admin routes
6. **Security**: Signed with secret, tamper-proof, expires naturally

---

## 📚 Related Files

- `server/routes/auth.ts` - Token generation
- `server/middleware/auth.ts` - Token verification
- `server/middleware/role.ts` - Role-based access
- `client/src/contexts/AuthContext.tsx` - Frontend token management

---

**Questions or issues? Check the test files in `server/__tests__/` for working examples!**
