# Troubleshooting Guide

## Error: "Unexpected token '<', '<!DOCTYPE'... is not valid JSON"

### What This Means
Your frontend is deployed on Vercel, but it's trying to call a backend API that either:
1. **Is not deployed yet** (most common)
2. **Has an incorrect URL configured**
3. **Is returning HTML error pages instead of JSON**

### How to Fix

#### Step 1: Deploy Your Backend First

**Option A: Deploy on Render.com (Recommended)**

1. Go to [https://render.com](https://render.com) and sign in with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect your repository: `sumukhbendre123/NeustackAssignment`
4. Configure the service:
   ```
   Name: ecommerce-backend
   Region: Choose closest to you
   Branch: main
   Root Directory: ecommerce-backend
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   ```
5. Click **"Create Web Service"**
6. Wait 2-3 minutes for deployment
7. **Copy your backend URL** (e.g., `https://ecommerce-backend-xxxx.onrender.com`)

**Option B: Deploy on Railway.app**

1. Go to [https://railway.app](https://railway.app) and sign in with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select `NeustackAssignment`
4. Add a service:
   ```
   Root Directory: ecommerce-backend
   Start Command: npm start
   ```
5. Copy your backend URL

#### Step 2: Update Frontend Environment Variable

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variable:
   ```
   Name: NEXT_PUBLIC_API_URL
   Value: https://your-backend-url.onrender.com/api
   ```
   ⚠️ **Important**: Add `/api` at the end of your backend URL!
   
4. Also add:
   ```
   Name: NEXT_PUBLIC_CURRENCY_SYMBOL
   Value: $
   ```

5. Click **Save**

#### Step 3: Redeploy Frontend

1. Go to **Deployments** tab in Vercel
2. Click the three dots (•••) on the latest deployment
3. Click **"Redeploy"**

OR simply push a new commit:
```bash
git commit --allow-empty -m "Trigger redeploy"
git push origin main
```

### Verify Backend is Working

Open your backend URL in a browser and add `/api/health`:
```
https://your-backend-url.onrender.com/api/health
```

You should see:
```json
{
  "status": "OK",
  "message": "E-commerce backend is running"
}
```

If you see HTML or an error page, your backend is not deployed correctly.

---

## Common Issues

### Issue: Backend URL Returns HTML
**Cause**: Backend not deployed or wrong URL
**Fix**: Verify backend is deployed and URL is correct

### Issue: CORS Error
**Cause**: Backend not configured to accept requests from frontend domain
**Fix**: Backend already has CORS enabled for all origins, should work automatically

### Issue: Backend Sleeps (Render Free Tier)
**Cause**: Render free tier services sleep after 15 minutes of inactivity
**Fix**: First request after sleep takes 30-60 seconds. Consider:
- Using Railway (doesn't sleep as quickly)
- Upgrading to Render paid tier
- Adding a keep-alive ping service

### Issue: Environment Variables Not Working
**Cause**: Environment variables must start with `NEXT_PUBLIC_` to be accessible in browser
**Fix**: All variables are correctly named with `NEXT_PUBLIC_` prefix

---

## Testing Locally

To test the full stack locally before deploying:

1. **Start Backend**:
   ```bash
   cd ecommerce-backend
   npm install
   npm start
   ```
   Should run on `http://localhost:3001`

2. **Start Frontend**:
   ```bash
   cd ecommerce-frontend
   npm install
   npm run dev
   ```
   Should run on `http://localhost:3000`

3. **Test the flow**:
   - Add items to cart
   - Try to checkout
   - Should work without errors

---

## Environment Variables Reference

### Frontend (.env.local or Vercel Environment Variables)
```bash
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
NEXT_PUBLIC_CURRENCY_SYMBOL=$
```

### Backend (Render Environment Variables)
```bash
PORT=3001  # Auto-set by Render
NODE_ENV=production  # Optional
```

---

## Checking API Calls in Browser

1. Open your deployed frontend
2. Open browser DevTools (F12)
3. Go to **Console** tab
4. Try to checkout
5. Look for error messages showing the API URL being called
6. Verify it matches your backend URL

If you see `http://localhost:3001/api`, your environment variable is not set correctly in Vercel.

---

## Need More Help?

1. Check Render logs: Dashboard → Your Service → Logs
2. Check Vercel logs: Dashboard → Deployments → View Function Logs
3. Check browser console for detailed error messages
4. Verify all environment variables are set correctly
