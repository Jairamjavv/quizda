# Environment Variables Configuration Guide

This document lists **ALL** environment variables used in the Quizda application for both local development and production deployment on Render.com.

---

## 📋 Quick Checklist for Render.com

### Backend Service (quizda-backend)

| Priority        | Variable                   | Status             | Required             |
| --------------- | -------------------------- | ------------------ | -------------------- |
| 🔴 **Critical** | `NEON_DATABASE_URL`        | ✅ Set             | **YES**              |
| 🔴 **Critical** | `MONGODB_ATLAS_URL`        | ✅ Set             | **YES**              |
| 🔴 **Critical** | `JWT_SECRET`               | ✅ Set             | **YES**              |
| 🔴 **Critical** | `NODE_ENV`                 | ⚠️ **MISSING**     | **YES**              |
| 🔴 **Critical** | `CLIENT_URL`               | ⚠️ **MISSING**     | **YES**              |
| 🟡 Optional     | `MONGODB_DBNAME`           | ⚠️ **MISSING**     | No (default: quizda) |
| 🟡 Optional     | `JWT_ACCESS_EXPIRY`        | ⚠️ **MISSING**     | No (default: 15m)    |
| 🟢 Redis        | `UPSTASH_REDIS_REST_URL`   | ⚠️ **MISSING**     | No (but recommended) |
| 🟢 Redis        | `UPSTASH_REDIS_REST_TOKEN` | ⚠️ **MISSING**     | No (but recommended) |
| 🟢 Redis        | `REDIS_FAIL_CLOSED`        | ⚠️ **MISSING**     | No (default: false)  |
| 🔵 Advanced     | `PORT`                     | Auto-set by Render | No                   |
| 🔵 Advanced     | `TRUSTED_PROXIES`          | ⚠️ **MISSING**     | No                   |

### Frontend Service (quizda-frontend)

| Priority        | Variable       | Status         | Required |
| --------------- | -------------- | -------------- | -------- |
| 🔴 **Critical** | `VITE_API_URL` | ⚠️ **MISSING** | **YES**  |

---

## 🔴 CRITICAL: Missing Variables on Render

You need to add these immediately to Render.com:

### Backend - Required Variables

```bash
# 1. Environment mode
NODE_ENV=production

# 2. Frontend URL for CORS
CLIENT_URL=https://quizda-frontend.onrender.com
```

### Frontend - Required Variables

```bash
# API endpoint
VITE_API_URL=https://quizda-backend.onrender.com
```

---

## 📝 Complete Variable Reference

### 1. DATABASE - PostgreSQL (Neon)

