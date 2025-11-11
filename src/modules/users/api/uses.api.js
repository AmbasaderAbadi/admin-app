import http from '@/core/api/http'

export const fetchCustomers = async (status = 'all') => {
  let url = '/users/customers'
  if (status !== 'all') {
    url += `?status=${status}`
  }
  const response = await http.get(url)
  return response.data || []
}

export const updateCustomerStatus = async (email, status) => {
  const response = await http.patch('/users/customers/status', { email, status })
  return response.data
}

export const deleteCustomer = async (customerId) => {
  const response = await http.delete(`/users/${encodeURIComponent(customerId)}`)
  return response.data
}

export const addCustomer = async (customerData) => {
  const response = await http.post('/users/customers', customerData)
  return response.data
}