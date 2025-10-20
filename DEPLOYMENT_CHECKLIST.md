# 🚀 Quick Deployment Checklist

Use this checklist to deploy Quizda to Render.com with CI/CD.

---

## ☑️ Pre-Deployment (One-Time Setup)

### 1. Environment Preparation

- [ ] Generate strong JWT_SECRET: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- [ ] Have Neon PostgreSQL URL ready
- [ ] Have MongoDB Atlas URL ready
- [ ] Ensure MongoDB Atlas Network Access allows all IPs (`0.0.0.0/0`)

### 2. Code Preparation

- [ ] All files committed to `development` branch
- [ ] Tests passing locally: `cd server && npm test`
- [ ] Client builds successfully: `cd client && npm run build`

---

## ☑️ Render.com Setup

### 3. Create Backend Service

- [ ] Sign in to Render.com
- [ ] New+ → Web Service
- [ ] Connect quizda repository
- [ ] Name: `quizda-backend`
- [ ] Branch: `main`
- [ ] Root Directory: `server`
- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `npm start`
- [ ] Add environment variables:
  - [ ] `NODE_ENV=production`
  - [ ] `PORT=10000`
  - [ ] `JWT_SECRET=<your-secret>`
  - [ ] `NEON_DATABASE_URL=<your-url>`
  - [ ] `MONGODB_ATLAS_URL=<your-url>`
  - [ ] `CLIENT_URL=<will-add-later>`
- [ ] **Copy Backend Service ID** (from URL or Settings)
- [ ] **Copy Backend URL** (e.g., `https://quizda-backend.onrender.com`)

### 4. Create Frontend Service

- [ ] New+ → Static Site
- [ ] Connect quizda repository
- [ ] Name: `quizda` or `quizda-frontend`
- [ ] Branch: `main`
- [ ] Root Directory: `client`
- [ ] Build Command: `npm install && npm run build`
- [ ] Publish Directory: `dist`
- [ ] Add environment variable:
  - [ ] `VITE_API_URL=<backend-url-from-step-3>`
- [ ] **Copy Frontend Service ID** (from URL or Settings)
- [ ] **Copy Frontend URL** (e.g., `https://quizda.onrender.com`)

### 5. Update Backend CLIENT_URL

- [ ] Go back to backend service
- [ ] Environment → Edit `CLIENT_URL`
- [ ] Set to frontend URL from step 4
- [ ] Save (triggers redeploy)

### 6. Get Render API Key

- [ ] Account Settings → API Keys
- [ ] Create API Key → Name: `GitHub Actions Deploy`
- [ ] **Copy API Key** (shown only once!)

---

## ☑️ GitHub Setup

### 7. Add GitHub Secrets

Go to: Repository → Settings → Secrets and variables → Actions

- [ ] Add secret: `RENDER_API_KEY` = `<api-key-from-step-6>`
- [ ] Add secret: `RENDER_BACKEND_SERVICE_ID` = `<backend-id-from-step-3>`
- [ ] Add secret: `RENDER_FRONTEND_SERVICE_ID` = `<frontend-id-from-step-4>`

### 8. Optional: Protect Main Branch

- [ ] Settings → Branches → Add rule
- [ ] Branch name: `main`
- [ ] Require pull request before merging
- [ ] Require approvals: 1

---

## ☑️ Test Deployment

### 9. First Deployment Test

```bash
# Make a test change
git checkout development
echo "\n# Deployed!" >> README.md
git add .
git commit -m "test: first deployment"
git push origin development
```

- [ ] Create PR: development → main
- [ ] Wait for tests to pass (GitHub Actions)
- [ ] Merge PR
- [ ] Watch deployment in Actions tab
- [ ] Wait 5-10 minutes for first deploy

### 10. Verify Deployment

- [ ] Backend health: `https://quizda-backend.onrender.com/health`
- [ ] Backend API: `https://quizda-backend.onrender.com/`
- [ ] Frontend: `https://quizda.onrender.com`
- [ ] Test login on frontend
- [ ] Check Render logs for errors

---

## ☑️ Post-Deployment

### 11. Update Documentation

- [ ] Update README.md with live URLs
- [ ] Document any deployment notes
- [ ] Share URLs with team/users

### 12. Monitor

- [ ] Check Render dashboard metrics
- [ ] Review logs for errors
- [ ] Test all major features

---

## 🎯 Quick Reference

### URLs to Track

```
Backend: https://quizda-backend.onrender.com
Frontend: https://quizda.onrender.com
API Docs: https://quizda-backend.onrender.com/api-docs
```

### Service IDs

```
Backend:  srv-xxxxxxxxxxxxxxxxxxxxx
Frontend: srv-xxxxxxxxxxxxxxxxxxxxx
```

### GitHub Secrets

```
✅ RENDER_API_KEY
✅ RENDER_BACKEND_SERVICE_ID
✅ RENDER_FRONTEND_SERVICE_ID
```

---

## 🔄 Future Workflow

For every new feature:

```bash
# 1. Work on development
git checkout development
# ... make changes ...
git commit -m "feat: new feature"
git push origin development

# 2. Create PR to main (GitHub UI)
# 3. Tests run automatically
# 4. Review & merge
# 5. Auto-deploy happens!
```

---

## ❓ Common Issues

### Build fails

- Check Render logs
- Verify environment variables
- Ensure dependencies are in package.json

### 500 error

- Check database URLs
- Verify JWT_SECRET is set
- Review Render logs

### CORS error

- Check CLIENT_URL matches frontend URL
- Ensure no trailing slash
- Redeploy backend

### GitHub Actions fails

- Verify all 3 secrets are set
- Check Service IDs are correct
- Ensure API key is valid

---

## 📚 Full Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Complete deployment guide
- [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) - All env vars explained

---

**✅ Ready to deploy? Start with Pre-Deployment checklist!**

**Need help? Check the full guides above or Render documentation.**
