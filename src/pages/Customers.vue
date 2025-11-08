<!-- src/views/Customers.vue -->
<template>
  <div class="customers-container">
    <!-- Header -->
    <div class="header">
      <h1>Customers</h1>
      <button class="search-icon">🔍</button>
    </div>

    <!-- Search Bar -->
    <div class="search-bar">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search by name or email..."
        @input="filterCustomers"
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
        :class="['filter-button', { active: selectedStatus === 'active' }]"
        @click="applyFilter('active')"
      >
        Active
      </button>
      <button
        :class="['filter-button', { active: selectedStatus === 'inactive' }]"
        @click="applyFilter('inactive')"
      >
        Inactive
      </button>
      <button
        :class="['filter-button', { active: selectedStatus === 'suspended' }]"
        @click="applyFilter('suspended')"
      >
        Suspended
      </button>
    </div>

    <!-- Sort Controls -->
    <div class="sort-controls">
      <label>Sort by: </label>
      <select v-model="sortBy" @change="sortCustomers">
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
      </select>
    </div>

    <!-- Loading & Error States -->
    <div v-if="loading" class="status-message">Loading customers...</div>
    <div v-else-if="error" class="status-message error">{{ error }}</div>

    <!-- Customers List -->
    <div v-else class="customers-list">
      <div
        v-for="(customer, index) in displayedCustomers"
        :key="customer._id"
        class="customer-card"
        :class="{ expanded: expandedId === customer._id }"
        @click="toggleExpand(customer._id)"
      >
        <div class="customer-avatar">
          <img
            v-if="customer.avatar"
            :src="customer.avatar"
            :alt="customer.fullname"
          />
          <div v-else class="avatar-placeholder">
            {{ customer.fullname.charAt(0).toUpperCase() }}
          </div>
        </div>

        <div class="customer-info">
          <div class="customer-name">{{ customer.fullname }}</div>
          <div class="customer-email">{{ customer.email }}</div>
          <div class="customer-date">
            Joined: {{ formatDate(customer.createdAt) }}
          </div>

          <!-- Expanded details -->
          <div v-if="expandedId === customer._id" class="expanded-details">
            <div class="detail-row">
              <span class="detail-label">Phone:</span>
              <span>{{ customer.phonenumber || '—' }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Address:</span>
              <span>{{ customer.address || '—' }}</span>
            </div>
          </div>
        </div>

        <div class="customer-status">
          <span :class="['status-dot', normalizeStatus(customer.status)]"></span>
          <span class="status-text">{{ formattedStatus(customer.status) }}</span>
        </div>

        <!-- Three-dot menu with dropdown -->
        <div class="customer-actions" @click.stop>
          <button
            class="more-options"
            @click="toggleMenu(index)"
          >
            ⋮
          </button>

          <div
            v-show="openMenus[index]"
            class="dropdown-menu"
            @click.stop
          >
            <button
              v-if="isSuspendable(customer.status)"
              @click="updateStatus(customer, 'suspended')"
            >
              Suspend
            </button>
            <button
              v-if="isActivatable(customer.status)"
              @click="updateStatus(customer, 'active')"
            >
              Activate
            </button>
            <button
              class="delete-btn"
              @click="deleteCustomer(customer)"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <div v-if="displayedCustomers.length === 0" class="no-results">
        No customers found
      </div>
    </div>

    <!-- Floating Action Button -->
    <div class="add-customer-button">
      <button @click="addNewCustomer">
        <span>+</span>
      </button>
    </div>

    <!-- Add Customer Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Add New Customer</h2>
          <button class="close-btn" @click="closeModal">×</button>
        </div>

        <form @submit.prevent="submitNewCustomer" class="add-form">
          <div class="form-group">
            <label>Full Name *</label>
            <input v-model="newCustomer.fullname" type="text" required />
          </div>

          <div class="form-group">
            <label>Email *</label>
            <input v-model="newCustomer.email" type="email" required />
          </div>

          <div class="form-group">
            <label>Password *</label>
            <input v-model="newCustomer.password" type="password" required />
          </div>

          <div class="form-group">
            <label>Confirm Password *</label>
            <input v-model="newCustomer.confirmPassword" type="password" required />
            <p v-if="passwordMismatch" class="error-text">Passwords do not match</p>
          </div>

          <div class="form-group">
            <label>Phone Number *</label>
            <input v-model="newCustomer.phonenumber" type="text" required />
          </div>

          <div class="form-group">
            <label>Address *</label>
            <textarea v-model="newCustomer.address" rows="2" required></textarea>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="closeModal">Cancel</button>
            <button type="submit" class="btn-submit" :disabled="isSubmitting">
              {{ isSubmitting ? 'Adding...' : 'Add Customer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount, watch, nextTick } from 'vue';
import http from '../api/http';
import { useRoute, useRouter } from 'vue-router';

const customers = ref([]);
const searchQuery = ref('');
const selectedStatus = ref('all');
const sortBy = ref('newest');
const loading = ref(false);
const error = ref('');
const openMenus = ref([]);
const expandedId = ref(null);
const showAddModal = ref(false);
const newCustomer = ref({
  fullname: '',
  email: '',
  password: '',
  confirmPassword: '',
  address: '',
  phonenumber: ''
});
const isSubmitting = ref(false);
const passwordMismatch = ref(false);
const route = useRoute();
const router = useRouter();

const handleClickOutside = (e) => {
  if (!e.target.closest('.customer-actions')) {
    openMenus.value = openMenus.value.map(() => false);
  }
};

onMounted(() => {
  const urlStatus = route.query.status;
  if (urlStatus && ['all', 'active', 'inactive', 'suspended'].includes(urlStatus)) {
    selectedStatus.value = urlStatus;
  }
  const urlSort = route.query.sort;
  if (urlSort && ['newest', 'oldest'].includes(urlSort)) {
    sortBy.value = urlSort;
  }
  
  fetchCustomers();
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

const fetchCustomers = async () => {
  loading.value = true;
  error.value = '';
  try {
    let url = '/users/customers';
    if (selectedStatus.value !== 'all') {
      url += `?status=${selectedStatus.value}`;
    }

    const res = await http.get(url);
    const rawUsers = Array.isArray(res.data) ? res.data : [];

    customers.value = rawUsers.map((user) => {
      const profile = user.customerProfile || {};
      return {
        _id: user._id,
        fullname: profile.fullname?.trim() || 'Unnamed Customer',
        email: profile.email?.trim() || 'no-email@example.com',
        phonenumber: profile.phonenumber?.trim() || '—',
        address: profile.address || '—',
        status: profile.status || 'unknown',
        createdAt: profile.createdAt || user.createdAt || null,
        avatar: profile.avatar || null
      };
    });

    openMenus.value = new Array(customers.value.length).fill(false);
    expandedId.value = null;
    nextTick(() => sortCustomers());
  } catch (e) {
    console.error('Failed to fetch customers:', e);
    error.value = 'Failed to load customers. Please try again later.';
    customers.value = [];
  } finally {
    loading.value = false;
  }
};

const applyFilter = (status) => {
  router.push({
    query: { ...route.query, status: status === 'all' ? undefined : status }
  });
  selectedStatus.value = status;
  fetchCustomers();
};

const sortCustomers = () => {
  let sorted = [...customers.value];
  
  if (sortBy.value === 'newest') {
    sorted = sorted.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return dateB - dateA;
    });
  } else {
    sorted = sorted.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return dateA - dateB;
    });
  }
  
  // Apply search filter
  if (searchQuery.value.trim()) {
    const term = searchQuery.value.toLowerCase().trim();
    sorted = sorted.filter(c =>
      c.fullname.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term)
    );
  }
  
  displayedCustomers.value = sorted;
};

