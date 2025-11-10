# ⚡ Quick Commands Reference

## 🚀 Deployment Commands

### Deploy to Vercel (via Git)
```bash
# Navigate to project root
cd /home/vasko/.cursor/worktrees/SitSenseFullstack.github.io/OVLcr

# Stage all changes
git add .

# Commit with message
git commit -m "Deploy SitSense with React authentication"

# Push to main branch (triggers Vercel auto-deploy)
git push origin main
```

### Deploy to Vercel (via CLI)
```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
cd /home/vasko/.cursor/worktrees/SitSenseFullstack.github.io/OVLcr
vercel --prod
```

## 🛠️ Development Commands

### Local Development
```bash
# Start development server
cd /home/vasko/.cursor/worktrees/SitSenseFullstack.github.io/OVLcr/client
npm run dev

# Access at: http://localhost:5173
```

### Build & Test
```bash
# Build for production
cd /home/vasko/.cursor/worktrees/SitSenseFullstack.github.io/OVLcr/client
npm run build

# Preview production build
npm run preview
```

### Install/Update Dependencies
```bash
cd /home/vasko/.cursor/worktrees/SitSenseFullstack.github.io/OVLcr/client
npm install
```

## 🔍 Verification Commands

### Check Build Output
```bash
# List dist contents
ls -lah /home/vasko/.cursor/worktrees/SitSenseFullstack.github.io/OVLcr/client/dist

# Check specific folders
ls -lah /home/vasko/.cursor/worktrees/SitSenseFullstack.github.io/OVLcr/client/dist/assets
ls -lah /home/vasko/.cursor/worktrees/SitSenseFullstack.github.io/OVLcr/client/dist/components
```

### Check File Sizes
```bash
cd /home/vasko/.cursor/worktrees/SitSenseFullstack.github.io/OVLcr/client/dist
du -sh *
```

## 🧹 Clean Commands

### Clean Build
```bash
cd /home/vasko/.cursor/worktrees/SitSenseFullstack.github.io/OVLcr/client
rm -rf dist
npm run build
```

### Clean Dependencies
```bash
cd /home/vasko/.cursor/worktrees/SitSenseFullstack.github.io/OVLcr/client
rm -rf node_modules package-lock.json
npm install
```

## 📝 Git Commands

### Check Status
```bash
cd /home/vasko/.cursor/worktrees/SitSenseFullstack.github.io/OVLcr
git status
```

### View Changes
```bash
git diff
```

### Undo Changes (before commit)
```bash
# Discard changes in specific file
git checkout -- filename

# Discard all changes
git reset --hard
```

### Create Branch
```bash
# Create and switch to new branch
git checkout -b feature/new-feature

# Push branch to remote
git push origin feature/new-feature
```

## 🔄 Update Commands

### Update from Root to Client
If you make changes in root folder and need to copy to client:

```bash
# Copy home.html
cp /home/vasko/.cursor/worktrees/SitSenseFullstack.github.io/OVLcr/home.html \
   /home/vasko/.cursor/worktrees/SitSenseFullstack.github.io/OVLcr/client/public/

# Copy dashboard (from index.html)
cp /home/vasko/.cursor/worktrees/SitSenseFullstack.github.io/OVLcr/index.html \
   /home/vasko/.cursor/worktrees/SitSenseFullstack.github.io/OVLcr/client/public/dashboard.html

# Copy history
cp /home/vasko/.cursor/worktrees/SitSenseFullstack.github.io/OVLcr/history.html \
   /home/vasko/.cursor/worktrees/SitSenseFullstack.github.io/OVLcr/client/public/

# Copy settings
cp /home/vasko/.cursor/worktrees/SitSenseFullstack.github.io/OVLcr/settings.html \
   /home/vasko/.cursor/worktrees/SitSenseFullstack.github.io/OVLcr/client/public/

# Copy components
cp -r /home/vasko/.cursor/worktrees/SitSenseFullstack.github.io/OVLcr/components \
      /home/vasko/.cursor/worktrees/SitSenseFullstack.github.io/OVLcr/client/public/

# Copy assets
cp -r /home/vasko/.cursor/worktrees/SitSenseFullstack.github.io/OVLcr/assets \
      /home/vasko/.cursor/worktrees/SitSenseFullstack.github.io/OVLcr/client/public/
```

