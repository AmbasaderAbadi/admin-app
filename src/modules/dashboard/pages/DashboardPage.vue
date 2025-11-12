<template>
  <div class="dashboard-container">
    <!-- Header -->
    <div class="header">
      <div class="header-left">
        <div class="help-icon">
          <img src="../../../core/assets/images/Infinity Booking Logo Enhanced.png" width="50px" height="50px" alt="infinity-booking logo" />
        </div>
      </div>
      <div class="header-center">
        <h1>Welcome back, Admin!</h1>
      </div>
      <div class="header-right">
        <div class="notification-bell">🔔</div>
      </div>
    </div>

    <!-- Time Period Toggle -->
    <div class="time-period-toggle">
      <button 
        v-for="period in timePeriods" 
        :key="period.value" 
        :class="{ 'active': selectedPeriod === period.value }"
        @click="selectedPeriod = period.value"
      >
        {{ period.label }}
      </button>
    </div>

    <!-- Loading & Error States -->
    <div v-if="loading" class="status-message">Loading dashboard...</div>
    <div v-else-if="error" class="status-message error">{{ error }}</div>

    <!-- TIME-BASED METRICS -->
    <div v-else>
      <h2 class="metrics-section-title">Recent Activity ({{ selectedPeriodLabel }})</h2>
      <div class="metrics-grid">
        <div 
          v-for="metric in timeBasedMetrics" 
          :key="metric.title" 
          class="metric-card clickable"
          @click="navigateToMetric(metric)"
        >
          <div class="metric-icon">{{ metric.icon }}</div>
          <div class="metric-title">{{ metric.title }}</div>
          <div class="metric-value">{{ metric.value }}</div>
          <div 
            :class="['metric-change', { 'positive': metric.change >= 0, 'negative': metric.change < 0 }]"
          >
            {{ metric.change >= 0 ? '+' : '' }}{{ Math.abs(metric.change) }}%
          </div>
        </div>
      </div>

      <!-- TOTAL METRICS -->
      <h2 class="metrics-section-title">Total Overview</h2>
      <div class="metrics-grid">
        <div 
          v-for="metric in totalMetrics" 
          :key="metric.title" 
          class="metric-card clickable"
          @click="navigateToMetric(metric)"
        >
          <div class="metric-icon">{{ metric.icon }}</div>
          <div class="metric-title">{{ metric.title }}</div>
          <div class="metric-value">{{ metric.value }}</div>
          <div class="metric-change static">
            {{ metric.subtitle || '' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <h2>Quick Actions</h2>
      <div 
        v-for="action in quickActions" 
        :key="action.title" 
        class="quick-action-item"
        @click="handleAction(action)"
      >
        <div class="action-icon">{{ action.icon }}</div>
        <div class="action-title">{{ action.title }}</div>
        <div class="action-arrow">></div>
      </div>
    </div>

    <!-- Bottom Navigation -->
    <div class="bottom-navigation">
      <div 
        v-for="navItem in navItems" 
        :key="navItem.title" 
        :class="['nav-item', { 'active': isActive(navItem.title) }]"
        @click="navigateTo(navItem.title)"
      >
        <div class="nav-icon">{{ navItem.icon }}</div>
        <div class="nav-title">{{ navItem.title }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import http from '../../../core/api/http'; // ✅ Use your original http client

const router = useRouter();

// Reactive State
const selectedPeriod = ref('today');
const timeBasedMetrics = ref([]);
const totalMetrics = ref([]);
const loading = ref(false);
const error = ref('');
const allCustomers = ref([]);
const allProviders = ref([]);
const serviceCategories = ref([]);

// Computed Properties
const timePeriods = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'this-week' },
  { label: 'This Month', value: 'this-month' }
];

const selectedPeriodLabel = computed(() => {
  return timePeriods.find(p => p.value === selectedPeriod.value)?.label || 'Period';
});

const quickActions = [
  { title: 'Manage Bookings', icon: '📆', route: '/bookings' },
  { title: 'View Customers', icon: '👥', route: '/customers' },
  { title: 'Payments', icon: '💳', route: '/payments' },
  { title: 'System Settings', icon: '⚙️', route: '/settings' }
];

const navItems = [
  { title: 'Dashboard', icon: '📊' },
  { title: 'Bookings', icon: '📅' },
  { title: 'Customers', icon: '👥' },
  { title: 'Settings', icon: '⚙️' }
];

// Fetch Data
onMounted(() => {
  fetchAllData();
});

// Watch Period Changes
watch(selectedPeriod, () => {
  calculateMetrics();
});

const fetchAllData = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    // ✅ Use your original working endpoints (EXACT same as your previous code)
    const [customersRes, providersRes, categoriesRes] = await Promise.allSettled([
      http.get('/infinity-booking/users/customers'),        // ✅ Your working endpoint
      http.get('/infinity-booking/users/providers'),        // ✅ Your working endpoint
      http.get('/infinity-booking/categories')              // ✅ Your working endpoint
    ]);

    // ✅ Process customers - same as your original code
    if (customersRes.status === 'fulfilled') {
      const rawUsers = Array.isArray(customersRes.value.data) 
        ? customersRes.value.data 
        : Array.isArray(customersRes.value.data?.data) 
          ? customersRes.value.data.data 
          : Array.isArray(customersRes.value.data?.users) 
            ? customersRes.value.data.users 
            : [];
      
      allCustomers.value = rawUsers.map(user => {
        const profile = user.customerProfile || {};
        return {
          _id: user._id,
          fullname: profile.fullname?.trim() || 'Unnamed Customer',
          email: profile.email?.trim() || 'no-email@example.com',
          phonenumber: profile.phonenumber?.trim() || '—',
          address: profile.address || '—',
          status: profile.status || 'unknown',
          createdAt: profile.createdAt || user.createdAt || null
        };
      });
    } else {
      console.warn('Failed to fetch customers:', customersRes.reason);
      allCustomers.value = [];
    }

    // ✅ Process providers - same as your original code
    if (providersRes.status === 'fulfilled') {
      const rawUsers = Array.isArray(providersRes.value.data) 
        ? providersRes.value.data 
        : Array.isArray(providersRes.value.data?.data) 
          ? providersRes.value.data.data 
          : Array.isArray(providersRes.value.data?.users) 
            ? providersRes.value.data.users 
            : [];
      
      allProviders.value = rawUsers.map(user => {
        const profile = user.providerProfile || {};
        return {
          _id: user._id,
          fullname: profile.fullname?.trim() || 'Unnamed Provider',
          email: profile.email?.trim() || 'no-email@example.com',
          phonenumber: profile.phonenumber?.trim() || '—',
          location: profile.location || '—',
          serviceCategories: profile.serviceCategories || [],
          FIN: profile.FIN || '—',
          workExperience: profile.workExperience || '—',
          status: profile.status || 'pending',
          createdAt: profile.createdAt || user.createdAt || null
        };
      });
    } else {
      console.warn('Failed to fetch providers:', providersRes.reason);
      allProviders.value = [];
    }

    // ✅ Process categories - same as your original code
    if (categoriesRes.status === 'fulfilled') {
      const rawCategories = Array.isArray(categoriesRes.value.data) 
        ? categoriesRes.value.data 
        : Array.isArray(categoriesRes.value.data?.data) 
          ? categoriesRes.value.data.data 
          : Array.isArray(categoriesRes.value.data?.categories) 
            ? categoriesRes.value.data.categories 
            : [];
      
      serviceCategories.value = rawCategories;
    } else {
      console.warn('Failed to fetch categories:', categoriesRes.reason);
      serviceCategories.value = [];
    }

    calculateMetrics();
  } catch (err) {
    console.error('Dashboard fetch error:', err);
    error.value = 'Failed to load dashboard data. Please try again later.';
    // ✅ Still show default metrics on error (same as your original)
    timeBasedMetrics.value = getDefaultTimeMetrics();
    totalMetrics.value = getDefaultTotalMetrics();
  } finally {
    loading.value = false;
  }
};

