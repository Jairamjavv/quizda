# Quizda - Complete Documentation

> Comprehensive guide covering setup, development, deployment, authentication, and design for the Quizda quiz platform.

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Environment Setup](#environment-setup)
4. [Design System](#design-system)
5. [Question Types](#question-types)
6. [Authentication](#authentication)
7. [Session Management](#session-management)
8. [Migration Guides](#migration-guides)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

# 1. Overview

## Project Structure

```
quizda/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── contexts/    # Auth contexts (V1 & V2)
│   │   ├── pages/       # Page components
│   │   └── utils/       # Session manager
│   └── package.json
├── server/              # Express backend
│   ├── middleware/      # Auth & role middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   └── utils/           # Token utilities
└── README.md
```

## Technology Stack

- **Frontend**: React 18.3.1 + TypeScript 5.9.3 + Vite 7.1.10 + Material-UI
- **Backend**: Express.js + PostgreSQL (Neon) + MongoDB Atlas
- **Authentication**: JWT access tokens + HTTP-only refresh tokens
- **Session Management**: Database-backed with CSRF protection

---

# 2. Quick Start

## Installation

```bash
# Clone repository
git clone <repository-url>
cd quizda

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

## Database Setup

```bash
# Run database initialization (includes session management tables)
cd server
npm run build
node dist/init_db.js
```

## Run Development Servers

```bash
# Terminal 1: Backend (port 4000)
cd server
npm run dev

# Terminal 2: Frontend (port 5173)
cd client
npm run dev
```

## Access Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000
- **API Docs**: http://localhost:4000/api-docs (Swagger)

---

# 3. Environment Setup

## Environment Variables

### Backend (.env)

```bash
# ===================================
# DATABASE CONFIGURATION
# ===================================

# PostgreSQL Database (Neon)
# Find at: https://console.neon.tech → Your Project → Connection Details
DATABASE_URL=postgresql://username:password@host/database

# MongoDB Atlas
# Find at: https://cloud.mongodb.com → Clusters → Connect → Connect your application
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/quizda?retryWrites=true&w=majority

# ===================================
# JWT AUTHENTICATION
# ===================================

# JWT Secret Key (MUST be strong, minimum 32 characters)
# Generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-super-secret-key-minimum-32-characters-long

# JWT Access Token Expiry (short-lived)
JWT_ACCESS_EXPIRY=15m

# ===================================
# SERVER CONFIGURATION
# ===================================

# Application Environment
NODE_ENV=development  # or production

# Server Port
PORT=4000

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173

# ===================================
# SECURITY SETTINGS
# ===================================

# Rate Limiting
MAX_LOGIN_ATTEMPTS=5
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes

# Session Duration
SESSION_EXPIRY_HOURS=12  # Default without "remember me"
SESSION_EXPIRY_DAYS=30   # With "remember me"
```

### Frontend (.env)

```bash
# Backend API URL
VITE_API_URL=http://localhost:4000

# Application Name
VITE_APP_NAME=Quizda

# Environment
VITE_NODE_ENV=development
```

## How to Generate Secrets

### JWT_SECRET

```bash
# Method 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Method 2: Using OpenSSL
openssl rand -hex 32

# Method 3: Online
# Visit: https://www.random.org/strings/
# Generate 64-character alphanumeric string
```

### Database URLs

**PostgreSQL (Neon):**

1. Go to https://console.neon.tech
2. Select your project
3. Go to "Connection Details"
4. Copy the connection string (includes password)
5. Format: `postgresql://user:password@host/database?sslmode=require`

**MongoDB Atlas:**

1. Go to https://cloud.mongodb.com
2. Click "Clusters" → "Connect"
3. Select "Connect your application"
4. Copy connection string
5. Replace `<password>` with your database password
6. Format: `mongodb+srv://user:password@cluster.mongodb.net/database?retryWrites=true&w=majority`

## GitHub Secrets (for CI/CD)

Add these secrets to your GitHub repository:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add each secret:

| Secret Name    | Value                        | Description         |
| -------------- | ---------------------------- | ------------------- |
| `DATABASE_URL` | PostgreSQL connection string | Neon database URL   |
| `MONGO_URI`    | MongoDB connection string    | MongoDB Atlas URL   |
| `JWT_SECRET`   | Your JWT secret key          | Min 32 characters   |
| `CLIENT_URL`   | Your frontend URL            | Render frontend URL |
| `NODE_ENV`     | `production`                 | Environment setting |
| `PORT`         | `4000`                       | Backend port        |
| `VITE_API_URL` | Your backend API URL         | Render backend URL  |

## Security Best Practices

### Environment Files

- ✅ **NEVER** commit `.env` files to git
- ✅ Use `.env.example` as template (without real values)
- ✅ Keep `.env` in `.gitignore`
- ✅ Use different `.env` files for development/production

### Secret Management

- ✅ **JWT_SECRET**: Minimum 32 characters, truly random
- ✅ **Database passwords**: Strong, unique, rotated periodically
- ✅ **GitHub Secrets**: Use for CI/CD, never hardcode
- ✅ **API keys**: Store in environment variables, never in code

### Production Checklist

- [ ] All secrets are strong and unique
- [ ] `.env` file is not in repository
- [ ] GitHub Secrets are configured
- [ ] Database URLs use SSL/TLS
- [ ] CORS is configured with specific origin (not `*`)
- [ ] `NODE_ENV=production` is set
- [ ] HTTPS is enforced
- [ ] Rate limiting is enabled

---

# 4. Design System

## 🎨 Color Palette

### Primary Colors

- **Primary Dark**: `#121212` (Black)
- **Primary Light**: `#FFFFFF` (White)

### Accent Colors

- **Accent Green**: `#00B15E` (Success, Action, Confirmation)
- **Accent Orange**: `#FF7A00` (Highlight, Warning, Alert)

### Neutral

- **Neutral Gray**: `#E0E0E0` (Borders, Dividers)

## Design Principles

### 1. Minimalism

- High contrast between elements
- Generous whitespace
- Maximum 3 colors per screen
- Let content breathe

### 2. Accent Control

**One accent color per context:**

- ✅ **Green** = Success, action buttons, confirmation states, progress
- 🔶 **Orange** = Highlights, warnings, alerts, pending states
- ❌ **Never mix both heavily** in the same visual frame

### 3. Typography

- **Fonts**: Inter, Poppins, or system sans-serif
- **Contrast Rules**:
  - Black (`#121212`) text on light backgrounds
  - White (`#FFFFFF`) text on dark backgrounds
- **Hierarchy**: Use size and weight, not color

### 4. Shadows and Borders

- **Soft Shadows**: `rgba(0, 0, 0, 0.1)` for depth
- **Subtle Borders**: `1px solid #E0E0E0`
- Avoid heavy drop shadows

### 5. Spacing

- **Grid System**: 8px or 12px base unit
- **Minimum Padding**: 16–24px in cards/containers
- **Consistent Gaps**: Use multiples of base unit

## Component Specifications

### Card Component

```css
/* Light Mode */
background: #ffffff;
color: #121212;
border: 1px solid #e0e0e0;
border-radius: 16px;
padding: 24px;
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

/* Hover State */
transform: scale(1.02);
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
border-color: #00b15e; /* Green accent tint */
```

### Button Components

**Primary Button (Green):**

```css
background: #00b15e;
color: #ffffff;
border: none;
border-radius: 12px;
padding: 16px 32px;
font-weight: 600;
cursor: pointer;
transition: all 0.2s ease;

/* Hover */
background: #009b50;
transform: translateY(-2px);
box-shadow: 0 4px 12px rgba(0, 177, 94, 0.3);
```

**Secondary Link (Orange):**

```css
color: #ff7a00;
text-decoration: underline;
font-weight: 500;

/* Hover */
color: #e66d00;
```

### Input Fields

```css
/* Light Mode */
background: #f2f2f2;
border: 1px solid #e0e0e0;
border-radius: 12px;
padding: 16px;
color: #121212;

/* Focus State */
outline: 2px solid #00b15e;
box-shadow: 0 0 0 4px rgba(0, 177, 94, 0.1);
```

## TailwindCSS Configuration

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        "primary-dark": "#121212",
        "primary-light": "#FFFFFF",
        "accent-green": "#00B15E",
        "accent-orange": "#FF7A00",
        "neutral-gray": "#E0E0E0",
        "dark-card": "#1E1E1E",
        "light-input": "#F2F2F2",
        "dark-input": "#1A1A1A",
      },
      borderRadius: {
        card: "16px",
        bento: "20px",
        input: "12px",
      },
      spacing: {
        card: "24px",
        container: "32px",
        form: "48px",
      },
      boxShadow: {
        soft: "0 2px 8px rgba(0, 0, 0, 0.1)",
        medium: "0 4px 12px rgba(0, 0, 0, 0.15)",
        heavy: "0 8px 24px rgba(0, 0, 0, 0.2)",
        "green-focus": "0 0 0 4px rgba(0, 177, 94, 0.1)",
        "orange-focus": "0 0 0 4px rgba(255, 122, 0, 0.1)",
      },
    },
  },
};
```

## Accessibility

### Contrast Requirements

- **Minimum Ratio**: 4.5:1 for normal text
- **Large Text**: 3:1 for 18pt+ or bold 14pt+
- Test all color combinations

### Motion Guidelines

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

# 5. Question Types

Quizda supports multiple question types with rich content formatting.

## Multiple Choice (Single Answer)

**Description**: Traditional multiple-choice with one correct answer.

**Example:**

```json
{
  "type": "multiple_choice_single",
  "question": "What is the capital of France?",
  "options": ["London", "Berlin", "Paris", "Madrid"],
  "correctAnswer": 2,
  "points": 1
}
```

## Multiple Choice (Multiple Answers)

**Description**: Select multiple correct answers.

**Example:**

```json
{
  "type": "multiple_choice_multiple",
  "question": "Which are programming languages?",
  "options": ["Python", "HTML", "Java", "CSS"],
  "correctAnswers": [0, 2],
  "points": 2
}
```

## True/False

**Description**: Binary choice question.

**Example:**

```json
{
  "type": "true_false",
  "question": "TypeScript is a superset of JavaScript.",
  "correctAnswer": true,
  "points": 1
}
```

## Fill in the Blanks

**Description**: Text-based answers.

**Example:**

```json
{
  "type": "fill_blanks",
  "question": "The process of converting code to machine language is called ____.",
  "correctAnswer": "compilation",
  "caseSensitive": false,
  "points": 1
}
```

## Rich Content (Markdown)

**Description**: Questions with formatted text, code blocks, and lists.

**Example:**

````json
{
  "type": "markdown",
  "question": "# Code Review\n\nWhat is wrong with this code?\n\n```javascript\nif (user = null) {\n  console.log('No user');\n}\n```\n\nA) Uses `=` instead of `===`\nB) Should use `!==`\nC) Both A and B\nD) Nothing",
  "contentType": "markdown",
  "correctAnswer": 2,
  "points": 2
}
````

**Supported Markdown Features:**

- Headers (`#`, `##`, etc.)
- Code blocks (```)
- Lists (ordered and unordered)
- **Bold** and _italic_ text
- Links and images

## Math Expressions (LaTeX)

**Description**: Mathematical notation and formulas.

**Example:**

```json
{
  "type": "latex",
  "question": "Solve for $x$: $$\\frac{x^2 + 5x + 6}{x + 2} = 0$$",
  "contentType": "latex",
  "options": ["x = -3", "x = -2", "x = 0", "No solution"],
  "correctAnswer": 0,
  "points": 3
}
```

**Supported LaTeX:**

- Inline math: `$equation$`
- Display math: `$$equation$$`
- Fractions: `\frac{a}{b}`
- Superscripts/subscripts: `x^2`, `a_n`
- Greek letters: `\alpha`, `\beta`
- Operators: `\sum`, `\int`, `\lim`

## Backend Schema

```typescript
// MongoDB Question Schema
interface Question {
  _id: ObjectId;
  quizId: ObjectId;
  type:
    | "multiple_choice_single"
    | "multiple_choice_multiple"
    | "true_false"
    | "fill_blanks"
    | "markdown"
    | "latex";
  question: string;
  options?: string[];
  correctAnswer?: number | number[] | boolean | string;
  correctAnswers?: number[];
  caseSensitive?: boolean;
  contentType?: "plain" | "markdown" | "latex";
  points: number;
  explanation?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}
```

---

# 6. Authentication

## JWT Authentication Flow

### Overview

Quizda uses **JSON Web Tokens (JWT)** for stateless authentication.

```
┌─────────────┐                 ┌─────────────┐                 ┌─────────────┐
│   Client    │                 │   Backend   │                 │  Database   │
└─────────────┘                 └─────────────┘                 └─────────────┘
       │                                │                                │
       │  1. POST /auth/login           │                                │
       │   {email, password}            │                                │
       │───────────────────────────────>│                                │
       │                                │  2. Validate credentials       │
       │                                │───────────────────────────────>│
       │                                │<───────────────────────────────│
       │                                │  3. Generate JWT               │
       │                                │                                │
       │  4. Return JWT + User          │                                │
       │<───────────────────────────────│                                │
       │                                │                                │
       │  5. Store token in localStorage│                                │
       │                                │                                │
       │  6. API Request                │                                │
       │   Authorization: Bearer <JWT>  │                                │
       │───────────────────────────────>│                                │
       │                                │  7. Verify JWT                 │
       │                                │                                │
       │  8. Response                   │                                │
       │<───────────────────────────────│                                │
```

### Token Structure

```javascript
// JWT Header
{
  "alg": "HS256",
  "typ": "JWT"
}

// JWT Payload
{
  "id": 123,
  "email": "user@example.com",
  "role": "user",
  "iat": 1638360000,
  "exp": 1638363600
}

// JWT Signature
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  JWT_SECRET
)
```

### Backend Implementation

**Token Generation:**

```typescript
// server/middleware/auth.ts
import jwt from "jsonwebtoken";

export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );
}
```

**Token Verification:**

```typescript
export async function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.authenticatedUser = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}
```

**Role-Based Access Control:**

```typescript
export function requireRole(...roles: string[]) {
  return (req, res, next) => {
    if (!req.authenticatedUser) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    if (!roles.includes(req.authenticatedUser.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
}

// Usage
app.get("/admin/users", authenticateToken, requireRole("admin"), getUsers);
```

### Frontend Implementation

**Login:**

```typescript
// client/src/contexts/AuthContext.tsx
const login = async (email: string, password: string) => {
  const response = await axios.post("/auth/login", { email, password });
  const { token, user } = response.data;

  // Store token
  localStorage.setItem("token", token);

  // Set default Authorization header
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

  setUser(user);
  return user;
};
```

**Protected Routes:**

```typescript
// client/src/components/ProtectedRoute.tsx
import { useAuth } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

export function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/auth/login" />;
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}
```

### Security Considerations (V1)

**Limitations:**

- ❌ No automatic token refresh
- ❌ No CSRF protection
- ❌ Tokens stored in localStorage (XSS vulnerable)
- ❌ No session management
- ❌ No rate limiting

**For enhanced security, see V2 Session Management below.**

---

# 7. Session Management

## V2 Enhanced System

### Architecture Overview

The V2 system combines **JWT access tokens** (stateless) with **HTTP-only cookie-based refresh tokens** (stateful) for maximum security.

```
┌─────────────┐                 ┌─────────────┐                 ┌─────────────┐
│   Client    │                 │   Backend   │                 │  Database   │
│   (React)   │                 │   (Express) │                 │ (PostgreSQL)│
└─────────────┘                 └─────────────┘                 └─────────────┘
       │                                │                                │
       │  1. Login (email, password)    │                                │
       │───────────────────────────────>│                                │
       │                                │  2. Validate credentials       │
       │                                │───────────────────────────────>│
       │                                │                                │
       │                                │  3. Create session & tokens    │
       │                                │<───────────────────────────────│
       │  4. Access Token + CSRF Token  │                                │
       │     Refresh Token (HTTP-only)  │                                │
       │<───────────────────────────────│                                │
       │                                │                                │
       │  5. API Request + Access Token │                                │
       │───────────────────────────────>│                                │
       │                                │  6. Validate token & session   │
       │                                │───────────────────────────────>│
       │  7. Response                   │                                │
       │<───────────────────────────────│                                │
       │                                │                                │
       │  8. Token Expired              │                                │
       │<───────────────────────────────│                                │
       │                                │                                │
       │  9. Auto-refresh (cookie)      │                                │
       │───────────────────────────────>│                                │
       │                                │  10. Validate refresh token    │
       │                                │───────────────────────────────>│
       │                                │                                │
       │                                │  11. Rotate tokens             │
       │                                │───────────────────────────────>│
       │  12. New Access Token          │                                │
       │<───────────────────────────────│                                │
```

### Key Components

#### 1. Access Tokens (JWT, 15 minutes)

- Stored in memory and localStorage
- Sent in `Authorization: Bearer <token>` header
- Contains user ID, email, role, and session ID
- Automatically refreshed when expired

#### 2. Refresh Tokens (Random, 7-30 days)

- Stored in **HTTP-only, Secure, SameSite cookies**
- Cannot be accessed by JavaScript (prevents XSS)
- Used to obtain new access tokens
- Implements token rotation

#### 3. CSRF Tokens (Per-session)

- Sent in `X-CSRF-Token` header
- Validates state-changing requests
- Prevents Cross-Site Request Forgery attacks

#### 4. Session Records (Database-backed)

- Tracks active sessions per user
- Stores IP address, User-Agent, device fingerprint
- Enables session revocation

### Database Schema

```sql
-- Refresh Tokens Table
CREATE TABLE refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  device_info TEXT,
  ip_address VARCHAR(45),
  revoked BOOLEAN DEFAULT FALSE,
  INDEX idx_refresh_token (token),
  INDEX idx_user_id (user_id)
);

-- Sessions Table
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  csrf_token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,
  device_fingerprint TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  INDEX idx_session_token (session_token),
  INDEX idx_expires_at (expires_at)
);

