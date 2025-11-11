<template>
  <div class="bookings-container">
    <!-- Header -->
    <div class="header">
      <h1>Bookings</h1>
      <button class="add-btn" @click="showAddModal = true">
        <span>+</span> Add New Booking
      </button>
    </div>

    <!-- Search Bar -->
    <div class="search-bar">
      <input 
        v-model="searchQuery"
        type="text" 
        placeholder="Search by customer, provider, or service..."
        @input="filterBookings"
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
        :class="['filter-button', { active: selectedStatus === 'confirmed' }]"
        @click="applyFilter('confirmed')"
      >
        Confirmed
      </button>
      <button
        :class="['filter-button', { active: selectedStatus === 'pending' }]"
        @click="applyFilter('pending')"
      >
        Pending
      </button>
      <button
        :class="['filter-button', { active: selectedStatus === 'cancelled' }]"
        @click="applyFilter('cancelled')"
      >
        Cancelled
      </button>
      <button
        :class="['filter-button', { active: selectedStatus === 'completed' }]"
        @click="applyFilter('completed')"
      >
        Completed
      </button>
    </div>

    <!-- Sort Controls -->
    <div class="sort-controls">
      <label>Sort by: </label>
      <select v-model="sortBy" @change="sortBookings">
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
      </select>
    </div>

    <!-- Loading & Error States -->
    <div v-if="loading" class="status-message">Loading bookings...</div>
    <div v-else-if="error" class="status-message error">{{ error }}</div>

    <!-- Bookings List -->
    <div v-else class="bookings-list">
      <div 
        v-for="(booking, index) in displayedBookings" 
        :key="booking._id" 
        class="booking-card"
        @click="viewDetails(booking)"
      >
        <div class="booking-avatar">
          <img 
            v-if="booking.customer?.avatar" 
            :src="booking.customer.avatar" 
            :alt="booking.customer.fullname"
          />
          <div v-else class="avatar-placeholder">
            {{ booking.customer?.fullname?.charAt(0)?.toUpperCase() || '?' }}
          </div>
        </div>
        
        <div class="booking-info">
          <div class="booking-customer">{{ booking.customer?.fullname || '—' }}</div>
          <div class="booking-provider">{{ booking.provider?.fullname || '—' }}</div>
          <div class="booking-service">{{ booking.serviceName || '—' }}</div>
          <div class="booking-date">
            {{ formatDate(booking.bookingDate) }} at {{ formatTime(booking.startTime) }} - {{ formatTime(booking.endTime) }}
          </div>
        </div>
        
        <div class="booking-status-container">
          <span :class="['booking-status', getNormalizedStatus(booking.status)]">
            {{ getDisplayStatus(booking.status) }}
          </span>
        </div>

        <!-- Three-dot menu -->
        <div class="booking-actions" @click.stop>
          <button class="more-options" @click="toggleMenu(index)">
            ⋮
          </button>
          
          <div 
            v-if="openMenuIndex === index" 
            class="dropdown-menu"
            @click.stop
          >
            <button
              v-if="isConfirmable(booking.status)"
              @click="updateStatus(booking, 'confirmed')"
            >
              Confirm
            </button>
            <button
              v-if="isCancellable(booking.status)"
              @click="updateStatus(booking, 'cancelled')"
            >
              Cancel
            </button>
            <button
              v-if="isCompletable(booking.status)"
              @click="updateStatus(booking, 'completed')"
            >
              Complete
            </button>
            <button
              class="delete-btn"
              @click="confirmDelete(booking)"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <div v-if="displayedBookings.length === 0" class="no-results">
        No bookings found
      </div>
    </div>

    <!-- Booking Detail Modal -->
    <div v-if="selectedBooking" class="modal-overlay" @click="closeDetailModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Booking Details</h2>
          <button class="close-btn" @click="closeDetailModal">×</button>
        </div>

        <div class="detail-body">
          <!-- Basic Info -->
          <div class="section">
            <h3>📅 Booking Information</h3>
            <div class="detail-row">
              <span class="label">Booking ID:</span>
              <span class="value">{{ selectedBooking._id || '—' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Service:</span>
              <span class="value">{{ selectedBooking.serviceName || '—' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Category:</span>
              <span class="value">{{ selectedBooking.categoryName || '—' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Sub-Category:</span>
              <span class="value">{{ selectedBooking.subCategoryName || '—' }}</span>
            </div>
          </div>

          <!-- Customer Info -->
          <div class="section">
            <h3>👤 Customer Details</h3>
            <div class="detail-row">
              <span class="label">Name:</span>
              <span class="value">{{ selectedBooking.customer?.fullname || '—' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Email:</span>
              <span class="value">{{ selectedBooking.customer?.email || '—' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Phone:</span>
              <span class="value">{{ selectedBooking.customer?.phonenumber || '—' }}</span>
            </div>
          </div>

          <!-- Provider Info -->
          <div class="section">
            <h3>🔧 Provider Details</h3>
            <div class="detail-row">
              <span class="label">Name:</span>
              <span class="value">{{ selectedBooking.provider?.fullname || '—' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Email:</span>
              <span class="value">{{ selectedBooking.provider?.email || '—' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Service:</span>
              <span class="value">{{ selectedBooking.serviceName || '—' }}</span>
            </div>
          </div>

          <!-- Schedule Info -->
          <div class="section">
            <h3>⏰ Schedule</h3>
            <div class="detail-row">
              <span class="label">Date:</span>
              <span class="value">{{ formatDate(selectedBooking.bookingDate) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Start Time:</span>
              <span class="value">{{ formatTime(selectedBooking.startTime) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">End Time:</span>
              <span class="value">{{ formatTime(selectedBooking.endTime) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Duration:</span>
              <span class="value">{{ selectedBooking.duration || '—' }} mins</span>
            </div>
          </div>

          <!-- Payment Info -->
          <div class="section" v-if="selectedBooking.payment">
            <h3>💳 Payment Information</h3>
            <div class="detail-row">
              <span class="label">Amount:</span>
              <span class="value">${{ selectedBooking.payment.amount || '0.00' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Method:</span>
              <span class="value">{{ selectedBooking.payment.method || '—' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Status:</span>
              <span class="value">{{ selectedBooking.payment.status || '—' }}</span>
            </div>
          </div>

          <!-- Status & Metadata -->
          <div class="section">
            <h3>📊 Status & Activity</h3>
            <div class="detail-row">
              <span class="label">Status:</span>
              <span :class="['status-badge', getNormalizedStatus(selectedBooking.status)]">
                {{ getDisplayStatus(selectedBooking.status) }}
              </span>
            </div>
            <div class="detail-row">
              <span class="label">Created:</span>
              <span class="value">{{ formatDate(selectedBooking.createdAt) }}</span>
            </div>
            <div v-if="selectedBooking.updatedAt" class="detail-row">
              <span class="label">Updated:</span>
              <span class="value">{{ formatDate(selectedBooking.updatedAt) }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeDetailModal">Close</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="deleteConfirm" class="modal-overlay" @click="cancelDelete">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Delete Booking</h2>
          <button class="close-btn" @click="cancelDelete">×</button>
        </div>

        <div class="modal-body">
          <p>Are you sure you want to delete this booking?</p>
          <p class="warning-text">This action cannot be undone.</p>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="cancelDelete">Cancel</button>
          <button class="btn btn-danger" @click="performDelete">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import http from '../../../core/api/http';

// Reactive State
const bookings = ref([]);
const searchQuery = ref('');
const selectedStatus = ref('all');
const sortBy = ref('newest');
const loading = ref(false);
const error = ref('');
const openMenuIndex = ref(null);
const selectedBooking = ref(null);
const deleteConfirm = ref(null);
const isSubmitting = ref(false);
const showAddModal = ref(false);

// Form Data
const newBooking = ref({
  customerId: '',
  providerId: '',
  serviceId: '',
  bookingDate: '',
  startTime: '',
  endTime: '',
  status: 'pending'
});

// Customers & Providers (for dropdowns)
const customers = ref([]);
const providers = ref([]);
const services = ref([]);

const route = useRoute();
const router = useRouter();

// Fetch Data
onMounted(() => {
  const urlStatus = route.query.status;
  if (urlStatus && ['all', 'confirmed', 'pending', 'cancelled', 'completed'].includes(urlStatus)) {
    selectedStatus.value = urlStatus;
  }
  fetchBookings();
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

const handleClickOutside = () => {
  openMenuIndex.value = null;
};

const fetchBookings = async () => {
  loading.value = true;
  error.value = '';
  try {
    let url = '/infinity-booking/bookings'; // ✅ Use correct endpoint
    if (selectedStatus.value !== 'all') {
      url += `?status=${selectedStatus.value}`;
    }

    const response = await http.get(url);
    const rawBookings = Array.isArray(response.data) ? response.data : [];

    bookings.value = rawBookings.map(booking => ({
      ...booking,
      customer: booking.customer || {},
      provider: booking.provider || {},
      payment: booking.payment || {},
      createdAt: booking.createdAt || booking.bookingDate
    }));

    openMenuIndex.value = null;
  } catch (err) {
    console.error('Failed to fetch bookings:', err);
    error.value = err?.response?.data?.message || 'Failed to load bookings. Please try again later.';
    bookings.value = [];
  } finally {
    loading.value = false;
  }
};

const applyFilter = (status) => {
  router.push({
    query: { ...route.query, status: status === 'all' ? undefined : status }
  });
  selectedStatus.value = status;
  fetchBookings();
};

const displayedBookings = computed(() => {
  let filtered = [...bookings.value];
  
  if (searchQuery.value.trim()) {
    const term = searchQuery.value.toLowerCase().trim();
    filtered = filtered.filter(booking => 
      (booking.customer?.fullname?.toLowerCase().includes(term)) ||
      (booking.provider?.fullname?.toLowerCase().includes(term)) ||
      (booking.serviceName?.toLowerCase().includes(term)) ||
      (booking.customer?.email?.toLowerCase().includes(term))
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

const viewDetails = (booking) => {
  selectedBooking.value = booking;
};

const closeDetailModal = () => {
  selectedBooking.value = null;
};

const confirmDelete = (booking) => {
  deleteConfirm.value = booking;
};

const performDelete = async () => {
  if (!deleteConfirm.value) return;
  
  isSubmitting.value = true;
  try {
    // ✅ Use correct endpoint: /infinity-booking/bookings/{id}
    await http.delete(`/infinity-booking/bookings/${deleteConfirm.value._id}`);
    
    bookings.value = bookings.value.filter(b => b._id !== deleteConfirm.value._id);
    cancelDelete();
    alert('Booking deleted successfully!');
  } catch (err) {
    console.error('Delete booking error:', err);
    alert(err?.response?.data?.message || 'Failed to delete booking. Please try again.');
  } finally {
    isSubmitting.value = false;
  }
};

const updateStatus = async (booking, newStatus) => {
  isSubmitting.value = true;
  try {
    // ✅ Use correct endpoint: /infinity-booking/bookings/{id}/status
    const response = await http.patch(`/infinity-booking/bookings/${booking._id}/status`, {
      status: newStatus
    });

    // Update in local list
    const index = bookings.value.findIndex(b => b._id === booking._id);
    if (index !== -1) {
      bookings.value[index] = response.data;
    }

    // Update selected booking if it's the one being edited
    if (selectedBooking.value?._id === booking._id) {
      selectedBooking.value = response.data;
    }

    openMenuIndex.value = null;
    alert(`Booking ${newStatus} successfully!`);
  } catch (err) {
    console.error('Update status error:', err);
    alert(err?.response?.data?.message || 'Failed to update booking status. Please try again.');
  } finally {
    isSubmitting.value = false;
  }
};

const cancelDelete = () => {
  deleteConfirm.value = null;
};

// ✅ ALL UTILITY FUNCTIONS LOCAL TO THIS COMPONENT (no external imports)
const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString();
};

// ✅ ADDED: formatTime function (was missing from helpers)
const formatTime = (timeString) => {
  if (!timeString) return '—';
  
  // Handle time string format "HH:MM:SS"
  if (typeof timeString === 'string' && timeString.includes(':')) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${period}`;
  }
  
  // Handle Date object
  if (timeString instanceof Date) {
    return timeString.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  return timeString;
};

const getNormalizedStatus = (status) => {
  const s = (status || '').toLowerCase().trim();
  if (['confirmed', 'approved'].includes(s)) return 'confirmed';
  if (['pending', 'awaiting'].includes(s)) return 'pending';
  if (['cancelled', 'rejected'].includes(s)) return 'cancelled';
  if (['completed', 'finished'].includes(s)) return 'completed';
  return 'unknown';
};

const getDisplayStatus = (status) => {
  const s = (status || '').toLowerCase().trim();
  if (['confirmed', 'approved'].includes(s)) return 'Confirmed';
  if (['pending', 'awaiting'].includes(s)) return 'Pending';
  if (['cancelled', 'rejected'].includes(s)) return 'Cancelled';
  if (['completed', 'finished'].includes(s)) return 'Completed';
  return 'Unknown';
};

const isConfirmable = (status) => {
  return ['pending'].includes(getNormalizedStatus(status));
};

const isCancellable = (status) => {
  return ['pending', 'confirmed'].includes(getNormalizedStatus(status));
};

const isCompletable = (status) => {
  return ['confirmed'].includes(getNormalizedStatus(status));
};

const filterBookings = () => {
  // Computed property handles filtering
};

const sortBookings = () => {
  // Computed property handles sorting
};
</script>

<style scoped>
/* ... your existing booking styles ... */
.bookings-container {
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

.add-btn {
  background-color: #4285f4;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.add-btn:hover {
  background-color: #3367d6;
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

.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.booking-card {
  background-color: white;
  border-radius: 12px;
  padding: 15px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  position: relative;
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.booking-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.booking-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 15px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e0e5ff;
}

.booking-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 20px;
  font-weight: bold;
  color: #5a6cff;
}

.booking-info {
  flex-grow: 1;
  min-width: 0;
  overflow: hidden;
}

.booking-customer {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.booking-provider {
  font-size: 14px;
  color: #666;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.booking-service {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.booking-date {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}

.booking-status-container {
  margin: 0 30px 0 12px;
  flex-shrink: 0;
}

.booking-status {
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 12px;
  display: inline-block;
}

.booking-status.confirmed {
  color: #00c853;
  background-color: #e8f5e8;
}

.booking-status.pending {
  color: #ff9800;
  background-color: #fff3e0;
}

.booking-status.cancelled {
  color: #ff5252;
  background-color: #ffebee;
}

.booking-status.completed {
  color: #2196f3;
  background-color: #e3f2fd;
}

.booking-status.unknown {
  color: #666;
  background-color: #f0f0f0;
}

.booking-actions {
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

.status-badge.confirmed {
  color: #00c853;
  background-color: #e8f5e8;
}

.status-badge.pending {
  color: #ff9800;
  background-color: #fff3e0;
}

.status-badge.cancelled {
  color: #ff5252;
  background-color: #ffebee;
}

.status-badge.completed {
  color: #2196f3;
  background-color: #e3f2fd;
}

.status-badge.unknown {
  color: #666;
  background-color: #f0f0f0;
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

  .booking-card {
    padding: 12px;
  }

  .booking-customer {
    font-size: 15px;
  }

  .booking-status-container {
    margin: 0 28px 0 10px;
  }

  .booking-actions {
    position: static;
    align-self: flex-end;
  }

  .modal-content {
    width: 95%;
    margin: 10px;
  }

  .detail-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .label {
    margin-bottom: 4px;
    min-width: auto;
  }
}
</style>