// Default Metrics (same as your original code)
const getDefaultTimeMetrics = () => [
  { title: 'New Customers', value: '—', change: 0, icon: '👤+', route: '/customers', statusFilter: 'all' },
  { title: 'New Providers', value: '—', change: 0, icon: '👤+', route: '/providers', statusFilter: 'all' },
  { title: 'New Active Customers', value: '—', change: 0, icon: '✅', route: '/customers', statusFilter: 'active' },
  { title: 'New Active Providers', value: '—', change: 0, icon: '✅', route: '/providers', statusFilter: 'active' },
  { title: 'New Suspended Customers', value: '—', change: 0, icon: '⛔', route: '/customers', statusFilter: 'suspended' },
  { title: 'New Suspended Providers', value: '—', change: 0, icon: '⛔', route: '/providers', statusFilter: 'suspended' },
  { title: 'New Pending Providers', value: '—', change: 0, icon: '⏳', route: '/providers', statusFilter: 'pending' }
];

const getDefaultTotalMetrics = () => [
  { title: 'Total Customers', value: '—', icon: '👥', route: '/customers', statusFilter: 'all', subtitle: 'All statuses' },
  { title: 'Total Providers', value: '—', icon: '🔧', route: '/providers', statusFilter: 'all', subtitle: 'All statuses' },
  { title: 'Total Categories', value: '—', icon: '📋', route: '/services', statusFilter: 'all', subtitle: 'Service categories' },
  { title: 'Active Customers', value: '—', icon: '✅', route: '/customers', statusFilter: 'active', subtitle: 'Currently active' },
  { title: 'Active Providers', value: '—', icon: '✅', route: '/providers', statusFilter: 'active', subtitle: 'Currently active' },
  { title: 'Inactive Customers', value: '—', icon: '⏸️', route: '/customers', statusFilter: 'inactive', subtitle: 'Deactivated' },
  { title: 'Inactive Providers', value: '—', icon: '⏸️', route: '/providers', statusFilter: 'inactive', subtitle: 'Deactivated' },
  { title: 'Suspended Customers', value: '—', icon: '⛔', route: '/customers', statusFilter: 'suspended', subtitle: 'Temporarily blocked' },
  { title: 'Suspended Providers', value: '—', icon: '⛔', route: '/providers', statusFilter: 'suspended', subtitle: 'Temporarily blocked' },
  { title: 'Pending Approvals', value: '—', icon: '⏳', route: '/providers', statusFilter: 'pending', subtitle: 'Awaiting review' }
];