-- Login Attempts (Rate Limiting)
CREATE TABLE login_attempts (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  successful BOOLEAN DEFAULT FALSE,
  INDEX idx_email_ip (email, ip_address)
);
```

### Quick Start with V2

#### 1. Run Database Migration

```bash
cd server
npm run build
node dist/init_db.js
```

#### 2. Update Environment Variables

```bash
JWT_SECRET=your-super-secret-key-minimum-32-characters-long
JWT_ACCESS_EXPIRY=15m
NODE_ENV=production
```

#### 3. Switch to V2 (Frontend)

```typescript
// client/src/main.tsx
import { AuthProviderV2 } from "./contexts/AuthContextV2";

<AuthProviderV2>
  <App />
</AuthProviderV2>;
```

#### 4. Switch to V2 (Backend)

```typescript
// server/index.ts
import authRoutes from "./routes/authV2.js";
app.use("/auth", authRoutes);
```

### API Endpoints

| Method | Endpoint             | Auth Required | Purpose                  |
| ------ | -------------------- | ------------- | ------------------------ |
| POST   | `/auth/register`     | ❌            | Register new user        |
| POST   | `/auth/login`        | ❌            | Login and create session |
| POST   | `/auth/refresh`      | ❌ (cookie)   | Refresh access token     |
| POST   | `/auth/logout`       | ✅            | Logout current session   |
| POST   | `/auth/logout-all`   | ✅            | Logout all sessions      |
| GET    | `/auth/sessions`     | ✅            | List active sessions     |
| DELETE | `/auth/sessions/:id` | ✅            | Revoke specific session  |

### Security Features

- ✅ **XSS Protection**: HTTP-only cookies for refresh tokens
- ✅ **CSRF Protection**: Token validation for state-changing requests
- ✅ **Session Hijacking Prevention**: Device fingerprinting and IP tracking
- ✅ **Token Rotation**: Automatic refresh token rotation
- ✅ **Rate Limiting**: 5 attempts per 15 minutes
- ✅ **Concurrent Session Management**: Track and revoke active sessions
- ✅ **Automatic Token Refresh**: Seamless user experience

### Usage Example

```typescript
import { useAuthV2 } from "./contexts/AuthContextV2";

