# Deployment Guide

## Deployment Checklist

### Frontend Deployment (Vercel/Netlify)

1. **Build Frontend**
   ```bash
   cd client
   npm install
   npm run build
   ```

2. **Deploy to Vercel**

   **Metode 1: Menggunakan Vercel CLI (Command Line)**
   
   a. **Install Vercel CLI secara global:**
      ```bash
      npm install -g vercel
      ```
      *Catatan: Jika mendapat error permission, gunakan `sudo npm install -g vercel` (Linux/Mac) atau buka terminal sebagai Administrator (Windows)*
   
   b. **Login ke Vercel:**
      ```bash
      vercel login
      ```
      - Perintah ini akan membuka browser untuk login
      - Pilih "Continue with GitHub" atau "Continue with Email"
      - Setelah login berhasil, kembali ke terminal
   
   c. **Masuk ke folder client:**
      ```bash
      cd client
      ```
   
   d. **Deploy ke Vercel:**
      ```bash
      vercel --prod
      ```
      - Vercel akan menanyakan beberapa pertanyaan:
        - "Set up and deploy?" → Tekan Enter (Yes)
        - "Which scope?" → Pilih akun Anda
        - "Link to existing project?" → Tekan Enter (No)
        - "What's your project's name?" → Tekan Enter (default: sitsense-client) atau ketik nama custom
        - "In which directory is your code located?" → Ketik `./` (karena kita sudah di folder client)
        - "Override settings?" → Tekan Enter (No)
      - Vercel akan mulai build dan deploy
      - Setelah selesai, Anda akan mendapat URL seperti: `https://sitsense-client.vercel.app`
   
   e. **Set Environment Variables melalui Dashboard:**
      
      **Apa itu Environment Variables?**
      Environment variables adalah konfigurasi yang menyimpan informasi sensitif atau URL yang berbeda antara development dan production. Di Vercel, variable ini akan di-inject ke dalam code saat build, sehingga frontend tahu kemana harus connect ke backend.
      
      **Mengapa perlu Environment Variables?**
      - Frontend React perlu tahu URL backend untuk API calls
      - URL backend berbeda antara local development dan production
      - Dengan environment variables, kita bisa set URL yang berbeda untuk setiap environment tanpa mengubah code
      
      **Langkah-langkah detail:**
      
      **Langkah 1: Buka Vercel Dashboard**
      - Buka browser dan kunjungi: https://vercel.com/dashboard
      - Login jika belum login
      - Anda akan melihat daftar semua project Anda
      
      **Langkah 2: Pilih Project**
      - Cari dan klik project Anda (nama project biasanya: `sitsense-client` atau nama yang Anda berikan saat deploy)
      - Setelah klik, Anda akan masuk ke halaman detail project
      
      **Langkah 3: Buka Settings**
      - Di bagian atas halaman, Anda akan melihat beberapa tab: "Overview", "Deployments", "Analytics", "Settings", dll
      - Klik tab **"Settings"** (biasanya di paling kanan atau setelah "Analytics")
      
      **Langkah 4: Buka Environment Variables**
      - Di menu kiri (sidebar), scroll ke bawah
      - Anda akan melihat beberapa opsi seperti: "General", "Domains", "Environment Variables", "Functions", dll
      - Klik **"Environment Variables"** di menu kiri
      - Halaman akan menampilkan daftar environment variables yang sudah ada (jika ada) atau kosong
      
      **Langkah 5: Tambahkan Variable Pertama (VITE_API_URL)**
      
      - Klik tombol **"Add New"** atau **"Add"** (biasanya di kanan atas atau di tengah halaman)
      - Akan muncul form untuk menambah variable baru dengan 3 field:
        
        **Field 1: Key (Name)**
        - Ketik: `VITE_API_URL`
        - **PENTING:** Harus tepat seperti ini, case-sensitive (huruf besar/kecil penting)
        - **Mengapa `VITE_`?** Karena kita menggunakan Vite sebagai build tool, dan Vite hanya akan expose environment variables yang dimulai dengan `VITE_` ke frontend code
        
        **Field 2: Value**
        - Ketik URL backend Anda, contoh: `https://sitsense-backend.railway.app/api`
        - **Format:** `https://[nama-backend-anda].[platform].app/api`
        - **Contoh platform:** railway.app, render.com, herokuapp.com
        - **PENTING:** Harus menggunakan `https://` (bukan `http://`)
        - **PENTING:** Harus diakhiri dengan `/api` karena semua API endpoints kita ada di `/api/*`
        - **Cara dapat URL backend:** Setelah deploy backend ke Railway/Render, mereka akan memberikan URL seperti: `https://sitsense-backend-production.up.railway.app`
        - Maka Value-nya adalah: `https://sitsense-backend-production.up.railway.app/api`
        
        **Field 3: Environment**
        - Anda akan melihat 3 checkbox: "Production", "Preview", "Development"
        - **Centang SEMUA TIGA** checkbox:
          - ✅ Production: Untuk website yang live (yang dilihat user)
          - ✅ Preview: Untuk preview deployment (setiap push ke branch lain)
          - ✅ Development: Untuk development (jika ada)
        - **Mengapa centang semua?** Agar variable ini tersedia di semua environment, sehingga aplikasi bisa jalan di semua kondisi
      
      - Setelah semua field diisi, klik tombol **"Save"** atau **"Add"** (biasanya di kanan bawah form)
      - Variable pertama akan muncul di daftar
      
      **Langkah 6: Tambahkan Variable Kedua (VITE_SOCKET_URL)**
      
      - Klik tombol **"Add New"** lagi untuk menambah variable kedua
      - Isi form dengan:
        
        **Key:** `VITE_SOCKET_URL`
        - **PENTING:** Nama harus tepat seperti ini
        
        **Value:** `https://sitsense-backend-production.up.railway.app`
        - **PENTING:** URL backend yang SAMA dengan variable pertama, TAPI **TANPA** `/api` di akhir
        - **Mengapa tanpa /api?** Karena Socket.io tidak menggunakan path `/api`, langsung ke root domain
        - Contoh: Jika backend URL adalah `https://sitsense-backend.railway.app`, maka:
          - `VITE_API_URL` = `https://sitsense-backend.railway.app/api` ✅
          - `VITE_SOCKET_URL` = `https://sitsense-backend.railway.app` ✅ (tanpa /api)
        
        **Environment:** Centang semua (Production, Preview, Development) ✅
      
      - Klik **"Save"**
      - Sekarang Anda akan melihat 2 environment variables di daftar:
        1. `VITE_API_URL` = `https://.../api`
        2. `VITE_SOCKET_URL` = `https://...`
      
      **Langkah 7: Redeploy Project (SANGAT PENTING!)**
      
      **Mengapa perlu redeploy?**
      - Environment variables hanya di-inject saat build
      - Deployment yang sudah ada dibuat SEBELUM environment variables di-set
      - Jadi deployment lama tidak punya akses ke environment variables baru
      - Dengan redeploy, Vercel akan build ulang dengan environment variables yang baru
      
      **Cara Redeploy:**
      
      1. **Klik tab "Deployments"** (di bagian atas halaman, biasanya di sebelah "Settings")
      2. Anda akan melihat daftar semua deployment (build) yang pernah dilakukan
      3. Deployment terbaru biasanya ada di paling atas
      4. Di setiap deployment, ada tombol **"..."** (three dots / menu) di kanan
      5. **Klik "..." pada deployment terbaru** (yang paling atas)
      6. Akan muncul dropdown menu dengan beberapa opsi:
         - "Redeploy"
         - "Cancel"
         - "View Logs"
         - dll
      7. **Klik "Redeploy"**
      8. Akan muncul popup konfirmasi dengan beberapa opsi:
         - **"Use existing Build Cache"** (checkbox)
           - Centang jika ingin build lebih cepat (menggunakan cache)
           - Biarkan tidak tercentang jika ingin build fresh (disarankan untuk pertama kali)
         - Tombol "Redeploy" atau "Cancel"
      9. **Klik tombol "Redeploy"** di popup
      10. Vercel akan mulai build ulang project Anda
      11. Tunggu beberapa menit (biasanya 1-3 menit)
      12. Setelah selesai, status akan berubah menjadi "Ready" dengan centang hijau
      13. Website Anda sekarang sudah menggunakan environment variables yang baru!
      
      **Cara Cek Apakah Environment Variables Sudah Terpakai:**
      - Setelah redeploy selesai, buka website Anda
      - Tekan F12 di browser untuk buka Developer Tools
      - Klik tab "Console"
      - Cek apakah ada error connection ke backend
      - Atau cek tab "Network" untuk melihat request ke API
      - Jika environment variables benar, website akan bisa connect ke backend
      
      **Tips:**
      - Simpan URL backend Anda di tempat yang aman, karena akan sering digunakan
      - Jika backend URL berubah (misal redeploy backend), update environment variables dan redeploy frontend
      - Environment variables bisa di-edit atau di-delete kapan saja dengan klik "..." di samping variable
   
   **Metode 2: Menggunakan Vercel Dashboard (Lebih Mudah untuk Pemula)**
   
   a. **Persiapkan Repository GitHub:**
      - Pastikan code Anda sudah di-push ke GitHub
      - Buat repository baru jika belum ada
      - Push semua file ke GitHub
   
   b. **Connect ke Vercel:**
      - Buka https://vercel.com
      - Klik "Sign Up" atau "Log In"
      - Pilih "Continue with GitHub"
      - Authorize Vercel untuk mengakses GitHub
   
   c. **Import Project:**
      - Klik "Add New..." → "Project"
      - Pilih repository GitHub Anda
      - Klik "Import"
   
   d. **Configure Project:**
      - **Framework Preset:** Vite (otomatis terdeteksi)
      - **Root Directory:** `client` (karena project React ada di folder client)
      - **Build Command:** `npm run build` (otomatis)
      - **Output Directory:** `dist` (otomatis)
      - **Install Command:** `npm install` (otomatis)
   
   e. **Set Environment Variables:**
      - Scroll ke bawah ke bagian "Environment Variables"
      - Klik "Add" untuk setiap variable:
        
        **Variable 1:**
        - Key: `VITE_API_URL`
        - Value: `https://your-backend-url.railway.app/api`
        - Environment: Production, Preview, Development (centang semua)
        
        **Variable 2:**
        - Key: `VITE_SOCKET_URL`
        - Value: `https://your-backend-url.railway.app`
        - Environment: Production, Preview, Development (centang semua)
   
   f. **Deploy:**
      - Klik "Deploy"
      - Tunggu proses build selesai (biasanya 1-2 menit)
      - Setelah selesai, klik "Visit" untuk melihat website Anda
   
   **Catatan Penting:**
   - URL backend harus sudah di-deploy terlebih dahulu sebelum deploy frontend
   - Environment variables harus di-set SEBELUM atau SETELAH deploy pertama (jika setelah, perlu redeploy)
   - Vercel akan otomatis rebuild setiap kali Anda push ke GitHub (jika menggunakan metode 2)
   - URL production akan seperti: `https://sitsense-client.vercel.app`
   - Anda bisa set custom domain di Settings → Domains

