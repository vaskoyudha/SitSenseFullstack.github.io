# 🚀 Quick Vercel Deployment Guide

## Prerequisites
- Vercel account
- Git repository connected to Vercel
- Firebase project configured

## Step-by-Step Deployment

### 1. Push to Git Repository
```bash
git add .
git commit -m "Setup Vercel deployment with React and static pages"
git push origin main
```

### 2. Vercel Configuration
Vercel will automatically detect `vercel.json` with these settings:
- **Framework:** Vite
- **Build Command:** `cd client && npm install && npm run build`
- **Output Directory:** `client/dist`

### 3. Environment Variables (Optional)
If you need environment variables:
```
VITE_API_URL=your-api-url
VITE_FIREBASE_API_KEY=your-key
```

### 4. Deploy
Vercel will automatically:
1. Install dependencies in `client/`
2. Run `vite build`
3. Deploy `client/dist/` folder
4. Setup routing based on `vercel.json`

## 📋 Deployment Checklist

- [ ] `vercel.json` ada di root project
- [ ] `client/package.json` memiliki `build` script
- [ ] Semua file di `client/public/` sudah lengkap:
  - [ ] `home.html`
  - [ ] `dashboard.html`
  - [ ] `history.html`
  - [ ] `settings.html`
  - [ ] `assets/` folder
  - [ ] `components/` folder
- [ ] Firebase config sudah benar di `client/index.html`
- [ ] React routes sudah setup di `client/src/App.jsx`

## 🌐 Expected URLs After Deployment

### Static Pages
- `your-domain.vercel.app/home.html` - Landing page
- `your-domain.vercel.app/dashboard.html` - Dashboard statis
- `your-domain.vercel.app/history.html` - History statis
- `your-domain.vercel.app/settings.html` - Settings statis

### React Routes (handled by React Router)
- `your-domain.vercel.app/` - React Home
- `your-domain.vercel.app/login` - Login page
- `your-domain.vercel.app/register` - Register page
- `your-domain.vercel.app/dashboard` - Dashboard (protected)
- `your-domain.vercel.app/history` - History (protected)
- `your-domain.vercel.app/settings` - Settings (protected)

## 🧪 Testing After Deployment

### Test 1: Static Pages
```bash
curl https://your-domain.vercel.app/home.html
# Should return HTML content
```

### Test 2: React Routing
```bash
# Visit in browser
https://your-domain.vercel.app/login
# Should show React login page
```

### Test 3: Assets Loading
```bash
# Check if assets are accessible
https://your-domain.vercel.app/assets/img/logo-sitsense.svg
https://your-domain.vercel.app/assets/css/styles.css
```

### Test 4: Authentication
1. Go to `/register`
2. Create account
3. Login at `/login`
4. Should redirect to `/dashboard`

## 🔧 Troubleshooting

### Build Failed
**Error:** `npm install` failed
```bash
# Solution: Check package.json dependencies
cd client
npm install
npm run build
```

### 404 on Static Pages
**Error:** `/home.html` returns 404
```bash
# Solution: Check vercel.json rewrites
# Ensure home.html is in exceptions
```

### React Routes Not Working
**Error:** `/login` returns 404 or shows wrong page
```bash
# Solution: Check vercel.json rewrites
# All non-static routes should go to /index.html
```

### Assets Not Loading
**Error:** CSS/JS files return 404
```bash
# Solution: Check paths in HTML files
# Use relative paths: ./assets/css/styles.css
```

## 📊 Monitoring

### Vercel Dashboard
- Build logs: Check for any build warnings/errors
- Runtime logs: Check for any runtime errors
- Analytics: Monitor page views and performance

### Firebase Console
- Authentication: Monitor user signups/logins
- Realtime Database: Check data flow from ESP32
- Usage: Monitor quota usage

## 🔄 Continuous Deployment

Every push to `main` branch will:
1. Trigger automatic build on Vercel
2. Run tests (if configured)
3. Deploy to production
4. Update domain automatically

## 📝 Post-Deployment Tasks

1. **Test all pages:** Visit each URL and verify functionality
2. **Test authentication:** Register, login, logout
3. **Test Firebase:** Check data sync with ESP32
4. **Performance:** Check page load times
5. **Mobile:** Test on mobile devices
6. **Browser compatibility:** Test on Chrome, Firefox, Safari

## 🎉 Success Criteria

✅ Landing page (`/home.html`) loads correctly  
✅ "Launch App" button redirects to `/login`  
✅ Register page creates new users  
✅ Login page authenticates users  
✅ Dashboard loads after login  
✅ Static dashboard (`/dashboard.html`) works without auth  
✅ All assets (CSS, JS, images) load correctly  
✅ Firebase real-time data updates  
✅ Mobile responsive design works  

## 💡 Tips

1. **Custom Domain:** Add custom domain in Vercel settings
2. **SSL:** Automatic with Vercel
3. **CDN:** Vercel Edge Network automatically enabled
4. **Preview Deployments:** Every PR gets preview URL
5. **Rollback:** Easy rollback to previous deployments

## 🆘 Need Help?

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [React Router Documentation](https://reactrouter.com/)
- [Firebase Documentation](https://firebase.google.com/docs)