function LoginPage() {
  const { login, loading } = useAuthV2();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password, rememberMe);
      navigate("/dashboard");
    } catch (error) {
      setError(error.message);
    }
  };

  return <form onSubmit={handleLogin}>{/* Form fields */}</form>;
}
```

---

# 8. Migration Guides

## V1 vs V2 Comparison

### V1 (Current Simple JWT)

**Features:**

- ❌ Simple JWT in localStorage
- ❌ Manual token management
- ❌ No automatic refresh
- ❌ No CSRF protection
- ❌ No session management

**Limitations:**

- Tokens stored in localStorage (XSS vulnerable)
- No concurrent session tracking
- No rate limiting
- No "Remember me" functionality

### V2 (Enhanced Session Management)

**Features:**

- ✅ Automatic token refresh (seamless UX)
- ✅ CSRF protection
- ✅ Session management (track all devices)
- ✅ Refresh tokens in HTTP-only cookies (XSS protection)
- ✅ "Remember me" functionality
- ✅ Logout from all devices
- ✅ Rate limiting
- ✅ Session hijacking detection
- ✅ Token rotation

### Migration Options

#### Option 1: Gradual Migration (Recommended)

Keep both systems running:

```typescript
// server/index.ts - Both systems active
import authRoutes from "./routes/auth.js"; // V1
import authV2Routes from "./routes/authV2.js"; // V2

