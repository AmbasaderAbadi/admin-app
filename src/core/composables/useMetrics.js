// src/core/composables/useMetrics.js
import { ref, computed } from 'vue'

export function useMetrics(users, period = 'today') {
  const selectedPeriod = ref(period)
  
  const timePeriods = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'this-week' },
    { label: 'This Month', value: 'this-month' }
  ]
  
  const getDateRange = (period) => {
    const now = new Date()
    let startDate = new Date()
    
    if (period === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    } else if (period === 'this-week') {
      const day = now.getDay()
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day)
    } else if (period === 'this-month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }
    
    return startDate
  }
  
  const getPreviousPeriodRange = (period) => {
    const now = new Date()
    let startDate = new Date()
    
    if (period === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)
    } else if (period === 'this-week') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() - 7)
    } else if (period === 'this-month') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    }
    
    return startDate
  }
  
  const countInPeriod = (users, periodStart) => {
    return users.filter(user => {
      const createdAt = user.createdAt ? new Date(user.createdAt) : null
      return createdAt && createdAt >= periodStart
    })
  }
  
  const getStatusCount = (users, status) => {
    return users.filter(user => 
      (user.status || '').toLowerCase() === status.toLowerCase()
    ).length
  }
  
  const calculateMetrics = (allUsers) => {
    const currentStart = getDateRange(selectedPeriod.value)
    const prevStart = getPreviousPeriodRange(selectedPeriod.value)
    
    const currentNewUsers = countInPeriod(allUsers, currentStart)
    const prevNewUsers = countInPeriod(allUsers, prevStart)
    
    const newActiveUsers = currentNewUsers.filter(u => u.status === 'active').length
    const newSuspendedUsers = currentNewUsers.filter(u => u.status === 'suspended').length
    
    const calcChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return Math.round(((current - previous) / previous) * 100)
    }
    
    return {
      timeBased: [
        { 
          title: 'New Users', 
          value: formatNumber(currentNewUsers.length), 
          change: calcChange(currentNewUsers.length, prevNewUsers.length), 
          icon: '👤+',
          route: '/users',
          statusFilter: 'all'
        },
        { 
          title: 'New Active Users', 
          value: formatNumber(newActiveUsers), 
          change: 0, 
          icon: '✅',
          route: '/users',
          statusFilter: 'active'
        },
        { 
          title: 'New Suspended Users', 
          value: formatNumber(newSuspendedUsers), 
          change: 0, 
          icon: '⛔',
          route: '/users',
          statusFilter: 'suspended'
        }
      ],
      total: {
        total: allUsers.length,
        active: getStatusCount(allUsers, 'active'),
        inactive: getStatusCount(allUsers, 'inactive'),
        suspended: getStatusCount(allUsers, 'suspended'),
        pending: getStatusCount(allUsers, 'pending')
      }
    }
  }
  
  return {
    selectedPeriod,
    timePeriods,
    calculateMetrics
  }
}