// Metric Calculation (same as your original code)
const getDateRange = (period) => {
  const now = new Date();
  let startDate = new Date();
  
  if (period === 'today') {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (period === 'this-week') {
    const day = now.getDay();
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
  } else if (period === 'this-month') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }
  
  return startDate;
};

const getPreviousPeriodRange = (period) => {
  const now = new Date();
  let startDate = new Date();
  
  if (period === 'today') {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  } else if (period === 'this-week') {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() - 7);
  } else if (period === 'this-month') {
    startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  }
  
  return startDate;
};

// ✅ Safe filtering function (defensive programming)
const countInPeriod = (users, periodStart) => {
  if (!Array.isArray(users)) {
    console.warn('countInPeriod: users is not an array:', users);
    return [];
  }
  
  return users.filter(user => {
    const createdAt = user.createdAt ? new Date(user.createdAt) : null;
    return createdAt && createdAt >= periodStart;
  });
};

const getStatusCount = (users, status) => {
  if (!Array.isArray(users)) {
    console.warn('getStatusCount: users is not an array:', users);
    return 0;
  }
  
  return users.filter(user => 
    (user.status || '').toLowerCase() === status.toLowerCase()
  ).length;
};

const calculateMetrics = () => {
  const currentStart = getDateRange(selectedPeriod.value);
  const prevStart = getPreviousPeriodRange(selectedPeriod.value);
  
  const currentNewCustomers = countInPeriod(allCustomers.value, currentStart);
  const currentNewProviders = countInPeriod(allProviders.value, currentStart);
  const prevNewCustomers = countInPeriod(allCustomers.value, prevStart);
  const prevNewProviders = countInPeriod(allProviders.value, prevStart);
  
  const newActiveCustomers = currentNewCustomers.filter(c => c.status === 'active').length;
  const newActiveProviders = currentNewProviders.filter(p => p.status === 'active').length;
  const newSuspendedCustomers = currentNewCustomers.filter(c => c.status === 'suspended').length;
  const newSuspendedProviders = currentNewProviders.filter(p => p.status === 'suspended').length;
  const newPendingProviders = currentNewProviders.filter(p => p.status === 'pending').length;
  
  const calcChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };
  
  timeBasedMetrics.value = [
    { 
      title: 'New Customers', 
      value: formatNumber(currentNewCustomers.length), 
      change: calcChange(currentNewCustomers.length, prevNewCustomers.length), 
      icon: '👤+',
      route: '/customers',
      statusFilter: 'all'
    },
    { 
      title: 'New Providers', 
      value: formatNumber(currentNewProviders.length), 
      change: calcChange(currentNewProviders.length, prevNewProviders.length), 
      icon: '👤+',
      route: '/providers',
      statusFilter: 'all'
    },
    { 
      title: 'Active Customers', 
      value: formatNumber(newActiveCustomers), 
      change: 0, 
      icon: '✅',
      route: '/customers',
      statusFilter: 'active'
    },
    { 
      title: 'Active Providers', 
      value: formatNumber(newActiveProviders), 
      change: 0, 
      icon: '✅',
      route: '/providers',
      statusFilter: 'active'
    },
    { 
      title: 'Suspended Customers', 
      value: formatNumber(newSuspendedCustomers), 
      change: 0, 
      icon: '⛔',
      route: '/customers',
      statusFilter: 'suspended'
    },
    { 
      title: 'Suspended Providers', 
      value: formatNumber(newSuspendedProviders), 
      change: 0, 
      icon: '⛔',
      route: '/providers',
      statusFilter: 'suspended'
    },
    { 
      title: 'Pending Providers', 
      value: formatNumber(newPendingProviders), 
      change: 0, 
      icon: '⏳',
      route: '/providers',
      statusFilter: 'pending'
    }
  ];
  
  const totalCustomers = allCustomers.value.length;
  const totalProviders = allProviders.value.length;
  const activeCustomers = getStatusCount(allCustomers.value, 'active');
  const activeProviders = getStatusCount(allProviders.value, 'active');
  const inactiveCustomers = getStatusCount(allCustomers.value, 'inactive');
  const inactiveProviders = getStatusCount(allProviders.value, 'inactive');
  const suspendedCustomers = getStatusCount(allCustomers.value, 'suspended');
  const suspendedProviders = getStatusCount(allProviders.value, 'suspended');
  const pendingProviders = getStatusCount(allProviders.value, 'pending');
  const totalCategories = serviceCategories.value.length;
  
  totalMetrics.value = [
    { 
      title: 'Total Customers', 
      value: formatNumber(totalCustomers), 
      icon: '👥',
      route: '/customers',
      statusFilter: 'all',
      subtitle: 'All statuses'
    },
    { 
      title: 'Total Providers', 
      value: formatNumber(totalProviders), 
      icon: '🔧',
      route: '/providers',
      statusFilter: 'all',
      subtitle: 'All statuses'
    },
    { 
      title: 'Total Categories', 
      value: formatNumber(totalCategories), 
      icon: '📋',
      route: '/services',
      statusFilter: 'all',
      subtitle: 'Service categories'
    },
    { 
      title: 'Active Customers', 
      value: formatNumber(activeCustomers), 
      icon: '✅',
      route: '/customers',
      statusFilter: 'active',
      subtitle: 'Currently active'
    },
    { 
      title: 'Active Providers', 
      value: formatNumber(activeProviders), 
      icon: '✅',
      route: '/providers',
      statusFilter: 'active',
      subtitle: 'Currently active'
    },
    { 
      title: 'Inactive Customers', 
      value: formatNumber(inactiveCustomers), 
      icon: '⏸️',
      route: '/customers',
      statusFilter: 'inactive',
      subtitle: 'Deactivated'
    },
    { 
      title: 'Inactive Providers', 
      value: formatNumber(inactiveProviders), 
      icon: '⏸️',
      route: '/providers',
      statusFilter: 'inactive',
      subtitle: 'Deactivated'
    },
    { 
      title: 'Suspended Customers', 
      value: formatNumber(suspendedCustomers), 
      icon: '⛔',
      route: '/customers',
      statusFilter: 'suspended',
      subtitle: 'Temporarily blocked'
    },
    { 
      title: 'Suspended Providers', 
      value: formatNumber(suspendedProviders), 
      icon: '⛔',
      route: '/providers',
      statusFilter: 'suspended',
      subtitle: 'Temporarily blocked'
    },
    { 
      title: 'Pending Approvals', 
      value: formatNumber(pendingProviders), 
      icon: '⏳',
      route: '/providers',
      statusFilter: 'pending',
      subtitle: 'Awaiting review'
    }
  ];
};