app.use("/auth", authRoutes); // V1: /auth/login
app.use("/auth/v2", authV2Routes); // V2: /auth/v2/login
```

**Steps:**

1. Test V2 endpoints thoroughly
2. Update frontend to use V2 for new features
3. Gradually migrate users to V2
4. Monitor for issues
5. Once stable, remove V1

#### Option 2: Full Cutover

Replace old system completely:

```typescript
// server/index.ts - V2 only
import authRoutes from "./routes/authV2.js";
app.use("/auth", authRoutes);
```

**Risks:**

- All users must re-login
- No rollback without downtime
- Requires thorough testing

### Current Setup Status

- ✅ Database synced with session management tables
- ✅ V2 files created and ready
- ✅ V1 files still active (safe)
- ✅ Both systems can coexist

### Recommended Migration Path

**Phase 1: Testing (This Week)**

```bash
# Mount V2 at different path
app.use('/auth/v2', authV2Routes);

# Test endpoints
curl -X POST http://localhost:4000/auth/v2/login \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Phase 2: Parallel Running (1-2 Weeks)**

```typescript
// Let users choose or silently try V2, fallback to V1
try {
  await loginV2();
} catch (error) {
  await loginV1();
}
```

**Phase 3: V2 Primary (2-4 Weeks)**

