// src/api/http.js
import axios from 'axios';

const http = axios.create({
  baseURL: 'https://infinity-booking-backend1.onrender.com/infinity-booking', // ✅ Removed accidental extra space
  headers: { 'Content-Type': 'application/json' },
});

// ✅ Attach token for authenticated requests
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Unified error handling for clean debugging
http.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error.response?.data || { message: 'Server error' });
  }
);

export default http;