3. **Deploy to Netlify**
   - Install Netlify CLI: `npm i -g netlify-cli`
   - Login: `netlify login`
   - Deploy: `netlify deploy --prod`
   - Set environment variables in Netlify dashboard

### Backend Deployment (Railway/Render/Heroku)

1. **Setup MongoDB Atlas**
   - Create account at https://www.mongodb.com/cloud/atlas
   - Create cluster
   - Get connection string
   - Whitelist your server IP

2. **Deploy to Railway**
   - Connect GitHub repository
   - Set root directory to `server`
   - Set environment variables:
     - `MONGODB_URI`: MongoDB Atlas connection string
     - `JWT_SECRET`: Random secret key
     - `GEMINI_API_KEY`: Your Gemini API key
     - `CLIENT_URL`: Frontend URL
     - `ALLOWED_ORIGINS`: Frontend URL, comma-separated

3. **Deploy to Render**
   - Create new Web Service
   - Connect repository
   - Set build command: `cd server && npm install`
   - Set start command: `cd server && node server.js`
   - Set environment variables (same as Railway)

4. **Deploy to Heroku**
   - Install Heroku CLI
   - Login: `heroku login`
   - Create app: `heroku create sitsense-backend`
   - Set environment variables: `heroku config:set KEY=value`
   - Deploy: `git push heroku main`