```typescript
app.use("/auth", authV2Routes); // Primary
app.use("/auth/legacy", authRoutes); // Fallback
```

**Phase 4: V2 Only (After 1-2 Months)**

```typescript
app.use("/auth", authV2Routes);
// Delete V1 files
```

### Testing Checklist

Before deleting V1 files:

- [ ] All V2 endpoints work correctly
- [ ] Token refresh works automatically
- [ ] CSRF protection is active
- [ ] Rate limiting works
- [ ] Session management works
- [ ] "Remember me" extends session properly
- [ ] Logout from all devices works
- [ ] Frontend auto-refresh works
- [ ] HTTP-only cookies are set correctly
- [ ] No XSS vulnerabilities
- [ ] Suspicious activity detection works
- [ ] Performance is acceptable

---

# 9. Deployment

## Deployment to Render.com

### Pre-Deployment Checklist

- [ ] ✅ All environment variables configured
- [ ] ✅ Database migrations run successfully
- [ ] ✅ HTTPS enforced in production
- [ ] ✅ CORS configured with specific origin
- [ ] ✅ JWT_SECRET is strong (min 32 characters)
- [ ] ✅ Rate limiting enabled
- [ ] ✅ Session cleanup scheduled
- [ ] ✅ Error logging configured

### Step-by-Step Guide

