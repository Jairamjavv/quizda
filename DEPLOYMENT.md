# 🚀 Deployment Guide - Quizda on Render.com

## Overview

This guide will walk you through deploying Quizda to Render.com with GitHub Actions CI/CD pipeline.

### Deployment Architecture

```
GitHub Repository (development branch)
         ↓
    Create Pull Request to main
         ↓
    Code Review & Tests Run
         ↓
    Merge to main branch
         ↓
    GitHub Actions Triggered
         ↓
    Deploy to Render.com
         ↓
    Backend: quizda-backend.onrender.com
    Frontend: quizda.onrender.com
```

---

## 📋 Prerequisites

- [x] GitHub account with Quizda repository
- [x] Render.com account (free tier)
- [x] Neon PostgreSQL database
- [x] MongoDB Atlas database
- [x] Strong JWT_SECRET generated

---

## 🎯 Deployment Flow

### Your Approved Workflow:

1. **Development** → Push changes to `development` branch
2. **Pull Request** → Create PR from `development` to `main`
3. **CI Tests** → GitHub Actions runs tests automatically
4. **Code Review** → Review and approve PR
5. **Merge** → Merge PR to `main` branch
6. **Auto Deploy** → GitHub Actions deploys to Render.com
7. **Live** → App is live!

---

## Part 1: Initial Render.com Setup

### Step 1: Sign in to Render.com

