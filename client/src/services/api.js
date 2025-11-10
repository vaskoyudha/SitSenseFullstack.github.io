import axios from 'axios';

// Validate and get API URL
const getApiUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const isProduction = import.meta.env.PROD;
  
  // Validate URL format
  if (isProduction && (apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1'))) {
    console.error(
      '%c⚠️ API Configuration Error',
      'color: red; font-weight: bold; font-size: 14px;'
    );
    console.error('VITE_API_URL is pointing to localhost in production!');
    console.error('Current API_URL:', apiUrl);
    console.error('Please set VITE_API_URL in Vercel environment variables.');
  } else {
    console.log('🔗 API Base URL:', apiUrl);
  }
  
  return apiUrl;
};

const API_URL = getApiUrl();

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Handle responses and errors
api.interceptors.response.use(
  (response) => {
    // Log successful response in development
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.status);
    }
    return response;
  },
  (error) => {
    // Enhanced error handling
    if (error.response) {
      // Server responded with error status
      console.error('❌ API Error Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.config?.url,
        data: error.response.data,
      });
      
      if (error.response.status === 401) {
        // Unauthorized - clear auth and redirect
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else if (error.response.status >= 500) {
        // Server error
        console.error('🔴 Server Error - Backend may be down or experiencing issues');
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('❌ Network Error - No response from server:', {
        url: error.config?.url,
        message: error.message,
      });
      console.error('💡 Check if backend is running and VITE_API_URL is correct:', API_URL);
    } else {
      // Error setting up request
      console.error('❌ Request Setup Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;

