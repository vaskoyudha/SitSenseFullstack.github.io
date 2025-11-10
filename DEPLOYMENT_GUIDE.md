# SitSense Deployment Guide

## 📁 Struktur Folder

```
OVLcr/
├── client/                      # Aplikasi frontend
│   ├── index.html              # Entry point React (untuk Vite)
│   ├── public/                 # File statis yang akan dicopy ke dist/
│   │   ├── home.html          # Landing page statis
│   │   ├── dashboard.html     # Dashboard statis (tanpa auth)
│   │   ├── history.html       # History page statis
│   │   ├── settings.html      # Settings page statis
│   │   ├── components/        # Komponen HTML yang digunakan HTML statis
│   │   │   ├── sidebar.html
│   │   │   ├── header.html
│   │   │   ├── footer.html
│   │   │   ├── panel-parameters.html
│   │   │   └── modal-detail.html
│   │   └── assets/            # Asset statis
│   │       ├── css/           # Stylesheet
│   │       ├── js/            # JavaScript files
│   │       ├── img/           # Images
│   │       └── audio/         # Audio files
│   ├── src/                   # React source code
│   │   ├── App.jsx           # React router setup
│   │   ├── main.jsx          # React entry point
│   │   ├── pages/            # React pages
│   │   │   ├── Home.jsx      # Landing page (React)
│   │   │   ├── Login.jsx     # Login page dengan auth
│   │   │   ├── Register.jsx  # Register page dengan auth
│   │   │   ├── Dashboard.jsx # Dashboard dengan auth
│   │   │   ├── History.jsx   # History dengan auth
│   │   │   └── Settings.jsx  # Settings dengan auth
│   │   ├── components/       # React components
│   │   ├── context/          # React context (Auth, Device, Posture, Settings)
│   │   ├── services/         # API services
│   │   └── hooks/            # Custom React hooks
│   ├── package.json
│   └── vite.config.js
├── server/                    # Backend Node.js/Express
├── vercel.json               # Vercel deployment config
└── DEPLOYMENT_GUIDE.md       # This file
```

## 🌐 URL Routing

### Static HTML Pages (Accessible directly)
- `/home.html` - Landing page statis
- `/dashboard.html` - Dashboard statis (tidak ada auth)
- `/history.html` - History statis
- `/settings.html` - Settings statis

### React Routes (Dengan React Router)
- `/` - Home page (React component)
- `/login` - Login page (Firebase auth)
- `/register` - Register page (Firebase auth)
- `/dashboard` - Dashboard dengan authentication
- `/history` - History dengan authentication
- `/settings` - Settings dengan authentication

## 🚀 User Flow

1. **Pengunjung pertama kali:**
   - Akses `/home.html` → Landing page
   - Klik "Launch App" → Redirect ke `/login`

2. **User belum login:**
   - `/login` → Form login dengan Firebase Auth
   - Link ke `/register` jika belum punya akun

3. **User sudah login:**
   - Redirect otomatis ke `/dashboard`
   - Akses penuh ke `/history`, `/settings`
   - Protected routes menggunakan React Context

## 🔐 Authentication

- **Firebase Authentication** digunakan untuk login/register
- **ProtectedRoute** component melindungi route yang memerlukan auth
- **AuthContext** menyimpan state user di seluruh aplikasi

```jsx
// Protected route example
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

## 📦 Build Process

### Development
```bash
cd client
npm install
npm run dev  # Runs on http://localhost:5173
```

### Production Build
```bash
cd client
npm run build  # Creates dist/ folder
```

### File Output (dist/)
```
dist/
├── index.html              # React app entry (dari client/index.html)
├── home.html              # Copied from public/
├── dashboard.html         # Copied from public/
├── history.html           # Copied from public/
├── settings.html          # Copied from public/
├── components/            # Copied from public/components/
├── assets/                # Copied from public/assets/ + bundled assets
│   ├── css/
│   ├── js/
│   ├── img/
│   └── audio/
└── [bundled React files]
```

## ☁️ Vercel Deployment

### vercel.json Configuration
```json
{
  "buildCommand": "cd client && npm install && npm run build",
  "outputDirectory": "client/dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/((?!home\\.html|dashboard\\.html|history\\.html|settings\\.html|assets/|components/).*)",
      "destination": "/index.html"
    }
  ]
}
```

### Routing Logic
- Static files (`.html`, `/assets/`, `/components/`) → Served directly
- Semua request lainnya → Diarahkan ke `/index.html` (React app)
- React Router menangani routing internal (`/login`, `/register`, `/dashboard`, dll)

## 🔧 Firebase Configuration

Firebase sudah dikonfigurasi di:
1. `client/index.html` - Entry point React
2. `client/public/dashboard.html` - Dashboard statis
3. `client/src/services/authService.js` - Service untuk auth

### Firebase Config
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyCHpITmPUoKIb2niuh0G4vhJJJ0vBM2ijE",
  authDomain: "esp32kursi-pintar.firebaseapp.com",
  databaseURL: "https://esp32kursi-pintar-default-rtdb.firebaseio.com",
  projectId: "esp32kursi-pintar",
  storageBucket: "esp32kursi-pintar.appspot.com",
  messagingSenderId: "265798521874",
  appId: "1:265798521874:web:6097e5ae6ccf8ad683b4cb"
};
```

## 🐛 Troubleshooting

### Issue: Login/Register tidak berfungsi di Vercel
**Solution:** 
- Pastikan Firebase configuration sudah benar
- Check browser console untuk error Firebase
- Verifikasi domain sudah ditambahkan di Firebase Console

### Issue: Static HTML tidak load assets
**Solution:**
- Pastikan path menggunakan relative path (`./assets/`)
- Verifikasi file ada di `client/public/assets/`
- Check vercel.json sudah exclude `assets/` dari rewrites

### Issue: React routing tidak berfungsi
**Solution:**
- Pastikan vercel.json rewrites configuration benar
- Verifikasi React Router setup di `App.jsx`
- Check browser console untuk routing errors

## 📝 Notes

### Static vs React Pages
- **Static HTML** (`home.html`, `dashboard.html`, dll):
  - Load langsung tanpa React
  - Lebih cepat untuk first paint
  - Cocok untuk landing page
  - Dashboard statis tidak ada authentication

- **React Pages** (`/login`, `/dashboard`, dll):
  - Dynamic dengan state management
  - Authentication terintegrasi
  - Lebih interactive
  - Recommended untuk dashboard yang perlu auth

### Rekomendasi Production
1. Gunakan `/home.html` sebagai landing page
2. Redirect user ke `/login` untuk akses dashboard
3. Gunakan React dashboard (`/dashboard`) untuk user yang sudah login
4. Static dashboard (`/dashboard.html`) bisa digunakan untuk demo tanpa auth

## 🔗 Links

- **Local Development:** http://localhost:5173
- **Vercel Production:** [Your Vercel URL]
- **Firebase Console:** https://console.firebase.google.com

## 📞 Contact

Untuk pertanyaan atau issue, silakan buat issue di repository atau contact tim developer.

