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
        placeholder="Search by name, email, or ID..."
        @input="filterCustomers"
      />
    </div>

    <!-- Status Filter Buttons -->
    <div class="filter-buttons">
      <button
        :class="['filter-button', { active: selectedStatus === 'all' }]"
        @click="selectedStatus = 'all'"
      >
        All
      </button>
      <button
        :class="['filter-button', { active: selectedStatus === 'active' }]"
        @click="selectedStatus = 'active'"
      >
        Active
      </button>
      <button
        :class="['filter-button', { active: selectedStatus === 'inactive' }]"
        @click="selectedStatus = 'inactive'"
      >
        Inactive
      </button>
      <button
        :class="['filter-button', { active: selectedStatus === 'suspended' }]"
        @click="selectedStatus = 'suspended'"
      >
        Suspended
      </button>
    </div>

    <!-- Loading & Error States -->
    <div v-if="loading" class="status-message">Loading customers...</div>
    <div v-else-if="error" class="status-message error">{{ error }}</div>

    <!-- Customers List -->
    <div v-else class="customers-list">
      <div
        v-for="(customer, index) in filteredCustomers"
        :key="customer.id"
        class="customer-card"
        :class="{ expanded: expandedId === customer.id }"
        @click="toggleExpand(customer.id)"
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
          
          <!-- Expanded details -->
          <div v-if="expandedId === customer.id" class="expanded-details">
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
          <span class="status-text">{{ customer.status || 'Unknown' }}</span>
        </div>

        <!-- Three-dot menu with dropdown -->
        <div class="customer-actions" @click.stop>
          <button
            class="more-options"
            @click="toggleMenu(index)"
          >
            ⋮
          </button>

          <!-- Dropdown Menu - ONLY for this customer -->
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

      <div v-if="filteredCustomers.length === 0" class="no-results">
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
import { ref, onMounted, computed, onBeforeUnmount } from 'vue';
import http from '../api/http';

const customers = ref([]);
const searchQuery = ref('');
const selectedStatus = ref('all');
const loading = ref(false);
const error = ref('');
const openMenus = ref([]);
const expandedId = ref(null);
// Add customer modal state
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

const handleClickOutside = (e) => {
  if (!e.target.closest('.customer-actions')) {
    openMenus.value = openMenus.value.map(() => false);
  }
};

onMounted(() => {
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
    const res = await http.get('/users/customers');
    const rawCustomers = Array.isArray(res.data) ? res.data : [];

    // ✅ CRITICAL: Ensure unique `id` — use email as fallback if needed
    customers.value = rawCustomers.map(customer => ({
      id: customer.id || customer.email, // ← THIS IS KEY
      fullname: customer.fullname?.trim() || 'Unnamed Customer',
      email: customer.email?.trim() || 'No email',
      phonenumber: customer.phonenumber?.trim() || '—',
      address: customer.address || '—',
      status: customer.status || 'active'
    }));

    openMenus.value = new Array(customers.value.length).fill(false);
  } catch (e) {
    console.error('Failed to fetch customers:', e);
    error.value = 'Failed to load customers. Please try again later.';
  } finally {
    loading.value = false;
  }
};

const toggleMenu = (index) => {
  openMenus.value = openMenus.value.map((_, i) => i === index);
};

const toggleExpand = (id) => {
  // ✅ This is already correct — only toggles the clicked customer
  expandedId.value = expandedId.value === email ? null : email;
};

const normalizeStatus = (status) => {
  return status ? status.toLowerCase() : 'inactive';
};

const isSuspendable = (status) => {
  return normalizeStatus(status) === 'active';
};

const isActivatable = (status) => {
  return normalizeStatus(status) !== 'active';
};

const updateStatus = async (customer, newStatus) => {
  try {
    await http.patch(`/users/customers/${customer.email}`, {
      status: newStatus
    });

    const idx = customers.value.findIndex(c => c.email === customer.email);
    if (idx !== -1) {
      customers.value[idx] = {
        ...customers.value[idx],
        status: newStatus.charAt(0).toUpperCase() + newStatus.slice(1)
      };
    }

    const menuIndex = filteredCustomers.value.findIndex(c => c.email === customer.email);
    if (menuIndex !== -1) {
      openMenus.value[menuIndex] = false;
    }
  } catch (e) {
    console.error('Failed to update status:', e);
    alert('Failed to update customer status. Please try again.');
  }
};

const deleteCustomer = async (customer) => {
  if (!confirm(`Are you sure you want to delete ${customer.fullname}?`)) return;

  try {
    await http.delete(`/users/customers/${customer.email}`);
    customers.value = customers.value.filter(c => c.email !== customer.email);
    openMenus.value = new Array(customers.value.length).fill(false);
    
    if (expandedId.value === customer.id) {
      expandedId.value = null;
    }
  } catch (e) {
    console.error('Failed to delete customer:', e);
    alert('Failed to delete customer. Please try again.');
  }
};

const filteredCustomers = computed(() => {
  let result = [...customers.value];

  if (searchQuery.value.trim()) {
    const term = searchQuery.value.toLowerCase().trim();
    result = result.filter((c) =>
      c.fullname.toLowerCase().includes(term) ||
      c.email.toLowerCase().includes(term)
    );
  }

  if (selectedStatus.value !== 'all') {
    result = result.filter(
      (c) =>
        c.status &&
        normalizeStatus(c.status) === selectedStatus.value.toLowerCase()
    );
  }

  return result;
});

const filterCustomers = () => {};
const addNewCustomer = () => {
  // Reset form
  newCustomer.value = {
    fullname: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    phonenumber: '',
    role:''
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

  isSubmitting.value = true;
  try {
    await http.post('/users/customers', {
      fullname: newCustomer.value.fullname,
      email: newCustomer.value.email,
      password: newCustomer.value.password,
      address: newCustomer.value.address,
      phonenumber: newCustomer.value.phonenumber,
      role: 'customer'
    });

    await fetchCustomers();
    closeModal();
    alert('Customer added successfully!');
  } catch (e) {
    console.error('Full error:', e); // 👈 THIS IS CRITICAL

    // Check if it's an Axios error with response
    if (e.response) {
      console.error('Backend responded with:', e.response.status, e.response.data);
      alert(`Registration failed: ${e.response.data?.message || 'Unknown error'}`);
    } else if (e.request) {
      console.error('No response received:', e.request);
      alert('Network error. Please check your connection.');
    } else {
      console.error('Error setting up request:', e.message);
      alert('Request setup failed.');
    }
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
/* Keep all your styles, with minor additions for expanded view */
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
.customers-container {
  font-family: Arial, sans-serif;
  padding: 20px;
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
  margin-bottom: 20px;
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
  align-items: flex-start; /* allow vertical growth */
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
  min-width: 0; /* prevent overflow */
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
  margin-bottom: 8px;
}

/* Expanded details */
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
  margin-left: 10px; /* ← added spacing */
  margin-right: 25px; /* ← space for 3-dot menu */
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
</style>