## Environment Variables Reference

### Backend
```env
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/sitsense
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRE=7d
CLIENT_URL=https://your-frontend.vercel.app
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://your-frontend.netlify.app
GEMINI_API_KEY=your-gemini-api-key
```

### Frontend
```env
VITE_API_URL=https://your-backend.railway.app/api
VITE_SOCKET_URL=https://your-backend.railway.app
```

## Post-Deployment Steps

1. Update ESP32 code dengan Socket.io server URL baru
2. Test API endpoints
3. Test Socket.io connection
4. Verify authentication flow
5. Test real-time data streaming

## Troubleshooting

### Vercel Deployment Issues

**Error: "Build failed" atau "Module not found"**
- Pastikan semua dependencies sudah terinstall: `cd client && npm install`
- Pastikan `package.json` sudah benar dan lengkap
- Cek log build di Vercel dashboard untuk detail error

**Error: "Environment variable not found"**
- Pastikan environment variables sudah di-set di Vercel dashboard
- Pastikan nama variable benar: `VITE_API_URL` dan `VITE_SOCKET_URL` (harus dimulai dengan `VITE_`)
- Setelah menambah variable, **redeploy** project

**Website tidak bisa connect ke backend**
- Pastikan URL backend sudah benar di environment variables
- Pastikan backend sudah di-deploy dan running
- Cek browser console untuk error CORS atau connection error
- Pastikan `ALLOWED_ORIGINS` di backend sudah include URL Vercel Anda

