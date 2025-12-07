# Deployment Guide

## Backend Deployment (Render.com)

### Prerequisites
- GitHub account
- Render account (sign up at https://render.com)

### Steps:

1. **Push your code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Add deployment configs"
   git push origin main
   ```

2. **Deploy on Render**:
   - Go to https://render.com and sign in
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `ecommerce-backend` directory
   - Configure:
     - **Name**: ecommerce-backend (or your preferred name)
     - **Runtime**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Plan**: Free
   - Click "Create Web Service"
   - Copy your backend URL (e.g., https://ecommerce-backend-xxxx.onrender.com)

3. **Note**: Free tier sleeps after 15 minutes of inactivity. First request may take 30-60 seconds.

---

## Frontend Deployment (Vercel)

### Prerequisites
- GitHub account
- Vercel account (sign up at https://vercel.com)

### Steps:

1. **Deploy on Vercel**:
   - Go to https://vercel.com and sign in with GitHub
   - Click "Add New" → "Project"
   - Import your GitHub repository
   - Configure:
     - **Framework Preset**: Next.js (auto-detected)
     - **Root Directory**: `ecommerce-frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `.next`
   
2. **Add Environment Variable**:
   - In Vercel dashboard → Settings → Environment Variables
   - Add: `NEXT_PUBLIC_API_URL` = `YOUR_RENDER_BACKEND_URL`
   - (Replace with your actual Render backend URL)
   - Redeploy after adding environment variable

3. **Deploy**: Click "Deploy"

Your frontend will be live at: `https://your-project.vercel.app`

---

## Alternative Free Hosting Options

### Backend Alternatives:
1. **Railway** (https://railway.app)
   - 500 hours/month free
   - Connect GitHub → Deploy

2. **Cyclic** (https://cyclic.sh)
   - Unlimited free apps
   - Connect GitHub → Deploy

3. **Fly.io** (https://fly.io)
   - Free tier available
   - Deploy via CLI

### Frontend Alternatives:
1. **Netlify** (https://netlify.com)
   - Similar to Vercel
   - Connect GitHub → Deploy

2. **Cloudflare Pages** (https://pages.cloudflare.com)
   - Free unlimited sites
   - Connect GitHub → Deploy

---

## Important Notes

1. **CORS Configuration**: The backend is configured to accept requests from any origin. In production, you should update CORS to only allow your frontend domain.

2. **Environment Variables**:
   - Backend: Set `PORT` environment variable (Render sets this automatically)
   - Frontend: Set `NEXT_PUBLIC_API_URL` to your backend URL

3. **Database**: Currently using in-memory storage. Data resets on server restart. For production, consider:
   - MongoDB Atlas (free tier)
   - PostgreSQL on Render (free tier)
   - Supabase (free tier)

4. **Free Tier Limitations**:
   - Render: Services sleep after 15 mins of inactivity
   - Vercel: Generous limits for personal projects
   - Both have bandwidth and request limits

---

## Updating Your Deployment

### After making changes:

1. Push to GitHub:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. Both Render and Vercel will automatically redeploy on push to main branch

---

## Troubleshooting

### Backend not responding:
- Check Render logs in dashboard
- Ensure start command is correct: `npm start`
- Verify PORT environment variable

### Frontend can't connect to backend:
- Check `NEXT_PUBLIC_API_URL` environment variable
- Ensure backend URL is correct
- Check browser console for CORS errors

### Build failures:
- Check build logs in Render/Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility
