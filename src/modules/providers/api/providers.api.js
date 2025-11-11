import http from '@/core/api/http'

export const fetchProviders = async (status = 'all') => {
  let url = '/users/providers'
  if (status !== 'all') {
    url += `?status=${status}`
  }
  const response = await http.get(url)
  return response.data || []
}

export const fetchProviderServices = async (providerId) => {
  const response = await http.get(`/services/provider/${providerId}`)
  return response.data || []
}

export const updateProviderStatus = async (email, status) => {
  const response = await http.patch('/users/providers/status', { email, status })
  return response.data
}

export const deleteProvider = async (providerId) => {
  const response = await http.delete(`/users/${encodeURIComponent(providerId)}`)
  return response.data
}

export const addProvider = async (formData) => {
  const response = await http.post('/users/providers', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}