#### 1. Prepare Repositories

```bash
# Ensure code is committed
git add .
git commit -m "Prepare for deployment"
git push origin main
```

#### 2. Create Render Services

**Backend (Web Service):**

1. Go to https://dashboard.render.com
2. Click **New** → **Web Service**
3. Connect GitHub repository
4. Configure:
   - **Name**: `quizda-backend`
   - **Environment**: `Node`
   - **Region**: Choose closest to users
   - **Branch**: `main`
   - **Build Command**: `cd server && npm install && npm run build`
   - **Start Command**: `cd server && node dist/index.js`
   - **Plan**: Free (or paid for production)

**Frontend (Static Site):**

1. Click **New** → **Static Site**
2. Connect GitHub repository
3. Configure:
   - **Name**: `quizda-frontend`
   - **Branch**: `main`
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish Directory**: `client/dist`

#### 3. Configure Environment Variables

**Backend:**

Go to **Environment** tab and add:

```
DATABASE_URL=postgresql://...
MONGO_URI=mongodb+srv://...
JWT_SECRET=your-32-char-secret
JWT_ACCESS_EXPIRY=15m
NODE_ENV=production
PORT=4000
CLIENT_URL=https://quizda-frontend.onrender.com
```

**Frontend:**

```
VITE_API_URL=https://quizda-backend.onrender.com
```