const toggleMenu = (index) => {
  openMenus.value = openMenus.value.map((_, i) => i === index);
};

const toggleExpand = (id) => {
  expandedId.value = expandedId.value === id ? null : id;
};

const normalizeStatus = (status) => (status?.toLowerCase() || 'inactive');
const formattedStatus = (status) => (status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown');
const isSuspendable = (status) => normalizeStatus(status) === 'active';
const isActivatable = (status) => normalizeStatus(status) !== 'active';

const updateStatus = async (customer, newStatus) => {
  try {
    await http.patch('/users/customers/status', {
      email: customer.email,
      status: newStatus
    });

    const idx = customers.value.findIndex(c => c._id === customer._id);
    if (idx !== -1) {
      customers.value[idx].status = newStatus;
    }

    openMenus.value = openMenus.value.map(() => false);
  } catch (e) {
    console.error('Failed to update status:', e);
    alert('Failed to update customer status. Please try again.');
  }
};

const deleteCustomer = async (customer) => {
  if (!confirm(`Are you sure you want to delete ${customer.fullname}?`)) return;

  try {
    await http.delete(`/users/${encodeURIComponent(customer._id)}`);
    customers.value = customers.value.filter(c => c._id !== customer._id);
    openMenus.value = openMenus.value.map(() => false);
    if (expandedId.value === customer._id) {
      expandedId.value = null;
    }
    alert('Customer deleted successfully!');
  } catch (e) {
    console.error('Failed to delete customer:', e);
    alert('Failed to delete customer. Please try again.');
  }
};

const displayedCustomers = ref([]);

const filterCustomers = () => {
  nextTick(() => sortCustomers());
};

const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString();
};