// Helper Functions
const formatNumber = (num) => {
  return new Intl.NumberFormat().format(num);
};

const navigateToMetric = (metric) => {
  if (metric.route) {
    if (metric.statusFilter && metric.statusFilter !== 'all') {
      router.push({
        path: metric.route,
        query: { status: metric.statusFilter }
      });
    } else {
      router.push(metric.route);
    }
  }
};

const handleAction = (action) => {
  if (action.route) {
    router.push(action.route);
  }
};

const isActive = (title) => {
  const pathMap = {
    'Dashboard': '/',
    'Bookings': '/bookings',
    'Customers': '/customers',
    'Settings': '/settings'
  };
  return window.location.pathname === pathMap[title];
};

const navigateTo = (title) => {
  const pathMap = {
    'Dashboard': '/',
    'Bookings': '/bookings',
    'Customers': '/customers',
    'Settings': '/settings'
  };
  const path = pathMap[title];
  if (path) {
    router.push(path);
  }
};
</script>


<style scoped>
/* ... your existing dashboard styles ... */
.dashboard-container {
  font-family: Arial, sans-serif;
  max-width: 100%;
  padding: 20px;
  background-color: #f5f7fa;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left, .header-right {
  display: flex;
  align-items: center;
}

.help-icon {
  background-color: #e0e5ff;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #5a6cff;
}

