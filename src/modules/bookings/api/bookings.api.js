import http from '@/core/api/http'

export const fetchBookings = async (status = 'all') => {
  let url = '/bookings'
  if (status !== 'all') {
    url += `?status=${status}`
  }
  const response = await http.get(url)
  return response.data || []
}

export const fetchBookingById = async (bookingId) => {
  const response = await http.get(`/bookings/${bookingId}`)
  return response.data
}

export const updateBookingStatus = async (bookingId, status) => {
  const response = await http.patch(`/bookings/${bookingId}/status`, { status })
  return response.data
}

export const deleteBooking = async (bookingId) => {
  const response = await http.delete(`/bookings/${bookingId}`)
  return response.data
}

export const createBooking = async (bookingData) => {
  const response = await http.post('/bookings', bookingData)
  return response.data
}

export const updateBooking = async (bookingId, bookingData) => {
  const response = await http.put(`/bookings/${bookingId}`, bookingData)
  return response.data
}