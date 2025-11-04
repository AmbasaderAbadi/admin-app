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
      >
        <div class="customer-avatar">
          <img
            v-if="customer.avatar"
            :src="customer.avatar"
            :alt="customer.name"
          />
          <div v-else class="avatar-placeholder">
            {{ customer.name.charAt(0).toUpperCase() }}
          </div>
        </div>

        <div class="customer-info">
          <div class="customer-name">{{ customer.name }}</div>
          <div class="customer-email">{{ customer.email }}</div>
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue';
import http from '../api/http';

// Reactive state
const customers = ref([]);
const searchQuery = ref('');
const selectedStatus = ref('all');
const loading = ref(false);
const error = ref('');

// ✅ Track open menus per index (not ID)
const openMenus = ref([]);

// Close all menus when clicking outside
const handleClickOutside = (e) => {
  if (!e.target.closest('.customer-actions')) {
    // Close all menus
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

// Fetch customers
const fetchCustomers = async () => {
  loading.value = true;
  error.value = '';
  try {
    const res = await http.get('/users/customers');
    customers.value = Array.isArray(res.data) ? res.data : [];
    // Initialize openMenus array
    openMenus.value = new Array(customers.value.length).fill(false);
  } catch (e) {
    console.error('Failed to fetch customers:', e);
    error.value = 'Failed to load customers. Please try again later.';
  } finally {
    loading.value = false;
  }
};

// Toggle menu for specific index
const toggleMenu = (index) => {
  // Close all other menus first
  openMenus.value = openMenus.value.map((_, i) => i === index);
};

// Normalize status for styling
const normalizeStatus = (status) => {
  return status ? status.toLowerCase() : 'inactive';
};

// Helper: Can we suspend?
const isSuspendable = (status) => {
  return normalizeStatus(status) === 'active';
};

// Helper: Can we activate?
const isActivatable = (status) => {
  return normalizeStatus(status) !== 'active';
};

// Update customer status
const updateStatus = async (customer, newStatus) => {
  try {
    await http.patch(`/users/customers/${customer.id}`, {
      status: newStatus
    });

    // Optimistic UI update
    const idx = customers.value.findIndex(c => c.id === customer.id);
    if (idx !== -1) {
      customers.value[idx] = { ...customers.value[idx], status: newStatus.charAt(0).toUpperCase() + newStatus.slice(1) };
    }

    // Close menu after action
    const menuIndex = filteredCustomers.findIndex(c => c.id === customer.id);
    if (menuIndex !== -1) {
      openMenus.value[menuIndex] = false;
    }
  } catch (e) {
    console.error('Failed to update status:', e);
    alert('Failed to update customer status. Please try again.');
  }
};

// Delete customer
const deleteCustomer = async (customer) => {
  if (!confirm(`Are you sure you want to delete ${customer.name}?`)) return;

  try {
    await http.delete(`/users/customers/${customer.id}`);

    // Remove from list
    customers.value = customers.value.filter(c => c.id !== customer.id);
    
    // Re-initialize openMenus
    openMenus.value = new Array(customers.value.length).fill(false);
  } catch (e) {
    console.error('Failed to delete customer:', e);
    alert('Failed to delete customer. Please try again.');
  }
};

// Filter computed
const filteredCustomers = computed(() => {
  let result = [...customers.value];

  if (searchQuery.value.trim()) {
    const term = searchQuery.value.toLowerCase().trim();
    result = result.filter((c) =>
      (c.name?.toLowerCase().includes(term)) ||
      (c.email?.toLowerCase().includes(term)) ||
      String(c.id).includes(term)
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

const filterCustomers = () => {}; // for future debounce
const addNewCustomer = () => {
  console.log('Add new customer');
};
</script>

<style scoped>
/* Keep all your beautiful styles */
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
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative; /* Required for dropdown */
}

.customer-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 15px;
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
}

.customer-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 3px;
}

.customer-email {
  font-size: 14px;
  color: #666;
}

.customer-status {
  display: flex;
  align-items: center;
  margin-right: 20px;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 8px;
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
  font-size: 14px;
  font-weight: 500;
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
  position: relative;
  display: flex;
  align-items: center;
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