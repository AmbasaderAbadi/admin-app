<template>
  <div class="payments-container">
    <!-- Header -->
    <div class="header">
      <h1>Payments</h1>
    </div>

    <!-- Search Bar -->
    <div class="search-bar">
      <input 
        v-model="searchQuery"
        type="text" 
        placeholder="Search by customer, provider, or amount..."
        @input="applyFilters"
      />
    </div>

    <!-- Status Filter Buttons -->
    <div class="filter-buttons">
      <button
        :class="['filter-button', { active: selectedStatus === 'all' }]"
        @click="applyFilter('all')"
      >
        All
      </button>
      <button
        :class="['filter-button', { active: selectedStatus === 'completed' }]"
        @click="applyFilter('completed')"
      >
        Completed
      </button>
      <button
        :class="['filter-button', { active: selectedStatus === 'pending' }]"
        @click="applyFilter('pending')"
      >
        Pending
      </button>
      <button
        :class="['filter-button', { active: selectedStatus === 'failed' }]"
        @click="applyFilter('failed')"
      >
        Failed
      </button>
      <button
        :class="['filter-button', { active: selectedStatus === 'refunded' }]"
        @click="applyFilter('refunded')"
      >
        Refunded
      </button>
    </div>

    <!-- Sort Controls -->
    <div class="sort-controls">
      <label>Sort by: </label>
      <select v-model="sortBy" @change="sortPayments">
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
      </select>
    </div>

    <!-- Loading & Error States -->
    <div v-if="loading" class="status-message">Loading payments...</div>
    <div v-else-if="error" class="status-message error">{{ error }}</div>

    <!-- Payments List -->
    <div v-else class="payments-list">
      <div 
        v-for="(payment, index) in displayedPayments" 
        :key="payment._id" 
        class="payment-card"
        @click="viewDetails(payment)"
      >
        <div class="payment-info">
          <div class="payment-amount">${{ payment.amount || '0.00' }}</div>
          <div class="payment-customer">{{ payment.customer?.fullname || '—' }}</div>
          <div class="payment-provider">{{ payment.provider?.fullname || '—' }}</div>
          <div class="payment-date">
            {{ formatDate(payment.createdAt) }}
          </div>
        </div>
        
        <div class="payment-status-container">
          <span :class="['payment-status', getNormalizedStatus(payment.status)]">
            {{ getDisplayStatus(payment.status) }}
          </span>
        </div>

        <!-- Three-dot menu -->
        <div class="payment-actions" @click.stop>
          <button class="more-options" @click="toggleMenu(index)">
            ⋮
          </button>
          
          <div 
            v-if="openMenuIndex === index" 
            class="dropdown-menu"
            @click.stop
          >
            <button
              v-if="isRefundable(payment.status)"
              @click="confirmRefund(payment)"
            >
              Refund
            </button>
            <button
              class="delete-btn"
              @click="deletePayment(payment)"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <div v-if="displayedPayments.length === 0" class="no-results">
        No payments found
      </div>
    </div>

    <!-- Payment Detail Modal -->
    <div v-if="selectedPayment" class="modal-overlay" @click="closeDetailModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Payment Details</h2>
          <button class="close-btn" @click="closeDetailModal">×</button>
        </div>

        <div class="detail-body">
          <!-- Basic Info -->
          <div class="section">
            <h3>📋 Payment Information</h3>
            <div class="detail-row">
              <span class="label">Transaction ID:</span>
              <span class="value">{{ selectedPayment._id || '—' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Amount:</span>
              <span class="value">${{ selectedPayment.amount || '0.00' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Status:</span>
              <span :class="['status-badge', getNormalizedStatus(selectedPayment.status)]">
                {{ getDisplayStatus(selectedPayment.status) }}
              </span>
            </div>
            <div class="detail-row">
              <span class="label">Method:</span>
              <span class="value">{{ selectedPayment.method || '—' }}</span>
            </div>
          </div>

          <!-- Customer Info -->
          <div class="section">
            <h3>👤 Customer Details</h3>
            <div class="detail-row">
              <span class="label">Name:</span>
              <span class="value">{{ selectedPayment.customer?.fullname || '—' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Email:</span>
              <span class="value">{{ selectedPayment.customer?.email || '—' }}</span>
            </div>
          </div>

          <!-- Provider Info -->
          <div class="section">
            <h3>🔧 Provider Details</h3>
            <div class="detail-row">
              <span class="label">Name:</span>
              <span class="value">{{ selectedPayment.provider?.fullname || '—' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Service:</span>
              <span class="value">{{ selectedPayment.serviceName || '—' }}</span>
            </div>
          </div>

          <!-- Booking Info -->
          <div class="section" v-if="selectedPayment.booking">
            <h3>📅 Related Booking</h3>
            <div class="detail-row">
              <span class="label">Booking ID:</span>
              <span class="value">{{ selectedPayment.booking._id || '—' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Date:</span>
              <span class="value">{{ formatDate(selectedPayment.booking.bookingDate) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Time:</span>
              <span class="value">{{ selectedPayment.booking.startTime || '—' }} - {{ selectedPayment.booking.endTime || '—' }}</span>
            </div>
          </div>

          <!-- Timestamps -->
          <div class="section">
            <h3>📊 Timeline</h3>
            <div class="detail-row">
              <span class="label">Created:</span>
              <span class="value">{{ formatDate(selectedPayment.createdAt) }}</span>
            </div>
            <div v-if="selectedPayment.completedAt" class="detail-row">
              <span class="label">Completed:</span>
              <span class="value">{{ formatDate(selectedPayment.completedAt) }}</span>
            </div>
            <div v-if="selectedPayment.refundedAt" class="detail-row">
              <span class="label">Refunded:</span>
              <span class="value">{{ formatDate(selectedPayment.refundedAt) }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeDetailModal">Close</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Refund Confirmation Modal -->
    <div v-if="refundConfirm" class="modal-overlay" @click="cancelRefund">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Refund Payment</h2>
          <button class="close-btn" @click="cancelRefund">×</button>
        </div>

        <div class="modal-body">
          <p>Are you sure you want to refund ${{ refundConfirm.amount }} to {{ refundConfirm.customer?.fullname || 'customer' }}?</p>
          <p class="warning-text">This action cannot be undone.</p>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="cancelRefund">Cancel</button>
          <button class="btn btn-danger" @click="performRefund">Refund Payment</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import http from '../../../core/api/http';
import { formatDate } from '../../../core/utils/helpers';

const payments = ref([]);
const searchQuery = ref('');
const selectedStatus = ref('all');
const sortBy = ref('newest');
const loading = ref(false);
const error = ref('');
const openMenuIndex = ref(null);
const selectedPayment = ref(null);
const refundConfirm = ref(null);

const route = useRoute();
const router = useRouter();

onMounted(() => {
  const urlStatus = route.query.status;
  if (urlStatus && ['all', 'completed', 'pending', 'failed', 'refunded'].includes(urlStatus)) {
    selectedStatus.value = urlStatus;
  }
  
  fetchPayments();
});

const fetchPayments = async () => {
  loading.value = true;
  error.value = '';
  try {
    let url = '/payments';
    if (selectedStatus.value !== 'all') {
      url += `?status=${selectedStatus.value}`;
    }

    const res = await http.get(url);
    payments.value = Array.isArray(res.data) ? res.data : [];
  } catch (err) {
    console.error('Failed to fetch payments:', err);
    error.value = 'Failed to load payments. Please try again later.';
    payments.value = [];
  } finally {
    loading.value = false;
  }
};

const applyFilter = (status) => {
  router.push({
    query: { ...route.query, status: status === 'all' ? undefined : status }
  });
  selectedStatus.value = status;
  fetchPayments();
};

const displayedPayments = computed(() => {
  let filtered = [...payments.value];
  
  if (searchQuery.value.trim()) {
    const term = searchQuery.value.toLowerCase().trim();
    filtered = filtered.filter(payment => 
      String(payment.amount).includes(term) ||
      (payment.customer?.fullname?.toLowerCase().includes(term)) ||
      (payment.provider?.fullname?.toLowerCase().includes(term)) ||
      (payment.transactionId?.toLowerCase().includes(term))
    );
  }
  
  if (sortBy.value === 'newest') {
    filtered = filtered.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return dateB - dateA;
    });
  } else {
    filtered = filtered.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return dateA - dateB;
    });
  }
  
  return filtered;
});

const toggleMenu = (index) => {
  openMenuIndex.value = openMenuIndex.value === index ? null : index;
};

const getNormalizedStatus = (status) => {
  const s = (status || '').toLowerCase().trim();
  if (['completed', 'paid', 'succeeded'].includes(s)) return 'completed';
  if (['pending', 'processing', 'awaiting'].includes(s)) return 'pending';
  if (['failed', 'error', 'declined'].includes(s)) return 'failed';
  if (['refunded', 'reversed'].includes(s)) return 'refunded';
  return 'unknown';
};

const getDisplayStatus = (status) => {
  const s = (status || '').toLowerCase().trim();
  if (['completed', 'paid', 'succeeded'].includes(s)) return 'Completed';
  if (['pending', 'processing', 'awaiting'].includes(s)) return 'Pending';
  if (['failed', 'error', 'declined'].includes(s)) return 'Failed';
  if (['refunded', 'reversed'].includes(s)) return 'Refunded';
  return 'Unknown';
};

const isRefundable = (status) => {
  return ['completed'].includes(getNormalizedStatus(status));
};

const confirmRefund = (payment) => {
  refundConfirm.value = payment;
};

const performRefund = async () => {
  if (!refundConfirm.value) return;
  
  try {
    await http.post(`/payments/${refundConfirm.value._id}/refund`);
    
    // Update payment status in local list
    const index = payments.value.findIndex(p => p._id === refundConfirm.value._id);
    if (index !== -1) {
      payments.value[index].status = 'refunded';
    }
    
    cancelRefund();
    alert('Payment refunded successfully!');
  } catch (err) {
    console.error('Refund failed:', err);
    alert(err.response?.data?.message || 'Failed to process refund. Please try again.');
  }
};

const deletePayment = async (payment) => {
  if (!confirm(`Delete payment for $${payment.amount}?`)) return;

  try {
    await http.delete(`/payments/${payment._id}`);
    payments.value = payments.value.filter(p => p._id !== payment._id);
    openMenuIndex.value = null;
    if (selectedPayment.value?._id === payment._id) {
      selectedPayment.value = null;
    }
    alert('Payment deleted successfully!');
  } catch (err) {
    console.error('Delete failed:', err);
    alert(err.response?.data?.message || 'Failed to delete payment.');
  }
};

const viewDetails = (payment) => {
  selectedPayment.value = payment;
};

const closeDetailModal = () => {
  selectedPayment.value = null;
};

const cancelRefund = () => {
  refundConfirm.value = null;
};

const sortPayments = () => {
  // Recompute via computed property
};
</script>

<style scoped>
/* ... your existing payment styles ... */
.payments-container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  padding: 16px;
  background-color: #f5f7fa;
  min-height: 100vh;
  max-width: 100%;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e5ff;
}

.header h1 {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

.search-bar {
  position: relative;
  margin-bottom: 20px;
}

.search-bar input {
  width: 100%;
  padding: 12px 20px;
  border-radius: 8px;
  border: 1px solid #e0e5ff;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;
}

.search-bar input:focus {
  border-color: #5a6cff;
}

.filter-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-button {
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid #e0e5ff;
  background-color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.filter-button.active {
  background-color: #4285f4;
  color: white;
  border-color: #4285f4;
}

.sort-controls {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 8px;
}

.sort-controls label {
  font-weight: 500;
  color: #333;
}

.sort-controls select {
  padding: 6px 12px;
  border: 1px solid #e0e5ff;
  border-radius: 6px;
  background: white;
  font-size: 14px;
  cursor: pointer;
}

.status-message {
  text-align: center;
  padding: 20px;
  color: #666;
}

.status-message.error {
  color: #ff5252;
}

.payments-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.payment-card {
  background-color: white;
  border-radius: 12px;
  padding: 15px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  position: relative;
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.payment-card:hover {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.payment-info {
  flex-grow: 1;
  min-width: 0;
  overflow: hidden;
}

.payment-amount {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 2px;
}

.payment-customer {
  font-size: 14px;
  color: #666;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.payment-provider {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.payment-date {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}

.payment-status-container {
  margin: 0 30px 0 12px;
  flex-shrink: 0;
}

.payment-status {
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 12px;
  display: inline-block;
}

.payment-status.completed {
  color: #00c853;
  background-color: #e8f5e8;
}

.payment-status.pending {
  color: #ff9800;
  background-color: #fff3e0;
}

.payment-status.failed {
  color: #ff5252;
  background-color: #ffebee;
}

.payment-status.refunded {
  color: #9c27b0;
  background-color: #f3e5f5;
}

.payment-status.unknown {
  color: #666;
  background-color: #f0f0f0;
}

.payment-actions {
  position: absolute;
  top: 10px;
  right: 10px;
}

.more-options {
  background: none;
  border: none;
  font-size: 20px;
  color: #999;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.more-options:hover {
  background-color: #f0f0f0;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 28px;
  background: white;
  border: 1px solid #e0e5ff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1000;
  min-width: 130px;
  overflow: hidden;
}

.dropdown-menu button {
  display: block;
  width: 100%;
  padding: 10px 16px;
  text-align: left;
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  color: #333;
}

.dropdown-menu button:hover {
  background-color: #f5f7fa;
}

.dropdown-menu .delete-btn {
  color: #ff5252;
}

.dropdown-menu .delete-btn:hover {
  background-color: #ffebee;
}

.no-results {
  text-align: center;
  color: #888;
  padding: 20px;
  font-style: italic;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 92%;
  max-width: 600px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e5ff;
}

.modal-header h2 {
  font-size: 20px;
  font-weight: bold;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.close-btn:hover {
  color: #333;
}

.detail-body {
  padding: 20px;
  font-size: 14px;
  line-height: 1.6;
}

.section {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-row {
  display: flex;
  margin-bottom: 12px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 8px;
  align-items: flex-start;
}

.label {
  font-weight: 500;
  color: #333;
  min-width: 120px;
  display: block;
}

.value {
  flex-grow: 1;
  color: #555;
}

.status-badge {
  font-size: 12px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 12px;
  display: inline-block;
}

.status-badge.completed {
  color: #00c853;
  background-color: #e8f5e8;
}

.status-badge.pending {
  color: #ff9800;
  background-color: #fff3e0;
}

.status-badge.failed {
  color: #ff5252;
  background-color: #ffebee;
}

.status-badge.refunded {
  color: #9c27b0;
  background-color: #f3e5f5;
}

.status-badge.unknown {
  color: #666;
  background-color: #f0f0f0;
}

.modal-body {
  padding: 20px;
  font-size: 16px;
}

.warning-text {
  color: #ff5252;
  font-weight: 500;
  margin-top: 10px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #e0e5ff;
  margin-top: 10px;
}

.btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-secondary {
  background: #eee;
  border: none;
  color: #333;
}

.btn-secondary:hover {
  background: #ddd;
}

.btn-danger {
  background: #ff5252;
  color: white;
  border: none;
}

.btn-danger:hover {
  background: #ff3333;
}

/* Responsive */
@media (max-width: 768px) {
  .header h1 {
    font-size: 20px;
  }

  .payment-card {
    padding: 12px;
  }

  .payment-amount {
    font-size: 16px;
  }

  .payment-status-container {
    margin: 0 28px 0 10px;
  }

  .payment-info {
    width: 100%;
    margin-right: 0;
  }

  .payment-status-container {
    margin: 0 0 12px 0;
    align-self: flex-start;
  }

  .payment-actions {
    position: static;
    align-self: flex-end;
  }

  .modal-content {
    width: 95%;
    max-width: 100%;
    margin: 10px;
  }
}
</style>