#### 4. Deploy Services

- Render will automatically deploy on push to `main`
- Monitor deployment logs for errors
- Services will be available at:
  - Backend: `https://quizda-backend.onrender.com`
  - Frontend: `https://quizda-frontend.onrender.com`

#### 5. Verify Deployment

```bash
# Test backend health
curl https://quizda-backend.onrender.com/health

# Test login
curl -X POST https://quizda-backend.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Visit frontend
open https://quizda-frontend.onrender.com
```

### CI/CD with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Render

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install Backend Dependencies
        run: cd server && npm ci

      - name: Build Backend
        run: cd server && npm run build

      - name: Install Frontend Dependencies
        run: cd client && npm ci

      - name: Build Frontend
        run: cd client && npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}

      - name: Run Tests
        run: |
          cd server && npm test
          cd ../client && npm test

      - name: Deploy to Render
        run: |
          curl -X POST https://api.render.com/deploy/srv-xxx?key=${{ secrets.RENDER_DEPLOY_HOOK }}
```

### Database Setup on Neon

1. Go to https://console.neon.tech
2. Create new project: `quizda-production`
3. Copy connection string
4. Run initialization:

```bash
# Set DATABASE_URL in .env
DATABASE_URL=postgresql://...

# Run migration
cd server
npm run build
node dist/init_db.js
```

### Post-Deployment Tasks

- [ ] Test all critical user flows
- [ ] Verify session management works
- [ ] Check HTTPS is enforced
- [ ] Test login/logout across devices
- [ ] Monitor error logs
- [ ] Set up uptime monitoring
- [ ] Configure database backups
- [ ] Set up scheduled cleanup job

### Monitoring & Maintenance

**Render Dashboard:**

- Monitor service health
- View deployment logs
- Check resource usage
- Set up alerts

**Database Cleanup (Cron Job):**

Create endpoint in `server/routes/admin.ts`:

```typescript
router.post(
  "/cleanup",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    const deletedTokens = await RefreshTokenModel.deleteExpired();
    const deletedSessions = await SessionModel.cleanupExpired();

    res.json({
      deletedTokens,
      deletedSessions,
    });
  }
);
```

Schedule with external service (e.g., cron-job.org):

```
URL: https://quizda-backend.onrender.com/admin/cleanup
Method: POST
Schedule: Daily at 2:00 AM
Auth: Bearer <admin-token>
```

### Troubleshooting Deployment

**Issue: CORS errors**

```typescript
// server/index.ts
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
```

**Issue: Database connection fails**

- Verify DATABASE_URL is correct
- Check Neon instance is active
- Ensure SSL is enabled

**Issue: Environment variables not loading**

- Check Render dashboard → Environment tab
- Restart service after adding variables

**Issue: Build fails**

- Check build logs in Render
- Verify all dependencies in `package.json`
- Test build locally first

---

# 10. Troubleshooting

## Common Issues

### Authentication Issues

#### "Token expired" errors

**Cause:** Access token has expired (15 minutes TTL)

**Solution:** Token should auto-refresh via axios interceptor. If not:

```typescript
// Check if auto-refresh is enabled
sessionManager.startAutoRefresh(60);
```

#### "Invalid CSRF token" errors

**Cause:** CSRF token not included in request

**Solution:** Ensure CSRF token is set in session manager:

```typescript
sessionManager.setTokens(accessToken, csrfToken);
```

#### Cookies not being sent

**Cause:** Missing `withCredentials: true` in axios config

**Solution:**

```typescript
axios.defaults.withCredentials = true;
```

#### CORS issues with cookies

**Cause:** CORS not configured to allow credentials

**Solution:** Backend CORS config:

```typescript
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
```

### Database Issues

#### Connection failed

**Cause:** Invalid DATABASE_URL or MONGO_URI

**Solution:**

1. Verify connection strings in `.env`
2. Check database instances are active
3. Test connection:

```bash
# PostgreSQL
psql $DATABASE_URL

