# 🚀 Deploy Backend to Vercel

## Quick Deploy Steps

### 1. Go to Vercel
https://vercel.com/dashboard

### 2. Import Project
- Click "Add New..." → "Project"
- Find `Loopin` repository
- Click "Import"

### 3. Configure

**Project Name:**
```
loopin-backend
```

**Framework Preset:**
```
Other
```

**Root Directory:**
```
./
```

**Build Command:**
```
cd loopin-backend && npm install
```

**Install Command:**
```
npm install
```

### 4. Environment Variables

Add these in the "Environment Variables" section:

```
NODE_ENV=production
```

```
SUPABASE_URL=https://whssxsnrukuarrhcufsu.supabase.co
```

```
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indoc3N4c25ydWt1YXJyaGN1ZnN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMDc3NjgsImV4cCI6MjA4Mzc4Mzc2OH0.PG94_YRK38HR3UTB3yQg5mT5nafUW4nmejJY8jUQgM8
```

```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indoc3N4c25ydWt1YXJyaGN1ZnN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODIwNzc2OCwiZXhwIjoyMDgzNzgzNzY4fQ.yjAc6EsrqzqGaG0d4i9RJfbFm68_DnGlWlR9I9m6hZY
```

```
CONTRACT_ADDRESS=ST36BMEQDCRCKYF8HPPDMN1BCSY6TR2NG0BZSQPYG
```

```
CONTRACT_NAME=loopin-game
```

```
NETWORK=testnet
```

```
ORACLE_PRIVATE_KEY=placeholder_will_add_later
```

```
CORS_ORIGIN=*
```

```
JWT_SECRET=loopin-production-secret-2026
```

```
API_PREFIX=/api
```

### 5. Deploy

Click "Deploy" button and wait 1-2 minutes.

### 6. Test

Once deployed, test your backend:
```
https://loopin-backend.vercel.app/health
```

Should return:
```json
{
  "status": "ok",
  "services": {
    "supabase": "✅ Connected",
    "blockchain": "✅ Configured"
  }
}
```

---

## After Deployment

### Update Frontend

1. Go to your frontend Vercel project
2. Settings → Environment Variables
3. Update or add:
```
VITE_API_URL=https://loopin-backend.vercel.app/api
```
4. Redeploy frontend

### Update CORS

1. Go to backend Vercel project
2. Settings → Environment Variables
3. Update CORS_ORIGIN to your frontend URL:
```
CORS_ORIGIN=https://your-frontend-url.vercel.app
```
4. Redeploy backend

---

## Testing

### Test Backend Health
```
curl https://loopin-backend.vercel.app/health
```

### Test Player Registration
```
curl -X POST https://loopin-backend.vercel.app/api/players/register \
  -H "Content-Type: application/json" \
  -d '{"wallet_address": "ST1TEST", "username": "TestUser"}'
```

### Test from Frontend
1. Go to your frontend app
2. Try to register
3. Check browser console for API calls
4. Should see requests to your Vercel backend

---

## Troubleshooting

### Build fails
- Check build logs in Vercel
- Verify vercel.json is in repo root
- Check package.json exists in loopin-backend/

### Environment variables not working
- Make sure they're added in Vercel dashboard
- Redeploy after adding variables
- Check deployment logs

### CORS errors
- Update CORS_ORIGIN to your frontend URL
- Use `*` for testing (not recommended for production)
- Redeploy after changing

### 404 errors
- Check vercel.json routes configuration
- Verify API_PREFIX matches your routes
- Test /health endpoint first

---

## ✅ Checklist

- [ ] Vercel project created
- [ ] All environment variables added
- [ ] Backend deployed successfully
- [ ] /health endpoint works
- [ ] Frontend VITE_API_URL updated
- [ ] Frontend redeployed
- [ ] CORS_ORIGIN updated
- [ ] End-to-end test successful

---

## 🎯 Your URLs

**Backend:** https://loopin-backend.vercel.app
**Frontend:** https://your-frontend.vercel.app
**API:** https://loopin-backend.vercel.app/api

**Health Check:** https://loopin-backend.vercel.app/health

---

Done! Your backend is now on Vercel! 🎉
