import http from '@/core/api/http'

export const fetchPayments = async (status = 'all') => {
  let url = '/payments'
  if (status !== 'all') {
    url += `?status=${status}`
  }
  const response = await http.get(url)
  return response.data || []
}

export const fetchPaymentById = async (paymentId) => {
  const response = await http.get(`/payments/${paymentId}`)
  return response.data
}

export const processRefund = async (paymentId) => {
  const response = await http.post(`/payments/${paymentId}/refund`)
  return response.data
}

export const createPayment = async (paymentData) => {
  const response = await http.post('/payments', paymentData)
  return response.data
}

export const updatePayment = async (paymentId, paymentData) => {
  const response = await http.put(`/payments/${paymentId}`, paymentData)
  return response.data
}

export const deletePayment = async (paymentId) => {
  const response = await http.delete(`/payments/${paymentId}`)
  return response.data
}