# MongoDB
mongo $MONGO_URI
```

#### Tables not found

**Cause:** Database migration not run

**Solution:**

```bash
cd server
npm run build
node dist/init_db.js
```

#### Session cleanup not working

**Cause:** Cleanup function not scheduled

**Solution:** Run manually or set up cron job:

```sql
SELECT cleanup_expired_tokens();
```

### Frontend Issues

#### Components not updating

**Cause:** State not being properly managed

**Solution:** Check React DevTools for state updates

#### API requests failing

**Cause:** Incorrect API URL

**Solution:** Verify `VITE_API_URL` in `.env`:

```bash
VITE_API_URL=http://localhost:4000
```

#### Token not being sent

**Cause:** Authorization header not set

**Solution:**

```typescript
// Should be set automatically by AuthContext
axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
```

### Deployment Issues

#### Build fails on Render

**Cause:** Missing dependencies or environment variables

**Solution:**

1. Check build logs in Render dashboard
2. Verify all environment variables are set
3. Test build locally:

```bash
cd server && npm run build
cd client && npm run build
```

#### Service crashes after deployment

**Cause:** Runtime error or missing environment variable

**Solution:**

1. Check runtime logs in Render
2. Enable debug logging:

```typescript
logger.level = "debug";
```

3. Verify all required environment variables are set

### Performance Issues

#### Slow response times

**Cause:** Database queries not optimized

**Solution:**

1. Add indexes to frequently queried columns
2. Use connection pooling
3. Cache session data in Redis

#### High memory usage

**Cause:** Memory leaks or inefficient caching

**Solution:**

1. Monitor with Node.js profiler
2. Implement proper cleanup
3. Limit cache size

### Security Issues

#### Rate limiting not working

**Cause:** Rate limit not configured or cleared

**Solution:** Verify rate limit middleware is applied:

```typescript
app.post("/auth/login", rateLimitLogin, loginHandler);
```

#### Suspicious activity not detected

**Cause:** Session validation not enabled

**Solution:** Ensure session middleware is active:

```typescript
app.use("/api", authenticateSession);
```

## Debugging Tips

### Enable Verbose Logging

**Backend:**

```typescript
// server/logger.ts
logger.level = "debug";
```

**Frontend:**

```typescript
// client/src/utils/logger.ts
logger.level = "debug";
```

### Check Session in Database

```sql
-- View all active sessions
SELECT * FROM sessions WHERE is_active = true;

-- View all refresh tokens
SELECT * FROM refresh_tokens WHERE revoked = false;

-- View login attempts
SELECT * FROM login_attempts ORDER BY attempted_at DESC LIMIT 10;
```

### Monitor Token Lifecycle

```typescript
// Frontend
console.log("Access Token:", sessionManager.getAccessToken());
console.log("CSRF Token:", sessionManager.getCsrfToken());
console.log("Is Authenticated:", sessionManager.isAuthenticated());
console.log("Token Expired:", sessionManager.isTokenExpired());
console.log("Current User:", sessionManager.getCurrentUser());
```

### Test Endpoints with cURL

```bash
# Login
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt -v

# Authenticated request
curl -X GET http://localhost:4000/dashboard \
  -H "Authorization: Bearer <token>" \
  -b cookies.txt -v

# Refresh token
curl -X POST http://localhost:4000/auth/refresh \
  -b cookies.txt -c cookies.txt -v
```

---

## Additional Resources

- **Main README**: See `README.md` for project overview
- **API Documentation**: Visit `/api-docs` when server is running
- **GitHub Issues**: Report bugs or request features

---

**Last Updated:** January 2025  
**Version:** 2.0.0

_This documentation consolidates all setup, development, and deployment guides for the Quizda platform._