**Variable:** `NEON_DATABASE_URL`  
**Required:** ✅ **YES**  
**Default:** None  
**Format:** `postgresql://user:password@host/database?sslmode=require`  
**Example:** `postgresql://user:pass@ep-example.us-east-1.aws.neon.tech/db?sslmode=require`  
**Get from:** [https://neon.tech/](https://neon.tech/)  
**Used in:**

- `server/db.ts` - Main database connection
- `server/init_db.ts` - Database initialization
- `server/routes/auth.ts` - User authentication
- `server/routes/dashboard.ts` - User data queries

**Status:** ✅ Already set in your .env

---

### 2. DATABASE - MongoDB Atlas

**Variable:** `MONGODB_ATLAS_URL`  
**Required:** ✅ **YES**  
**Default:** None  
**Format:** `mongodb+srv://user:password@cluster.mongodb.net/?options`  
**Example:** `mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority`  
**Get from:** [https://cloud.mongodb.com/](https://cloud.mongodb.com/)  
**Used in:**

- `server/mongo.ts` - MongoDB connection
- `server/init_mongo_quiz.ts` - Quiz data initialization
- `server/models/quiz.ts` - Quiz storage
- `server/models/question.ts` - Question storage

**Status:** ✅ Already set in your .env

---

**Variable:** `MONGODB_DBNAME`  
**Required:** ❌ No  
**Default:** `"quizda"`  
**Format:** String  
**Example:** `quizda`  
**Used in:**

- `server/mongo.ts` - Database name selection

**Status:** ⚠️ **MISSING** (using default "quizda")

---

### 3. AUTHENTICATION - JWT

**Variable:** `JWT_SECRET`  
**Required:** ✅ **YES**  
**Default:** None  
**Format:** String (64+ characters recommended)  
**Example:** `3180d8f28f233e3c73cb...` (128 character hex string)  
**Generate:** `openssl rand -hex 64`  
**Used in:**

- `server/utils/tokenUtils.ts` - Token signing and verification
- `server/middleware/auth.ts` - Request authentication
- All protected routes

**Status:** ✅ Already set in your .env

⚠️ **SECURITY WARNING:** Your JWT_SECRET is exposed in the .env file above. For production, generate a new one with:

```bash
openssl rand -hex 64
```

---

**Variable:** `JWT_ACCESS_EXPIRY`  
**Required:** ❌ No  
**Default:** `"15m"`  
**Format:** String (time format: 15m, 1h, 7d, etc.)  
**Example:** `15m`  
**Used in:**

- `server/utils/tokenUtils.ts` - Access token expiration time

**Status:** ⚠️ **MISSING** (using default "15m")

---

### 4. REDIS - Token Blacklist (Optional but Recommended)

**Choose ONE of these two options:**

#### Option A: Upstash Redis (Recommended for Render)

**Variable:** `UPSTASH_REDIS_REST_URL`  
**Required:** ❌ No (but **highly recommended**)  
**Default:** None  
**Format:** `https://...upstash.io`  
**Example:** `https://your-db-12345.upstash.io`  
**Get from:** [https://upstash.com/](https://upstash.com/) (Free tier available)  
**Used in:**

- `server/redis.ts` - Upstash REST client creation
- `server/models/tokenBlacklist.ts` - Token invalidation

**Status:** ⚠️ **MISSING** (Redis disabled)

---

**Variable:** `UPSTASH_REDIS_REST_TOKEN`  
**Required:** ❌ No (but **highly recommended**)  
**Default:** None  
**Format:** String (long token)  
**Example:** `AYa9ASQgYzRm...`  
**Get from:** Upstash console after creating database  
**Used in:**

- `server/redis.ts` - Upstash authentication

**Status:** ⚠️ **MISSING** (Redis disabled)

---

#### Option B: Traditional Redis (TCP)

**Variable:** `REDIS_URL`  
**Required:** ❌ No  
**Default:** None  
**Format:** `redis://user:password@host:port` or `rediss://...` for TLS  
**Example:** `rediss://default:password@host.upstash.io:6379`  
**Used in:**

- `server/redis.ts` - Traditional Redis client creation
- `server/models/tokenBlacklist.ts` - Token invalidation

**Status:** ✅ Already set (but Upstash REST is recommended for serverless)

---

**Variable:** `REDIS_FAIL_CLOSED`  
**Required:** ❌ No  
**Default:** `false` (fail-open)  
**Format:** `"true"` or `"false"`  
**Example:** `false`  
**Behavior:**

- `false` (default): Allow requests when Redis is down (higher availability)
- `true`: Reject all requests when Redis is down (higher security)
  **Used in:**
- `server/models/tokenBlacklist.ts` - Fallback behavior

**Status:** ⚠️ **MISSING** (using default: fail-open)

**Recommendation:** Leave as `false` for better user experience

---

### 5. SERVER CONFIGURATION

**Variable:** `NODE_ENV`  
**Required:** ✅ **YES** for production  
**Default:** `"development"`  
**Format:** `"development"` | `"production"` | `"test"`  
**Example:** `production`  
**Used in:**

- `server/index.ts` - Server configuration
- `server/routes/authV2.ts` - Cookie security settings (sameSite, secure)
- `server/logger.ts` - Log level configuration
- Error messages (hide details in production)

**Status:** ⚠️ **MISSING** (defaulting to "development")

**⚠️ CRITICAL:** Without this, cookies won't work in production (sameSite will be "lax" instead of "none")

---

**Variable:** `PORT`  
**Required:** ❌ No (Render sets this automatically)  
**Default:** `4000`  
**Format:** Number  
**Example:** `4000`  
**Used in:**

- `server/index.ts` - HTTP server port

**Status:** ✅ Auto-set by Render

---

**Variable:** `CLIENT_URL`  
**Required:** ✅ **YES** for production  
**Default:** `"http://localhost:5173"`  
**Format:** String (URL)  
**Example:** `https://quizda-frontend.onrender.com`  
**Used in:**

- `server/index.ts` - CORS origin configuration
- Allows frontend to make API requests

**Status:** ⚠️ **MISSING** (defaulting to localhost)

**⚠️ CRITICAL:** Without this, frontend cannot communicate with backend due to CORS

---

**Variable:** `TRUSTED_PROXIES`  
**Required:** ❌ No  
**Default:** Empty array  
**Format:** Comma-separated CIDR ranges  
**Example:** `10.0.0.0/8,172.16.0.0/12`  
**Used in:**

- `server/utils/tokenUtils.ts` - Accurate client IP detection for security

**Status:** ⚠️ **MISSING** (no trusted proxies configured)

**Recommendation:** Not needed for Render (they handle this)

---

### 6. FRONTEND CONFIGURATION

**Variable:** `VITE_API_URL`  
**Required:** ✅ **YES**  
**Default:** `"http://localhost:4000"`  
**Format:** String (URL, must start with http:// or https://)  
**Example:** `https://quizda-backend.onrender.com`  
**Used in:**

- `client/src/utils/sessionManager.ts` - API base URL
- All API requests from frontend

**Status:** ⚠️ **MISSING** on Render (set in .env.production but not on Render)

**⚠️ CRITICAL:** Frontend won't know where to send API requests

---

## 🚀 How to Add Variables to Render.com

### Backend Service

1. Go to: https://dashboard.render.com
2. Click on **"quizda-backend"** service
3. Click **"Environment"** tab (left sidebar)
4. Click **"Add Environment Variable"** button
5. Add each variable one by one:

```bash
# Required - Add these NOW
NODE_ENV=production
CLIENT_URL=https://quizda-frontend.onrender.com

# Recommended - Add these for Redis support
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here

# Optional - Add if you want custom values
MONGODB_DBNAME=quizda
JWT_ACCESS_EXPIRY=15m
REDIS_FAIL_CLOSED=false
```

6. Click **"Save Changes"**
7. Render will automatically redeploy

### Frontend Service

1. Go to: https://dashboard.render.com
2. Click on **"quizda-frontend"** service
3. Click **"Environment"** tab
4. Add:

```bash
VITE_API_URL=https://quizda-backend.onrender.com
```

5. Click **"Save Changes"**
6. Render will automatically redeploy

---

## 🔒 Security Checklist

- [ ] Generate new `JWT_SECRET` (current one is exposed)
- [ ] Set `NODE_ENV=production` on Render
- [ ] Set `CLIENT_URL` to actual frontend URL
- [ ] Set `VITE_API_URL` to actual backend URL
- [ ] Add Upstash Redis credentials (optional but recommended)
- [ ] Never commit `.env` files to Git
- [ ] Use environment variables on Render (not .env files)

---

## 📊 Variable Impact Matrix

| Variable            | Missing Impact               | Severity        |
| ------------------- | ---------------------------- | --------------- |
| `NODE_ENV`          | Insecure cookies, wrong CORS | 🔴 **CRITICAL** |
| `CLIENT_URL`        | CORS errors, API blocked     | 🔴 **CRITICAL** |
| `VITE_API_URL`      | Frontend can't reach backend | 🔴 **CRITICAL** |
| `JWT_SECRET` (weak) | Tokens can be forged         | 🔴 **CRITICAL** |
| `UPSTASH_REDIS_*`   | No token blacklist           | 🟡 **MEDIUM**   |
| `MONGODB_DBNAME`    | Uses default database        | 🟢 **LOW**      |
| `JWT_ACCESS_EXPIRY` | 15-minute tokens             | 🟢 **LOW**      |
| `REDIS_FAIL_CLOSED` | Fail-open behavior           | 🟢 **LOW**      |

---

## ✅ Final Verification

After adding variables to Render:

1. **Check Backend Logs:**

   ```
   [INFO] Environment: production ✅
   [INFO] CORS origin: https://quizda-frontend.onrender.com ✅
   [INFO] Upstash Redis (REST) connection initialized ✅
   ```

2. **Check Frontend Logs:**

   ```
   VITE_API_URL: https://quizda-backend.onrender.com ✅
   ```

3. **Test Authentication:**
   - Login should work
   - Cookies should be set (check DevTools → Application → Cookies)
   - Page refresh should maintain session
   - Logout should invalidate tokens immediately (if Redis enabled)

---

## 📞 Need Help?

If you see errors after deployment:

1. Check Render logs for the specific variable mentioned
2. Verify the variable name is exactly correct (case-sensitive)
3. Ensure no extra spaces in values
4. Redeploy if variables were added while service was running

---

**Last Updated:** 2025-10-26  
**Generated for:** Quizda Application  
**Deployment:** Render.com
