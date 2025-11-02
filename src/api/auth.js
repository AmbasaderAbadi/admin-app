// src/api/auth.js
import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:3000/infinity-booking', // ✅ use your backend base
})

// Login request
export const loginAdmin = async (email, password) => {
  try {
    const res = await API.post('/auth/login', { email, password })
    return res.data
  } catch (err) {
    console.error('Login API Error:', err.response?.data || err.message)
    throw err.response?.data || { message: 'Server error' }
  }
}

export const forgotPassword = async (email) => {
  try {
    const response = await fetch('/api/admin/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send reset email');
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
};