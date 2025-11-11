// Pinia store for payments (optional - you can use it later if needed)
import { defineStore } from 'pinia'
import * as paymentsApi from '../api/payments.api'

export const usePaymentsStore = defineStore('payments', {
  state: () => ({
    payments: [],
    loading: false,
    error: null
  }),
  
  getters: {
    completedPayments: (state) => {
      return state.payments.filter(p => p.status === 'completed')
    },
    pendingPayments: (state) => {
      return state.payments.filter(p => p.status === 'pending')
    },
    totalRevenue: (state) => {
      return state.payments
        .filter(p => p.status === 'completed')
        .reduce((sum, payment) => sum + (payment.amount || 0), 0)
    }
  },
  
  actions: {
    async fetchPayments(status = 'all') {
      this.loading = true
      this.error = null
      try {
        this.payments = await paymentsApi.fetchPayments(status)
      } catch (error) {
        this.error = error.message
        console.error('Error fetching payments:', error)
      } finally {
        this.loading = false
      }
    },
    
    async fetchPaymentById(paymentId) {
      try {
        const payment = await paymentsApi.fetchPaymentById(paymentId)
        // Update or add to payments array
        const index = this.payments.findIndex(p => p._id === paymentId)
        if (index !== -1) {
          this.payments[index] = payment
        } else {
          this.payments.push(payment)
        }
        return payment
      } catch (error) {
        this.error = error.message
        throw error
      }
    },
    
    async processRefund(paymentId) {
      try {
        const refundedPayment = await paymentsApi.processRefund(paymentId)
        // Update payment in store
        const index = this.payments.findIndex(p => p._id === paymentId)
        if (index !== -1) {
          this.payments[index] = refundedPayment
        }
        return refundedPayment
      } catch (error) {
        this.error = error.message
        throw error
      }
    }
  }
})