.notification-bell {
  font-size: 24px;
  cursor: pointer;
}

.header-center h1 {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
  position: static;
}

.time-period-toggle {
  display: flex;
  background-color: #e0e5ff;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 20px;
}

.time-period-toggle button {
  background-color: transparent;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  flex: 1;
  min-width: 0;
  white-space: nowrap;
}

.time-period-toggle button.active {
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.status-message {
  text-align: center;
  padding: 20px;
  color: #666;
}

.status-message.error {
  color: #ff5252;
}

.metrics-section-title {
  font-size: 18px;
  font-weight: bold;
  margin: 24px 0 16px 0;
  color: #333;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e5ff;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.metric-card {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

.metric-card.clickable {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.metric-card.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.metric-icon {
  background-color: #e0e5ff;
  border-radius: 8px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  font-size: 20px;
}

.metric-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.metric-value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 5px;
}

.metric-change {
  font-size: 13px;
  font-weight: 500;
}

.metric-change.static {
  color: #888;
  font-style: italic;
}

.metric-change.positive {
  color: #00c853;
}

.metric-change.negative {
  color: #ff5252;
}

.quick-actions {
  margin-bottom: 30px;
}

.quick-actions h2 {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
}

.quick-action-item {
  background-color: white;
  border-radius: 12px;
  padding: 15px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.quick-action-item:hover {
  background-color: #f0f0f0;
}

.action-icon {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  font-size: 20px;
}

.action-title {
  flex-grow: 1;
  font-size: 16px;
}

.action-arrow {
  font-size: 18px;
  color: #999;
}

.bottom-navigation {
  bottom: 0;
  left: 19.8%;
  right: 0;
  align-items: center;
  display: flex;
  justify-content: center;
  padding: 10px 0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  z-index: 1000;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-item.active {
  color: #5a6cff;
}

.nav-icon {
  font-size: 24px;
  margin-bottom: 5px;
}

.nav-title {
  font-size: 12px;
  text-align: center;
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 12px;
  }
  
  .header-center h1 {
    font-size: 20px;
  }
  
  .time-period-toggle {
    padding: 8px;
  }
  
  .time-period-toggle button {
    padding: 6px 12px;
    font-size: 14px;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .metric-card {
    padding: 16px;
  }
  
  .metric-value {
    font-size: 24px;
  }
  
  .quick-action-item {
    padding: 12px 16px;
  }
  
  .bottom-navigation {
    left: 0;
    right: 0;
    padding: 8px 0;
  }
  
  .nav-item {
    padding: 8px 4px;
  }
  
  .nav-title {
    font-size: 11px;
  }
}
</style>