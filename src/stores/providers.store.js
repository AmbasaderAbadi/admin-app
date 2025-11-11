// src/stores/providers.store.js
import { defineStore } from 'pinia'
import { usersApi } from '../core/api/services'

export const useProvidersStore = defineStore('providers', {
  state: () => ({
    providers: [],
    loading: false,
    error: null
  }),
  
  getters: {
    totalProviders: (state) => state.providers.length,
    activeProviders: (state) => state.providers.filter(p => p.status === 'active'),
    pendingProviders: (state) => state.providers.filter(p => p.status === 'pending'),
    suspendedProviders: (state) => state.providers.filter(p => p.status === 'suspended')
  },
  
  actions: {
    async fetchProviders(status = 'all') {
      this.loading = true
      this.error = null
      try {
        this.providers = await usersApi.fetchProviders(status)
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async updateProviderStatus(email, newStatus) {
      try {
        const updatedProvider = await usersApi.updateProviderStatus(email, newStatus)
        const index = this.providers.findIndex(p => p.email === email)
        if (index !== -1) {
          this.providers[index].status = newStatus
        }
        return updatedProvider
      } catch (error) {
        this.error = error.message
        throw error
      }
    },
    
    async deleteProvider(id) {
      try {
        await usersApi.deleteProvider(id)
        this.providers = this.providers.filter(p => p._id !== id)
      } catch (error) {
        this.error = error.message
        throw error
      }
    }
  }
})