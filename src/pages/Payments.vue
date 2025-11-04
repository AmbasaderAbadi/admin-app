<template>
  <div class="payments-container">
    <!-- Header -->
    <div class="header">
      <h1>Payment Transactions</h1>
      <button class="btn-download" @click="downloadReport">
        <span>⬇️</span>
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Total Revenue</div>
        <div class="stat-value">$48,230.50</div>
        <div class="stat-change positive">+5.2%</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Pending Payouts</div>
        <div class="stat-value">$3,120.00</div>
        <div class="stat-change positive">+1.8%</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Failed Transactions</div>
        <div class="stat-value">$850.75</div>
        <div class="stat-change negative">-0.5%</div>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="search-bar">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="Search by ID, name..."
        @input="filterPayments"
      />
      <span class="search-icon">🔍</span>
    </div>

    <!-- Filter Buttons -->
    <div class="filter-buttons">
      <button
        :class="{ active: filterStatus === 'all' }"
        @click="setFilter('all')"
      >
        All
      </button>
      <button
        :class="{ active: filterStatus === 'completed' }"
        @click="setFilter('completed')"
      >
        Completed
      </button>
      <button
        :class="{ active: filterStatus === 'pending' }"
        @click="setFilter('pending')"
      >
        Pending
      </button>
      <button
        :class="{ active: filterStatus === 'failed' }"
        @click="setFilter('failed')"
      >
        Failed
      </button>
    </div>

    <!-- Recent Transactions Header -->
    <div class="section-header">
      <h2>Recent Transactions</h2>
      <button class="sort-btn" @click="toggleSort">
        Sort by <span v-if="sortOrder === 'asc'">↑</span><span v-else>↓</span>
      </button>
    </div>

    <!-- Transactions List -->
    <div v-if="filteredPayments.length > 0" class="transactions-list">
      <div
        v-for="payment in filteredPayments"
        :key="payment.id"
        class="transaction-card"
        @click="viewPayment(payment.id)"
      >
        <div class="avatar" :class="getAvatarClass(payment.status)">
          {{ getAvatarIcon(payment.status) }}
        </div>
        <div class="transaction-info">
          <div class="name">{{ payment.client_name || payment.client }}</div>
          <div class="date">{{ formatDate(payment.date) }}</div>
        </div>
        <div class="amount">${{ payment.amount.toFixed(2) }}</div>
        <div
          :class="[
            'status-badge',
            {
              'status-completed': payment.status === 'completed',
              'status-pending': payment.status === 'pending',
              'status-failed': payment.status === 'failed',
              'status-refunded': payment.status === 'refunded'
            }
          ]"
        >
          {{ payment.status.charAt(0).toUpperCase() + payment.status.slice(1) }}
        </div>
      </div>
    </div>

    <!-- No Results -->
    <div v-else class="no-results">
      <div class="icon">🔍</div>
      <h3>No Payments Found</h3>
      <p>Try adjusting your search or filters to find what you're looking for.</p>
    </div>

    <!-- Floating Action Button -->
    <button class="fab" @click="createNewPayment">
      +
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getPayments } from '../api/adminPayments';
import { useRouter } from 'vue-router';

const router = useRouter();
const payments = ref([]);
const searchQuery = ref('');
const filterStatus = ref('all');
const sortOrder = ref('desc'); // 'asc' or 'desc'

onMounted(async () => {
  try {
    const res = await getPayments();
    payments.value = res.data || [];
  } catch (e) {
    console.warn('getPayments failed, using mock', e);
    payments.value = [
      {
        id: 501,
        client_name: 'Jane Doe',
        amount: 150.00,
        date: '2023-10-26T10:45:00',
        status: 'completed'
      },
      {
        id: 502,
        client_name: 'John Smith',
        amount: 85.50,
        date: '2023-10-26T09:12:00',
        status: 'pending'
      },
      {
        id: 503,
        client_name: 'Emily White',
        amount: 210.00,
        date: '2023-10-25T15:30:00',
        status: 'failed'
      },
      {
        id: 504,
        client_name: 'Michael Brown',
        amount: 55.00,
        date: '2023-10-25T11:05:00',
        status: 'refunded'
      }
    ];
  }
});

// Format date to "Oct 26, 2023, 10:45 AM"
const formatDate = (isoDate) => {
  const date = new Date(isoDate);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

// Get avatar icon based on status
const getAvatarIcon = (status) => {
  switch (status) {
    case 'completed': return '⬇️';
    case 'pending': return '⏳';
    case 'failed': return '❗';
    case 'refunded': return '↩️';
    default: return '?';
  }
};

// Get avatar class based on status
const getAvatarClass = (status) => {
  return `avatar-${status}`;
};

// Toggle sort order
const toggleSort = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
};

// Filtered & sorted payments
const filteredPayments = computed(() => {
  let results = [...payments.value];

  // Apply status filter
  if (filterStatus.value !== 'all') {
    results = results.filter(p => p.status === filterStatus.value);
  }

  // Apply search filter
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    results = results.filter(p =>
      p.client_name?.toLowerCase().includes(query) ||
      p.client?.toLowerCase().includes(query) ||
      p.id.toString().includes(query)
    );
  }

  // Sort by date
  results.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return sortOrder.value === 'asc' ? dateA - dateB : dateB - dateA;
  });

  return results;
});

const setFilter = (status) => {
  filterStatus.value = status;
};

const viewPayment = (id) => router.push(`/payments/${id}`);

const createNewPayment = () => {
  router.push('/payments/new');
};

const downloadReport = () => {
  alert('Download report feature not implemented yet.');
};
</script>

<style scoped>
.payments-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
  background-color: #f8f9fa;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.btn-download {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 4px;
}

.stat-change {
  font-size: 12px;
  font-weight: 500;
}

.positive {
  color: #2e8b57;
}

.negative {
  color: #dc2626;
}

.search-bar {
  position: relative;
  margin-bottom: 20px;
}

.search-bar input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #888;
}

.filter-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.filter-buttons button {
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  background-color: #eee;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.filter-buttons button.active {
  background-color: #1a365d;
  color: white;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0 12px;
}

.sort-btn {
  background: none;
  border: none;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.transaction-card {
  background: white;
  border-radius: 12px;
  padding: 12px 16px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.1s, box-shadow 0.1s;
}

.transaction-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: white;
}

.avatar-completed {
  background-color: #e6f7e6;
  color: #2e8b57;
}

.avatar-pending {
  background-color: #fff3cd;
  color: #d97706;
}

.avatar-failed {
  background-color: #fee2e2;
  color: #dc2626;
}

.avatar-refunded {
  background-color: #e2e8f0;
  color: #4b5563;
}

.transaction-info {
  flex: 1;
}

.name {
  font-weight: bold;
  margin-bottom: 4px;
}

.date {
  font-size: 12px;
  color: #666;
}

.amount {
  font-weight: bold;
  font-size: 16px;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  text-transform: capitalize;
}

.status-completed {
  background-color: #e6f7e6;
  color: #2e8b57;
}

.status-pending {
  background-color: #fff3cd;
  color: #d97706;
}

.status-failed {
  background-color: #fee2e2;
  color: #dc2626;
}

.status-refunded {
  background-color: #e2e8f0;
  color: #4b5563;
}

.no-results {
  text-align: center;
  padding: 40px 20px;
  color: #888;
}

.no-results .icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.no-results h3 {
  font-size: 18px;
  margin-bottom: 8px;
}

.no-results p {
  font-size: 14px;
  line-height: 1.5;
}

.fab {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: #1a365d;
  color: white;
  border: none;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
</style>