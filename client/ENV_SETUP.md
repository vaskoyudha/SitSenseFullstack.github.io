# Environment Variables Setup

This document explains how to configure environment variables for the SitSense frontend application.

## Required Environment Variables

### VITE_API_URL
- **Description**: Backend API URL for REST API calls
- **Format**: `https://your-backend.railway.app/api`
- **Important**: Must include `/api` at the end
- **Example**: `https://sitsense-backend-production.up.railway.app/api`
- **Default (development)**: `http://localhost:5000/api`

### VITE_SOCKET_URL
- **Description**: Socket.io server URL for real-time connections
- **Format**: `https://your-backend.railway.app`
- **Important**: Do NOT include `/api` or trailing slash
- **Example**: `https://sitsense-backend-production.up.railway.app`
- **Default (development)**: `http://localhost:5000`

## Local Development Setup

1. Create a `.env` file in the `client/` directory
2. Add the following variables:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

3. Restart your development server

## Vercel Deployment Setup

1. Go to your Vercel project dashboard
2. Navigate to **Settings** > **Environment Variables**
3. Click **Add New** and add each variable:
   - **Key**: `VITE_API_URL`
   - **Value**: Your production backend URL (e.g., `https://your-backend.railway.app/api`)
   - **Environment**: Check all (Production, Preview, Development)
4. Repeat for `VITE_SOCKET_URL`
5. **Important**: After adding variables, you must **redeploy** your application for changes to take effect

## Troubleshooting

### API calls failing
- Check browser console for error messages
- Verify `VITE_API_URL` is set correctly in Vercel
- Ensure backend server is running and accessible
- Check CORS settings on backend

### Socket.io not connecting
- Check browser console for connection errors
- Verify `VITE_SOCKET_URL` is set correctly in Vercel
- Ensure Socket.io server is running on backend
- Check network tab for WebSocket connection attempts

### Environment variables not working
- Variables must start with `VITE_` to be exposed to frontend
- After adding variables in Vercel, trigger a new deployment
- Clear browser cache and hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

