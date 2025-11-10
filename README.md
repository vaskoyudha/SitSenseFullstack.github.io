# SitSense - MERN Stack Application

SitSense adalah aplikasi monitoring postur duduk berbasis IoT yang dikonversi dari static website menjadi full-stack MERN application.

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS + DaisyUI
- **Backend**: Node.js + Express.js
- **Database**: MongoDB + Mongoose
- **Real-time**: Socket.io
- **Authentication**: JWT
- **AI Integration**: Google Gemini API

## Struktur Project

```
sitsense-mern/
├── client/          # React Frontend
├── server/         # Express Backend
└── deployment/     # Docker & deployment configs
```

## Setup Development

### Prerequisites

- Node.js 18+
- MongoDB (local atau MongoDB Atlas)
- npm atau yarn

### Backend Setup

1. Masuk ke folder server:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Buat file `.env`:
```bash
cp .env.example .env
```

4. Edit `.env` dengan konfigurasi Anda:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sitsense
JWT_SECRET=your-secret-key
GEMINI_API_KEY=your-gemini-api-key
```

5. Jalankan server:
```bash
npm run dev
```

Server akan berjalan di `http://localhost:5000`

### Frontend Setup

1. Masuk ke folder client:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Buat file `.env`:
```bash
cp .env.example .env
```

4. Edit `.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

5. Jalankan development server:
```bash
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

## Deployment

### Option 1: Docker Compose (Recommended untuk local/production)

1. Edit `deployment/docker-compose.yml` dan set environment variables
2. Jalankan:
```bash
docker-compose -f deployment/docker-compose.yml up -d
```

### Option 2: Separate Deployment

#### Frontend (Vercel/Netlify)

1. Build frontend:
```bash
cd client
npm run build
```

2. Deploy `dist` folder ke Vercel/Netlify
3. Set environment variables di platform:
   - `VITE_API_URL`: URL backend API
   - `VITE_SOCKET_URL`: URL Socket.io server

#### Backend (Railway/Render/Heroku)

1. Setup MongoDB Atlas
2. Deploy server folder
3. Set environment variables:
   - `MONGODB_URI`: MongoDB Atlas connection string
   - `JWT_SECRET`: Secret key untuk JWT
   - `GEMINI_API_KEY`: Gemini API key
   - `CLIENT_URL`: Frontend URL
   - `ALLOWED_ORIGINS`: Comma-separated allowed origins

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Devices
- `GET /api/devices` - Get all devices
- `POST /api/devices` - Create device
- `GET /api/devices/:id` - Get device
- `PUT /api/devices/:id` - Update device
- `DELETE /api/devices/:id` - Delete device

### Sessions
- `GET /api/sessions` - Get all sessions
- `POST /api/sessions` - Create session
- `GET /api/sessions/:id` - Get session
- `PUT /api/sessions/:id/end` - End session

### History
- `GET /api/history` - Get history
- `GET /api/history/stats/daily` - Get daily stats

### Settings
- `GET /api/settings` - Get settings
- `PUT /api/settings` - Update settings

### AI
- `POST /api/ai/advice` - Get AI advice

## Socket.io Events

### Client → Server
- `device:register` - Register ESP32 device
- `posture:data` - Send posture data from ESP32
- `device:info` - Update device info
- `user:join` - Join user room

### Server → Client
- `device:registered` - Device registration confirmed
- `posture:update` - Real-time posture data update
- `device:connected` - Device connected
- `device:disconnected` - Device disconnected
- `device:info:update` - Device info updated

## ESP32 Integration

ESP32 perlu dikonfigurasi untuk connect ke Socket.io server:

1. Install Socket.io client library di ESP32
2. Connect ke server: `socket.connect("http://your-server:5000")`
3. Register device: `socket.emit("device:register", { deviceId: "...", metadata: {...} })`
4. Send data: `socket.emit("posture:data", { deviceId: "...", fsr: ..., ultrasonic: {...} })`

## Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret key
- `JWT_EXPIRE` - JWT expiration (default: 7d)
- `CLIENT_URL` - Frontend URL
- `ALLOWED_ORIGINS` - Comma-separated allowed origins
- `GEMINI_API_KEY` - Google Gemini API key

### Frontend (.env)
- `VITE_API_URL` - Backend API URL
- `VITE_SOCKET_URL` - Socket.io server URL

## License

MIT

## Author

SitSense Project Team