const addNewCustomer = () => {
  newCustomer.value = {
    fullname: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    phonenumber: ''
  };
  passwordMismatch.value = false;
  showAddModal.value = true;
};

const closeModal = () => {
  showAddModal.value = false;
};

const submitNewCustomer = async () => {
  if (newCustomer.value.password !== newCustomer.value.confirmPassword) {
    passwordMismatch.value = true;
    return;
  }
  passwordMismatch.value = false;

  const fullname = newCustomer.value.fullname.trim();
  const email = newCustomer.value.email.trim();
  const password = newCustomer.value.password;
  const address = newCustomer.value.address.trim();
  const phonenumber = newCustomer.value.phonenumber.trim();

  if (!fullname || !email || !password || !address || !phonenumber) {
    alert('All fields are required.');
    return;
  }

  isSubmitting.value = true;
  try {
    await http.post('/users/customers', {
      fullname,
      email,
      password,
      address,
      phonenumber,
      role: 'customer'
    });

    await fetchCustomers();
    closeModal();
    alert('Customer added successfully!');
  } catch (e) {
    console.error('Full error:', e);
    if (e.response?.data?.message) {
      alert(`Error: ${e.response.data.message}`);
    } else if (e.response?.status === 500) {
      alert('Server error. Please check if email is already registered.');
    } else {
      alert('Failed to add customer. Please try again.');
    }
  } finally {
    isSubmitting.value = false;
  }
};

// Watch URL changes
watch(() => route.query.status, (newStatus) => {
  if (newStatus && ['all', 'active', 'inactive', 'suspended'].includes(newStatus)) {
    applyFilter(newStatus);
  }
});

// Watch sort changes
watch(sortBy, (newSort) => {
  router.push({
    query: { ...route.query, sort: newSort }
  });
  sortCustomers();
});
</script>

<style scoped>
/* ... your existing customer styles + new sort controls ... */
.customers-container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  padding: 16px;
  background-color: #f5f7fa;
  min-height: 100vh;
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

.search-icon {
  font-size: 24px;
  cursor: pointer;
  color: #666;
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
  transition: border-color 0.2s ease;
}

.search-bar input:focus {
  border-color: #5a6cff;
}

.filter-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-button {
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid #e0e5ff;
  background-color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-button.active {
  background-color: #4285f4;
  color: white;
  border-color: #4285f4;
}

.sort-controls {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
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
  color: gray;
  padding: 20px;
}

.status-message.error {
  color: red;
}

.customers-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.customer-card {
  background-color: white;
  border-radius: 12px;
  padding: 15px;
  display: flex;
  align-items: flex-start;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
}

.customer-card:hover:not(.expanded) {
  background-color: #f8f9fa;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.customer-card.expanded {
  box-shadow: 0 6px 20px rgba(0,0,0,0.12);
  background-color: #fafbff;
}

.customer-avatar {
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

.customer-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 20px;
  font-weight: bold;
  color: #5a6cff;
}

.customer-info {
  flex-grow: 1;
  min-width: 0;
}

.customer-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 3px;
  color: #333;
}

