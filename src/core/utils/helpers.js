// src/core/utils/helpers.js
export const formatDate = (dateString) => {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleDateString()
}

export const formatDateTime = (dateString) => {
  if (!dateString) return '—'
  return new Date(dateString).toLocaleString()
}

export const formatNumber = (num) => {
  return new Intl.NumberFormat().format(num)
}

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validatePassword = (password) => {
  return password.length >= 6
}

export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export const isImage = (url) => {
  if (!url) return false
  const ext = url.split('.').pop()?.toLowerCase()
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)
}

export const getFileName = (url) => {
  if (!url) return 'No file'
  return url.split('/').pop() || 'Untitled'
}