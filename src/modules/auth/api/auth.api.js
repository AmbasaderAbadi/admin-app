import http from '@/core/api/http'

export const loginAdmin = async (email, password) => {
  const response = await http.post('/auth/login', { email, password })
  return response.data
}

export const verify2FAPin = async (email, pin, token) => {
  const response = await http.post('/auth/2fa/pin/verify', 
    { email, pin }, 
    { headers: { 'Authorization': `Bearer ${token}` } }
  )
  return response.data
}

export const forgotPassword = async (email) => {
  const response = await http.post('/auth/forgot-password/', { email })
  return response.data
}

export const resetPassword = async (token, password) => {
  const response = await http.post(`/auth/reset-password/${token}`, { password })
  return response.data
}