1. Go to [https://render.com](https://render.com)
2. Sign in with your GitHub account
3. Authorize Render to access your repositories

### Step 2: Create Backend Web Service

1. Click **"New +"** → **"Web Service"**
2. Select your **quizda** repository
3. Configure:

   - **Name**: `quizda-backend`
   - **Region**: Oregon (Free)
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. Click **"Advanced"** and add environment variables:

```env
NODE_ENV=production
PORT=10000
JWT_SECRET=<your-strong-jwt-secret>
NEON_DATABASE_URL=<your-neon-postgres-url>
MONGODB_ATLAS_URL=<your-mongodb-atlas-url>
CLIENT_URL=<will-add-after-frontend-deploy>
```

5. Click **"Create Web Service"**
6. **Copy the service URL** (e.g., `https://quizda-backend.onrender.com`)
7. **Copy the Service ID** from the URL (Settings → General → Service ID)

### Step 3: Create Frontend Static Site

1. Click **"New +"** → **"Static Site"**
2. Select your **quizda** repository
3. Configure:

   - **Name**: `quizda-frontend` (or just `quizda`)
   - **Region**: Oregon (Free)
   - **Branch**: `main`
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. Add environment variable:

```env
VITE_API_URL=https://quizda-backend.onrender.com
```

5. Click **"Create Static Site"**
6. **Copy the service URL** (e.g., `https://quizda.onrender.com`)
7. **Copy the Service ID** from the URL

### Step 4: Update Backend CLIENT_URL

1. Go back to **quizda-backend** service
2. Navigate to **Environment**
3. Update `CLIENT_URL` with your frontend URL:

```env
CLIENT_URL=https://quizda.onrender.com
```

4. Save changes (will trigger a redeploy)

### Step 5: Get Render API Key

1. Go to **Account Settings** (top right → Account Settings)
2. Scroll to **API Keys**
3. Click **"Create API Key"**
4. Name it: `GitHub Actions Deploy`
5. **Copy the API key** (you won't see it again!)

---

## Part 2: GitHub Setup

### Step 6: Add GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add these three secrets:

**Secret 1:**

- Name: `RENDER_API_KEY`
- Value: `<your-render-api-key-from-step-5>`

**Secret 2:**

- Name: `RENDER_BACKEND_SERVICE_ID`
- Value: `<backend-service-id-from-step-2>`

**Secret 3:**

- Name: `RENDER_FRONTEND_SERVICE_ID`
- Value: `<frontend-service-id-from-step-3>`

### Step 7: Protect Main Branch (Optional but Recommended)

1. Go to **Settings** → **Branches**
2. Click **"Add rule"**
3. Branch name pattern: `main`
4. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require approvals: 1
   - ✅ Require status checks to pass (after first PR)
5. Save changes

---

## Part 3: Testing the Deployment

### Step 8: Test the Workflow

1. **Make a change in development branch:**

   ```bash
   git checkout development
   echo "# Test deployment" >> README.md
   git add .
   git commit -m "test: trigger deployment workflow"
   git push origin development
   ```

2. **Create a Pull Request:**

   - Go to GitHub repository
   - Click **"Pull requests"** → **"New pull request"**
   - Base: `main` ← Compare: `development`
   - Create pull request

3. **Watch tests run:**

   - GitHub Actions will run tests automatically
   - Check the **"Checks"** tab

4. **Merge the PR:**

   - If tests pass, click **"Merge pull request"**
   - Confirm merge

5. **Watch deployment:**

   - Go to **Actions** tab
   - You'll see "Deploy to Render" workflow running
   - Wait for completion (first deploy takes 5-10 minutes)

6. **Verify deployment:**
   - Backend: `https://quizda-backend.onrender.com/health`
   - Frontend: `https://quizda.onrender.com`

---

## 🔍 Verification Checklist

After deployment, verify:

### Backend Health Check

```bash
curl https://quizda-backend.onrender.com/health
# Should return: {"status":"healthy"}
```

### Backend API Running

```bash
curl https://quizda-backend.onrender.com/
# Should return: {"status":"running","message":"Quizda API is running","environment":"production"}
```

### Test Login

```bash
curl -X POST https://quizda-backend.onrender.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Frontend Accessible

Open in browser: `https://quizda.onrender.com`

---

## 🔧 Troubleshooting

### Issue: Build fails on Render

**Solution:**

- Check build logs in Render dashboard
- Verify all environment variables are set
- Ensure `node_modules` is in `.gitignore`

### Issue: GitHub Actions deployment fails

**Solution:**

- Verify all 3 secrets are added correctly
- Check Service IDs are correct
- Ensure Render API key is valid

### Issue: Backend returns 500 error

**Solution:**

- Check Render logs: Dashboard → Service → Logs
- Verify database URLs are correct
- Ensure JWT_SECRET is set

### Issue: Frontend can't connect to backend

**Solution:**

- Verify `VITE_API_URL` is set correctly
- Check CORS is configured with correct `CLIENT_URL`
- Open browser console for errors

### Issue: Database connection fails

**Solution:**

- Test Neon PostgreSQL connection
- Test MongoDB Atlas connection
- Ensure IP whitelist includes Render's IPs (or allow all: `0.0.0.0/0`)

---

## 📊 Monitoring

### Render Dashboard

- **Metrics**: CPU, Memory, Request count
- **Logs**: Real-time application logs
- **Events**: Deployment history

### Check Logs

```bash
# In Render dashboard
quizda-backend → Logs → Live Logs
quizda-frontend → Logs → Build Logs
```

---

## 🔄 Future Deployments

### Normal Development Workflow

```bash
# 1. Work on development branch
git checkout development
# ... make changes ...
git add .
git commit -m "feat: add new feature"
git push origin development

# 2. Create PR to main
# (via GitHub UI)

# 3. Wait for tests to pass
# (automatic)

# 4. Review and merge
# (via GitHub UI)

# 5. Automatic deployment
# (GitHub Actions handles it!)
```

### Manual Redeploy (if needed)

1. Go to Render dashboard
2. Select service
3. Click **"Manual Deploy"** → **"Deploy latest commit"**

---

## 🎯 Environment Variables Reference

### Backend (quizda-backend)

```env
NODE_ENV=production
PORT=10000
JWT_SECRET=<128-char-random-string>
NEON_DATABASE_URL=postgresql://...
MONGODB_ATLAS_URL=mongodb+srv://...
CLIENT_URL=https://quizda.onrender.com
```

### Frontend (quizda-frontend)

```env
VITE_API_URL=https://quizda-backend.onrender.com
```

---

## 📈 Performance Notes

### Free Tier Limitations

- **Cold starts**: Services sleep after 15 min of inactivity
- **First request**: May take 30-60 seconds to wake up
- **Monthly hours**: 750 hours free per month

### Optimization Tips

1. Keep services active with uptime monitoring (e.g., UptimeRobot)
2. Use efficient database queries
3. Enable caching where possible

---

## 🔐 Security Checklist

- [x] JWT_SECRET is strong and random
- [x] Environment variables are not in Git
- [x] Database credentials are secure
- [x] CORS is configured correctly
- [x] API keys are stored as GitHub Secrets
- [x] Main branch is protected
- [x] HTTPS is enforced (automatic on Render)

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Render Free Tier Limits](https://render.com/docs/free)

---

## 🎉 Success!

If everything is set up correctly:

1. ✅ Your app is live on Render
2. ✅ CI/CD pipeline is automated
3. ✅ Tests run on every PR
4. ✅ Deployment happens on merge to main
5. ✅ Environment variables are secure
6. ✅ Databases are connected

**Your URLs:**

- 🌐 Frontend: `https://quizda.onrender.com`
- 🔧 Backend: `https://quizda-backend.onrender.com`
- 📖 API Docs: `https://quizda-backend.onrender.com/api-docs`

---

## 🆘 Need Help?

If you encounter issues:

1. Check Render logs
2. Review GitHub Actions logs
3. Verify environment variables
4. Test database connections
5. Check this guide's troubleshooting section

**Happy Deploying! 🚀**
