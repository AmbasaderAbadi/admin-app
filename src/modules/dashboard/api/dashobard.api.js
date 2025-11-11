import http from '@/core/api/http'

export const fetchDashboardData = async () => {
  const [customersRes, providersRes, categoriesRes] = await Promise.all([
    http.get('/users/customers'),
    http.get('/users/providers'),
    http.get('/categories')
  ])
  
  return {
    customers: customersRes.data || [],
    providers: providersRes.data || [],
    categories: categoriesRes.data || []
  }
}