**Build berhasil tapi website blank/error**
- Cek browser console (F12) untuk error JavaScript
- Pastikan environment variables sudah di-set dengan benar
- Pastikan `Root Directory` di Vercel settings adalah `client`
- Cek tab "Deployments" untuk melihat log build detail

**Environment Variables tidak ter-update setelah redeploy**
- Pastikan variable di-set untuk environment yang benar (Production, Preview, Development)
- Hapus cache browser (Ctrl+Shift+R atau Cmd+Shift+R)
- Cek apakah variable benar-benar tersimpan di Vercel dashboard

### CORS Issues
- Ensure `ALLOWED_ORIGINS` includes your frontend URL
- Check Socket.io CORS configuration
- Pastikan URL di `ALLOWED_ORIGINS` menggunakan `https://` bukan `http://`

### Socket.io Connection Issues
- Verify Socket.io server URL is correct
- Check firewall/network settings
- Ensure WebSocket support on hosting platform
- Pastikan URL Socket.io menggunakan `https://` di production
- Cek apakah backend sudah support WebSocket (Socket.io)

### Database Connection Issues
- Verify MongoDB Atlas IP whitelist
- Check connection string format
- Verify database user permissions
- Pastikan IP whitelist di MongoDB Atlas sudah include IP server hosting Anda (atau set ke 0.0.0.0/0 untuk allow all)

### Contoh Environment Variables yang Benar

**Backend (Railway/Render):**
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/sitsense?retryWrites=true&w=majority
JWT_SECRET=super-secret-key-minimal-32-characters-long
CLIENT_URL=https://sitsense-client.vercel.app
ALLOWED_ORIGINS=https://sitsense-client.vercel.app
```

**Frontend (Vercel):**
```env
VITE_API_URL=https://sitsense-backend.railway.app/api
VITE_SOCKET_URL=https://sitsense-backend.railway.app
```

**Catatan:** Ganti `sitsense-client.vercel.app` dan `sitsense-backend.railway.app` dengan URL aktual Anda!