## 🌐 Vercel Commands

### Check Deployment Status
```bash
vercel ls
```

### View Logs
```bash
vercel logs [deployment-url]
```

### Open Deployment in Browser
```bash
vercel open
```

### Remove Deployment
```bash
vercel rm [deployment-name]
```

## 🐛 Debug Commands

### Check Node Version
```bash
node --version
npm --version
```

### Check Git Status
```bash
git remote -v
git branch -a
```

### Check Package Scripts
```bash
cd /home/vasko/.cursor/worktrees/SitSenseFullstack.github.io/OVLcr/client
npm run
```

### Test Firebase Connection
```bash
# Open browser console and run:
# firebase.auth().currentUser
# firebase.database().ref('test').set({test: 'value'})
```

## 📊 Monitoring Commands

### Watch Build
```bash
cd /home/vasko/.cursor/worktrees/SitSenseFullstack.github.io/OVLcr/client
npm run build -- --watch
```

### Check Bundle Size
```bash
cd /home/vasko/.cursor/worktrees/SitSenseFullstack.github.io/OVLcr/client
npm run build
ls -lh dist/assets/*.js
ls -lh dist/assets/*.css
```

## 🔐 Environment Variables

### Set Environment Variables (Local)
```bash
# Create .env file
cd /home/vasko/.cursor/worktrees/SitSenseFullstack.github.io/OVLcr/client
cat > .env << EOF
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your-key
EOF
```

### Set Environment Variables (Vercel)
```bash
vercel env add VITE_API_URL
vercel env add VITE_FIREBASE_API_KEY
```

## 📦 Backup Commands

### Backup Current Setup
```bash
cd /home/vasko/.cursor/worktrees/SitSenseFullstack.github.io
tar -czf OVLcr-backup-$(date +%Y%m%d).tar.gz OVLcr/
```

### Restore from Backup
```bash
tar -xzf OVLcr-backup-YYYYMMDD.tar.gz
```

## 🎯 One-Line Deployment

### Full Deployment (Build + Deploy)
```bash
cd /home/vasko/.cursor/worktrees/SitSenseFullstack.github.io/OVLcr/client && \
npm install && npm run build && cd .. && \
git add . && git commit -m "Deploy update" && git push origin main
```

### Quick Deploy (if already built)
```bash
cd /home/vasko/.cursor/worktrees/SitSenseFullstack.github.io/OVLcr && \
git add . && git commit -m "Quick deploy" && git push origin main
```

## 💡 Useful Aliases (Optional)

Add to `~/.bashrc` or `~/.zshrc`:

```bash
# SitSense aliases
alias ss-dev='cd /home/vasko/.cursor/worktrees/SitSenseFullstack.github.io/OVLcr/client && npm run dev'
alias ss-build='cd /home/vasko/.cursor/worktrees/SitSenseFullstack.github.io/OVLcr/client && npm run build'
alias ss-deploy='cd /home/vasko/.cursor/worktrees/SitSenseFullstack.github.io/OVLcr && git add . && git commit -m "Deploy" && git push'
alias ss-clean='cd /home/vasko/.cursor/worktrees/SitSenseFullstack.github.io/OVLcr/client && rm -rf dist node_modules && npm install && npm run build'
```

After adding, reload:
```bash
source ~/.bashrc  # or source ~/.zshrc
```

Then use:
```bash
ss-dev      # Start development
ss-build    # Build project
ss-deploy   # Deploy to Vercel
ss-clean    # Clean and rebuild
```

---

**💡 Tip:** Bookmark this file for quick reference!

