# 🌳 Struktur Final SitSense

## 📂 Struktur Folder Lengkap

```
OVLcr/
│
├── 📄 vercel.json                    # Konfigurasi Vercel deployment
├── 📄 DEPLOYMENT_GUIDE.md            # Panduan deployment lengkap
├── 📄 VERCEL_DEPLOYMENT.md           # Panduan cepat Vercel
├── 📄 DEPLOYMENT_STATUS.md           # Status dan checklist
├── 📄 QUICK_COMMANDS.md              # Referensi perintah
├── 📄 RINGKASAN_PERUBAHAN.md         # Ringkasan dalam Bahasa Indonesia
├── 📄 STRUKTUR_FINAL.md              # File ini
│
├── 📁 client/                        # ⭐ FOLDER UTAMA UNTUK VERCEL
│   │
│   ├── 📄 index.html                 # 🎯 Entry point React (Vite)
│   ├── 📄 package.json               # Dependencies & scripts
│   ├── 📄 vite.config.js             # Vite configuration
│   ├── 📄 tailwind.config.js         # Tailwind CSS config
│   ├── 📄 postcss.config.js          # PostCSS config
│   │
│   ├── 📁 src/                       # 💻 SOURCE CODE REACT
│   │   ├── 📄 main.jsx               # React entry point
│   │   ├── 📄 App.jsx                # React Router setup
│   │   ├── 📄 index.css              # Global styles
│   │   │
│   │   ├── 📁 pages/                 # React Pages
│   │   │   ├── Home.jsx              # Landing page (React)
│   │   │   ├── Login.jsx             # ✅ Login page dengan auth
│   │   │   ├── Register.jsx          # ✅ Register page dengan auth
│   │   │   ├── Dashboard.jsx         # ✅ Dashboard dengan auth
│   │   │   ├── History.jsx           # ✅ History dengan auth
│   │   │   └── Settings.jsx          # ✅ Settings dengan auth
│   │   │
│   │   ├── 📁 components/            # React Components
│   │   │   ├── Charts/
│   │   │   ├── Common/
│   │   │   ├── Dashboard/
│   │   │   ├── Layout/
│   │   │   ├── PostureVisual/
│   │   │   └── Status/
│   │   │
│   │   ├── 📁 context/               # React Context
│   │   │   ├── AuthContext.jsx       # 🔐 Authentication state
│   │   │   ├── DeviceContext.jsx     # Device state
│   │   │   ├── PostureContext.jsx    # Posture data state
│   │   │   └── SettingsContext.jsx   # Settings state
│   │   │
│   │   ├── 📁 services/              # API Services
│   │   │   ├── authService.js        # 🔐 Firebase auth
│   │   │   ├── deviceService.js      # Device management
│   │   │   ├── historyService.js     # History data
│   │   │   └── ...
│   │   │
│   │   ├── 📁 hooks/                 # Custom Hooks
│   │   │   ├── useSitTimer.js
│   │   │   └── useTTS.js
│   │   │
│   │   └── 📁 utils/                 # Utilities
│   │       ├── alerts.js
│   │       ├── tts.js
│   │       └── ui.js
│   │
│   ├── 📁 public/                    # 📦 STATIC FILES (dicopy ke dist/)
│   │   │
│   │   ├── 📄 home.html              # 🏠 Landing page
│   │   ├── 📄 dashboard.html         # 📊 Dashboard statis
│   │   ├── 📄 history.html           # 📈 History statis
│   │   ├── 📄 settings.html          # ⚙️ Settings statis
│   │   │
│   │   ├── 📁 components/            # HTML Components
│   │   │   ├── sidebar.html
│   │   │   ├── header.html
│   │   │   ├── footer.html
│   │   │   ├── panel-parameters.html
│   │   │   ├── modal-detail.html
│   │   │   ├── card-status.html
│   │   │   └── image.png
│   │   │
│   │   └── 📁 assets/                # Assets
│   │       ├── 📁 css/
│   │       │   ├── styles.css
│   │       │   └── theme.css
│   │       │
│   │       ├── 📁 js/
│   │       │   ├── app.js
│   │       │   ├── sidebar.js
│   │       │   ├── ui.js
│   │       │   ├── charts.js
│   │       │   ├── alerts.js
│   │       │   ├── ai-gemini.js
│   │       │   ├── tts-google.js
│   │       │   ├── posture-visual.js
│   │       │   ├── modal-detail.js
│   │       │   ├── history.js
│   │       │   ├── settings.js
│   │       │   └── welcome.js
│   │       │
│   │       ├── 📁 img/
│   │       │   ├── logo-sitsense.svg
│   │       │   ├── posture-silhouette.svg
│   │       │   └── silhouette-white.svg
│   │       │
│   │       └── 📁 audio/
│   │           ├── alertSoft.wav
│   │           ├── alertHard.wav
│   │           └── assistantChime.wav
│   │
│   └── 📁 dist/                      # 🎯 BUILD OUTPUT (untuk Vercel)
│       ├── index.html                # React app
│       ├── home.html                 # Copied from public/
│       ├── dashboard.html            # Copied from public/
│       ├── history.html              # Copied from public/
│       ├── settings.html             # Copied from public/
│       ├── components/               # Copied from public/
│       └── assets/                   # Copied + bundled
│
├── 📁 server/                        # Backend (tidak di-deploy ke Vercel)
│   ├── server.js
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── ...
│
└── 📁 [other files...]               # File-file lain di root
```

## 🌐 URL Mapping

### Flow Vercel Deployment

```
Vercel Deploy
    ↓
Build: cd client && npm run build
    ↓
Output: client/dist/
    ↓
Serve: client/dist/ → your-domain.vercel.app
```

### URL Structure

