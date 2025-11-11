// src/core/api/services.js
import http from './http'

export const dashboardApi = {
  fetchDashboardData: async (period = 'today') => {
    const response = await http.get(`/dashboard/stats?period=${period}`)
    return response.data
  }
}

export const usersApi = {
  // Customers
  fetchCustomers: async (status = 'all') => {
    let url = '/users/customers'
    if (status !== 'all') {
      url += `?status=${status}`
    }
    const response = await http.get(url)
    return response.data
  },
  
  updateCustomerStatus: async (email, status) => {
    const response = await http.patch('/users/customers/status', { email, status })
    return response.data
  },
  
  deleteCustomer: async (id) => {
    const response = await http.delete(`/users/${encodeURIComponent(id)}`)
    return response.data
  },

  // Providers
  fetchProviders: async (status = 'all') => {
    let url = '/users/providers'
    if (status !== 'all') {
      url += `?status=${status}`
    }
    const response = await http.get(url)
    return response.data
  },
  
  updateProviderStatus: async (email, status) => {
    const response = await http.patch('/users/providers/status', { email, status })
    return response.data
  },
  
  deleteProvider: async (id) => {
    const response = await http.delete(`/users/${encodeURIComponent(id)}`)
    return response.data
  }
}

export const servicesApi = {
  fetchCategories: async () => {
    const response = await http.get('/categories')
    return response.data
  },
  
  fetchSubCategories: async (categoryId) => {
    const response = await http.get(`/categories/${categoryId}/subcategories`)
    return response.data
  },
  
  addCategory: async (data) => {
    const response = await http.post('/categories', data)
    return response.data
  },
  
  updateCategory: async (id, data) => {
    const response = await http.put(`/categories/${id}`, data)
    return response.data
  },
  
  deleteCategory: async (id) => {
    const response = await http.delete(`/categories/${id}`)
    return response.data
  },
  
  addSubCategory: async (categoryId, data) => {
    const response = await http.post(`/categories/${categoryId}/subcategories`, data)
    return response.data
  },
  
  updateSubCategory: async (subCategoryId, data) => {
    const response = await http.put(`/categories/subcategories/${subCategoryId}`, data)
    return response.data
  },
  
  deleteSubCategory: async (subCategoryId) => {
    const response = await http.delete(`/categories/subcategories/${subCategoryId}`)
    return response.data
  }
}

export const bookingsApi = {
  fetchBookings: async (status = 'all') => {
    let url = '/bookings'
    if (status !== 'all') {
      url += `?status=${status}`
    }
    const response = await http.get(url)
    return response.data
  },
  
  updateBookingStatus: async (bookingId, status) => {
    const response = await http.patch(`/bookings/${bookingId}/status`, { status })
    return response.data
  },
  
  deleteBooking: async (bookingId) => {
    const response = await http.delete(`/bookings/${bookingId}`)
    return response.data
  }
}

export const authApi = {
  login: async (credentials) => {
    const response = await http.post('/auth/login', credentials)
    return response.data
  },
  
  forgotPassword: async (email) => {
    const response = await http.post('/auth/forgot-password', { email })
    return response.data
  },
  
  resetPassword: async (token, password) => {
    const response = await http.post(`/auth/reset-password/${token}`, { password })
    return response.data
  }
}