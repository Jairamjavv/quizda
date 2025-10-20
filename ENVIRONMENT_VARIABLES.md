# 🔐 Environment Variables Guide

## Overview

This document lists all required environment variables for deploying Quizda.

---

## 🖥️ Backend Environment Variables

### Required for Production

Set these in **Render Dashboard → quizda-backend → Environment**:

```env
# Node Environment
NODE_ENV=production
PORT=10000

# JWT Authentication
JWT_SECRET=<your-128-character-random-secret>
# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# PostgreSQL Database (Neon)
NEON_DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require

# MongoDB Database (Atlas)
MONGODB_ATLAS_URL=mongodb+srv://user:password@cluster.mongodb.net/quizda?retryWrites=true&w=majority

# Frontend URL (for CORS)
CLIENT_URL=https://quizda.onrender.com
```

### How to Get Each Value:

#### `JWT_SECRET`

```bash
# Run this command to generate:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Result (example):
3180d8f28f233e3c73cb8797335a9bf6a6114397aa7d6b0a7806c0cacbf182b3b30be4db3e18e52f625f7a52436e38eda4ef7bd34ed00447d349e38057a8d39f
```

#### `NEON_DATABASE_URL`

1. Go to [Neon Console](https://console.neon.tech)
2. Select your project
3. Go to **Dashboard**
4. Copy **Connection String** with format:
   ```
   postgresql://user:password@ep-xxx.neon.tech/dbname?sslmode=require
   ```

#### `MONGODB_ATLAS_URL`

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Copy connection string:
   ```
   mongodb+srv://username:password@cluster0.xxx.mongodb.net/quizda?retryWrites=true&w=majority
   ```
5. **Important**:
   - Replace `<password>` with your actual password
   - Replace `myFirstDatabase` with `quizda` or your database name
   - Ensure Network Access allows Render IPs (or `0.0.0.0/0` for all)

#### `CLIENT_URL`

After deploying frontend, use that URL:

```
https://quizda.onrender.com
```

---

## 🌐 Frontend Environment Variables

### Required for Production

Set these in **Render Dashboard → quizda-frontend → Environment**:

```env
# Backend API URL
VITE_API_URL=https://quizda-backend.onrender.com
```

### Local Development

Create `client/.env.development`:

```env
VITE_API_URL=http://localhost:4000
```

---

## 🔑 GitHub Secrets

### Required for CI/CD

Add these in **GitHub Repository → Settings → Secrets and variables → Actions**:

```env
# Render API Key
RENDER_API_KEY=<from-render-account-settings>

# Backend Service ID
RENDER_BACKEND_SERVICE_ID=srv-xxxxxxxxxxxxxxxxxxxxx

# Frontend Service ID
RENDER_FRONTEND_SERVICE_ID=srv-xxxxxxxxxxxxxxxxxxxxx
```

### How to Get Each Value:

#### `RENDER_API_KEY`

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click profile (top right) → **Account Settings**
3. Scroll to **API Keys** section
4. Click **Create API Key**
5. Name it: `GitHub Actions Deploy`
6. Copy the key (won't be shown again!)

#### `RENDER_BACKEND_SERVICE_ID`

1. Go to your backend service in Render
2. URL will be: `https://dashboard.render.com/web/srv-xxxxxxxxxxxxxxxxxxxxx`
3. Copy the `srv-xxxxxxxxxxxxxxxxxxxxx` part
4. OR: Go to service → **Settings** → copy **Service ID**

#### `RENDER_FRONTEND_SERVICE_ID`

1. Go to your frontend static site in Render
2. URL will be: `https://dashboard.render.com/static/srv-xxxxxxxxxxxxxxxxxxxxx`
3. Copy the `srv-xxxxxxxxxxxxxxxxxxxxx` part

---

## 📝 Environment Files Structure

```
quizda/
├── server/
│   ├── .env                    # Local development (not in Git)
│   └── .env.example            # Template
│
├── client/
│   ├── .env.development        # Development config (in Git)
│   ├── .env.production         # Production config (in Git)
│   ├── .env.local              # Local overrides (not in Git)
│   └── .env.example            # Template (in Git)
│
└── .github/
    └── workflows/
        └── deploy.yml          # Uses GitHub Secrets
```

---

## 🔒 Security Best Practices

### ✅ DO:

- Use strong, random JWT_SECRET (128+ characters)
- Store secrets in environment variables
- Use different secrets for dev/staging/prod
- Add `.env` to `.gitignore`
- Rotate secrets periodically
- Use GitHub Secrets for CI/CD

### ❌ DON'T:

- Commit `.env` files to Git
- Use weak secrets (`secret`, `12345`, etc.)
- Share secrets in Discord/Slack
- Hardcode secrets in source code
- Use same secret across environments
- Post secrets in screenshots

---

## 🧪 Testing Environment Variables

### Test Backend Variables:

```bash
# In server directory
node -e "require('dotenv').config(); console.log('JWT_SECRET:', process.env.JWT_SECRET?.length, 'chars')"
node -e "require('dotenv').config(); console.log('DB URL:', process.env.NEON_DATABASE_URL?.substring(0, 30) + '...')"
```

### Test Frontend Variables:

```bash
# In client directory
npm run dev
# Check browser console for API URL
```

---

## 📋 Quick Reference

### Minimum Required Variables:

**Backend (Production):**

```env
NODE_ENV=production
PORT=10000
JWT_SECRET=<128-chars>
NEON_DATABASE_URL=postgresql://...
MONGODB_ATLAS_URL=mongodb+srv://...
CLIENT_URL=https://...
```

**Frontend (Production):**

```env
VITE_API_URL=https://quizda-backend.onrender.com
```

**GitHub Secrets:**

```env
RENDER_API_KEY=rnd_...
RENDER_BACKEND_SERVICE_ID=srv-...
RENDER_FRONTEND_SERVICE_ID=srv-...
```

---

## 🔧 Troubleshooting

### "JWT secret not configured"

- Ensure `JWT_SECRET` is set in Render environment
- Restart the service after adding

### "Database connection failed"

- Verify database URLs are correct
- Check MongoDB Atlas Network Access (allow `0.0.0.0/0`)
- Test connection strings locally first

### "CORS error"

- Ensure `CLIENT_URL` matches your frontend URL exactly
- Include protocol: `https://`, not just domain
- Redeploy backend after updating

### GitHub Actions fails

- Verify all 3 secrets are added
- Check secret names match exactly (case-sensitive)
- Ensure Render API key is valid

---

## 📚 Templates

### `server/.env.example`

```env
# PostgreSQL Database
NEON_DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require

# MongoDB Database
MONGODB_ATLAS_URL=mongodb+srv://user:password@cluster.mongodb.net/quizda?retryWrites=true&w=majority

# JWT Secret (generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=your_jwt_secret_here

# Backend Port
PORT=4000

# Frontend URL
CLIENT_URL=http://localhost:5173
```

### `client/.env.example`

```env
# Backend API URL
VITE_API_URL=http://localhost:4000
```

---

## ✅ Deployment Checklist

Before deploying, ensure:

- [ ] JWT_SECRET is strong and random
- [ ] Database URLs are correct and tested
- [ ] CLIENT_URL matches frontend URL
- [ ] VITE_API_URL matches backend URL
- [ ] All Render environment variables are set
- [ ] All GitHub Secrets are added
- [ ] `.env` files are in `.gitignore`
- [ ] MongoDB Atlas allows Render IPs
- [ ] Neon PostgreSQL is accessible

---

**Need help? See [DEPLOYMENT.md](./DEPLOYMENT.md) for full guide!**