```
┌─────────────────────────────────────────────────────────┐
│  your-domain.vercel.app                                 │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  STATIC HTML FILES                                │  │
│  │  (dari client/public/)                            │  │
│  │                                                    │  │
│  │  /home.html         → Landing page                │  │
│  │  /dashboard.html    → Dashboard statis            │  │
│  │  /history.html      → History statis              │  │
│  │  /settings.html     → Settings statis             │  │
│  │  /assets/*          → CSS, JS, Images, Audio      │  │
│  │  /components/*      → HTML components             │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  REACT ROUTES                                     │  │
│  │  (dari client/src/, handled by React Router)     │  │
│  │                                                    │  │
│  │  /                  → React Home                  │  │
│  │  /login             → Login (Firebase Auth)       │  │
│  │  /register          → Register (Firebase Auth)    │  │
│  │  /dashboard         → Dashboard (Protected) ✅    │  │
│  │  /history           → History (Protected) ✅      │  │
│  │  /settings          → Settings (Protected) ✅     │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow

### User Flow Diagram

```
┌─────────────────┐
│  User visits    │
│  website        │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  /home.html             │
│  (Landing Page)         │
│                         │
│  • Feature showcase     │
│  • "Launch App" button  │
└────────┬────────────────┘
         │ Click "Launch App"
         ▼
┌─────────────────────────┐
│  /login                 │
│  (React Login Page)     │
│                         │
│  • Email & Password     │
│  • Firebase Auth        │
│  • Link to /register    │
└────────┬────────────────┘
         │ After successful login
         ▼
┌─────────────────────────┐
│  /dashboard             │
│  (Protected React)      │
│                         │
│  • Real-time monitoring │
│  • Charts & analytics   │
│  • AI recommendations   │
│  • ESP32 data           │
└─────────────────────────┘
         │
         ├─────────────────┐
         │                 │
         ▼                 ▼
┌─────────────┐   ┌─────────────┐
│  /history   │   │  /settings  │
│  (Protected)│   │  (Protected)│
└─────────────┘   └─────────────┘
```

### Alternative Flow (No Auth)

```
┌─────────────────┐
│  User visits    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  /dashboard.html        │
│  (Static Dashboard)     │
│                         │
│  • Direct access        │
│  • No authentication    │
│  • All features work    │
│  • Good for demo        │
└─────────────────────────┘
```

## 🔐 Authentication Flow

```
┌──────────────────────────────────────────────────────┐
│  Firebase Authentication                             │
│                                                       │
│  1. User enters credentials                          │
│  2. Firebase validates                               │
│  3. Returns auth token                               │
│  4. Token stored in AuthContext (React)              │
│  5. Protected routes check token                     │
│  6. Redirect to /login if no token                   │
└──────────────────────────────────────────────────────┘
```

## 📦 Build Process

```
Step 1: npm install
  ↓
  Install 219 packages
  ├── react
  ├── react-router-dom
  ├── chart.js
  ├── axios
  ├── tailwindcss
  ├── daisyui
  └── ...

Step 2: vite build
  ↓
  Transform & Bundle
  ├── Process JSX → JavaScript
  ├── Process CSS → Minified CSS
  ├── Optimize images
  ├── Bundle dependencies
  └── Generate source maps

Step 3: Copy public/ files
  ↓
  Copy to dist/
  ├── home.html
  ├── dashboard.html
  ├── history.html
  ├── settings.html
  ├── components/
  └── assets/

Step 4: Output dist/
  ↓
  Ready to deploy!
  ├── index.html (5.31 KB)
  ├── assets/index-*.js (513 KB)
  ├── assets/style-*.css (143 KB)
  └── [all copied files]
```

## 🎯 File Locations Quick Reference

### Untuk Edit Landing Page
```
Edit: client/public/home.html
Deploy: Akan menjadi /home.html di Vercel
```

### Untuk Edit Dashboard Statis
```
Edit: client/public/dashboard.html
Deploy: Akan menjadi /dashboard.html di Vercel
```

### Untuk Edit React Pages (Login/Register/Dashboard)
```
Edit: client/src/pages/[PageName].jsx
Deploy: Akan di-bundle ke /assets/index-*.js
Access: Via React Router (/, /login, /register, /dashboard, dll)
```

### Untuk Edit Components
```
Static HTML: client/public/components/*.html
React: client/src/components/**/*.jsx
```

### Untuk Edit Styles
```
Global CSS: client/src/index.css
Static CSS: client/public/assets/css/*.css
Tailwind Config: client/tailwind.config.js
```

### Untuk Edit JavaScript
```
React Logic: client/src/**/*.js(x)
Static JS: client/public/assets/js/*.js
```

## 🚀 Deployment Checklist

Sebelum deploy, pastikan:

- [x] Semua file di `client/public/` lengkap
- [x] `vercel.json` sudah dikonfigurasi
- [x] Firebase config sudah benar
- [x] Build test berhasil (`npm run build`)
- [x] Dependencies terinstall (`npm install`)
- [x] Git changes committed
- [ ] Push to GitHub → Vercel auto-deploy

## 💡 Tips

1. **Edit di `client/public/`** untuk static pages
2. **Edit di `client/src/`** untuk React pages
3. **Test build** dengan `npm run build` sebelum push
4. **Check `dist/`** untuk verify output
5. **Monitor Vercel logs** setelah deploy

---

**📚 Dokumentasi Lainnya:**
- `DEPLOYMENT_GUIDE.md` - Panduan lengkap
- `VERCEL_DEPLOYMENT.md` - Panduan Vercel
- `QUICK_COMMANDS.md` - Perintah cepat
- `RINGKASAN_PERUBAHAN.md` - Ringkasan changes

**Status:** ✅ SIAP DEPLOY

