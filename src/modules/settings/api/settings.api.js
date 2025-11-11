import http from '@/core/api/http'

export const updateSettings = async (settingsData) => {
  const response = await http.put('/settings', settingsData)
  return response.data
}

export const fetchSettings = async () => {
  const response = await http.get('/settings')
  return response.data
}