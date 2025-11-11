// src/stores/auth.store.js
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('admin_token') || null,
    user: null,
    loading: false,
    error: null
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin'
  },
  
  actions: {
    setToken(token) {
      this.token = token
      localStorage.setItem('admin_token', token)
    },
    
    setUser(user) {
      this.user = user
    },
    
    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('admin_token')
    },
    
    async login(credentials) {
      this.loading = true
      this.error = null
      try {
        const response = await authApi.login(credentials)
        this.setToken(response.token)
        this.setUser(response.user)
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})