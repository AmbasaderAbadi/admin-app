// If you decide to use Pinia later
import { defineStore } from 'pinia'

export const useBookingsStore = defineStore('bookings', {
  state: () => ({
    bookings: [],
    loading: false,
    error: null
  }),
  
  actions: {
    async fetchBookings(status = 'all') {
      this.loading = true
      this.error = null
      try {
        const response = await fetchBookings(status)
        this.bookings = response
      } catch (error) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    }
  }
})