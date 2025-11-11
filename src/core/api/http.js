import axios from 'axios'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://infinity-booking-backend1.onrender.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Auth interceptor
http.interceptors.request.use(config => {
  const token = localStorage.getItem('admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default http