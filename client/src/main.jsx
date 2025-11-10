import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Environment variable validation
const checkEnvironmentVariables = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const socketUrl = import.meta.env.VITE_SOCKET_URL;
  const isDevelopment = import.meta.env.DEV;
  const isProduction = import.meta.env.PROD;

  if (isProduction) {
    if (!apiUrl || apiUrl === 'http://localhost:5000/api') {
      console.error(
        '%c⚠️ VITE_API_URL is missing or using default localhost value!',
        'color: red; font-weight: bold; font-size: 14px;'
      );
      console.error(
        'Please set VITE_API_URL in Vercel environment variables to your production backend URL.'
      );
    }

    if (!socketUrl || socketUrl === 'http://localhost:5000') {
      console.error(
        '%c⚠️ VITE_SOCKET_URL is missing or using default localhost value!',
        'color: red; font-weight: bold; font-size: 14px;'
      );
      console.error(
        'Please set VITE_SOCKET_URL in Vercel environment variables to your production Socket.io server URL.'
      );
    }
  }

  if (isDevelopment) {
    if (!apiUrl) {
      console.warn(
        '%c⚠️ VITE_API_URL not set, using default: http://localhost:5000/api',
        'color: orange; font-weight: bold;'
      );
    } else {
      console.log('✅ VITE_API_URL:', apiUrl);
    }

    if (!socketUrl) {
      console.warn(
        '%c⚠️ VITE_SOCKET_URL not set, using default: http://localhost:5000',
        'color: orange; font-weight: bold;'
      );
    } else {
      console.log('✅ VITE_SOCKET_URL:', socketUrl);
    }
  }
};

// Run validation before rendering
checkEnvironmentVariables();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