.customer-email {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.customer-date {
  font-size: 12px;
  color: #888;
  margin-bottom: 8px;
}

.expanded-details {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
  font-size: 14px;
  color: #555;
}

.detail-row {
  display: flex;
  margin-bottom: 6px;
}

.detail-label {
  font-weight: 500;
  color: #333;
  min-width: 70px;
}

.customer-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-left: 10px;
  margin-right: 25px;
  flex-shrink: 0;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-bottom: 4px;
}

.status-dot.active {
  background-color: #00c853;
}

.status-dot.inactive {
  background-color: #9e9e9e;
}

.status-dot.suspended {
  background-color: #ff9800;
}

.status-text {
  font-size: 12px;
  font-weight: 500;
  text-align: right;
}

.status-text.active {
  color: #00c853;
}

.status-text.inactive {
  color: #9e9e9e;
}

.status-text.suspended {
  color: #ff9800;
}

.customer-actions {
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
  z-index: 2;
}

.more-options:hover {
  background-color: #f0f0f0;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 30px;
  background: white;
  border: 1px solid #e0e5ff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1000;
  min-width: 140px;
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
  transition: background-color 0.2s ease;
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

.add-customer-button {
  position: fixed;
  bottom: 30px;
  right: 30px;
}

.add-customer-button button {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #4285f4;
  color: white;
  border: none;
  font-size: 30px;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.add-customer-button button:hover {
  background-color: #3367d6;
  transform: scale(1.05);
}

/* Modal Styles */
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
  width: 90%;
  max-width: 500px;
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

.add-form {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #5a6cff;
}

.error-text {
  color: #ff5252;
  font-size: 12px;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 10px;
}

.btn-cancel,
.btn-submit {
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-cancel {
  background: #eee;
  border: none;
  color: #333;
}

.btn-cancel:hover {
  background: #ddd;
}

.btn-submit {
  background: #4285f4;
  color: white;
  border: none;
}

.btn-submit:hover:not(:disabled) {
  background: #3367d6;
}

.btn-submit:disabled {
  background: #cccccc;
  cursor: not-allowed;
}
/* Add to bottom of <style> in both files */
@media (max-width: 768px) {
  .customers-container,
  .providers-container {
    padding: 12px;
  }
  
  .header h1 {
    font-size: 20px;
  }
  
  .search-bar input {
    padding: 10px 16px;
    font-size: 15px;
  }
  
  .filter-buttons {
    gap: 6px;
  }
  
  .filter-button {
    padding: 6px 12px;
    font-size: 13px;
  }
  
  .sort-controls {
    flex-wrap: wrap;
    gap: 6px;
  }
  
  .sort-controls select {
    padding: 6px 10px;
    font-size: 14px;
  }
  
  /* Card layout adjustments */
  .customer-card,
  .provider-card {
    padding: 12px;
    flex-direction: column;
    align-items: flex-start;
  }
  
  .customer-avatar,
  .provider-avatar {
    margin-right: 0;
    margin-bottom: 12px;
  }
  
  .customer-info,
  .provider-info {
    width: 100%;
    margin-bottom: 12px;
  }
  
  .customer-status,
  .provider-status-container {
    margin: 0 0 12px 0;
    align-self: flex-start;
  }
  
  .customer-actions,
  .provider-actions {
    position: static;
    align-self: flex-end;
  }
  
  .customer-date,
  .provider-date {
    font-size: 11px;
    margin-top: 4px;
  }
  
  /* Modal full-screen on mobile */
  .modal-content {
    width: 95%;
    margin: 10px;
    max-height: 90vh;
  }
  
  .add-customer-button,
  .add-provider-button {
    bottom: 20px;
    right: 20px;
  }
  
  .add-customer-button button,
  .add-provider-button button {
    width: 50px;
    height: 50px;
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .header h1 {
    font-size: 18px;
  }
  
  .metric-value {
    font-size: 22px;
  }
  
  .customer-name,
  .provider-name {
    font-size: 15px;
  }
  
  .bottom-navigation {
    padding: 6px 0;
  }
  
  .nav-icon {
    font-size: 20px;
  }
}
</style>