<template>
  <div class="dashboard-container">
    <!-- Fixed Header - Always 100% width -->
    <div class="fixed-header">
      <div class="header-content">
        <div class="header-center">
          <h1>Welcome back, {{ adminFullName }}!</h1>
        </div>
        <div class="header-right">
          <div class="notification-bell">🔔</div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Your existing content remains exactly the same -->
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

      <!-- Metrics Content -->
      <div v-else>
        <!-- Recent Activity -->
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
            <div :class="['metric-change', metric.change >= 0 ? 'positive' : 'negative']">
              {{ metric.change >= 0 ? '+' : '' }}{{ Math.abs(metric.change) }}%
            </div>
          </div>
        </div>

        <!-- Total Overview -->
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
              {{ metric.subtitle }}
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <h2>Quick Actions</h2>
          <div class="actions-grid">
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import http from '../../../core/api/http';

const router = useRouter();

// State
const selectedPeriod = ref('today');
const loading = ref(false);
const error = ref('');
const allCustomers = ref([]);
const allProviders = ref([]);
const serviceCategories = ref([]);
const adminFullName = ref('Admin');

// All your existing constants, computed, methods remain exactly the same
const timePeriods = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'this-week' },
  { label: 'This Month', value: 'this-month' }
];

const quickActions = [
  { title: 'Manage Bookings', icon: '📆', route: '/bookings' },
  { title: 'View Customers', icon: '👥', route: '/customers' },
  { title: 'Payments', icon: '💳', route: '/payments' },
  { title: 'System Settings', icon: '⚙️', route: '/settings' }
];

const selectedPeriodLabel = computed(() => 
  timePeriods.find(p => p.value === selectedPeriod.value)?.label || 'Period'
);

// Simplified admin profile fetching based on your API response
const fetchAdminProfile = async () => {
  try {
    const response = await http.get('/infinity-booking/users/profile');
    const userData = response.data?.data || response.data || response;
    
    console.log('Admin profile response:', userData); // For debugging
    
    // Direct access to fullname based on your API response structure
    if (userData?.fullname) {
      adminFullName.value = userData.fullname;
    } else {
      console.warn('Full name not found in response structure:', userData);
      adminFullName.value = 'Admin'; // Fallback
    }
  } catch (err) {
    console.error('Failed to fetch admin profile:', err);
    adminFullName.value = 'Admin'; // Fallback on error
  }
};

const fetchAllData = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const [customersRes, providersRes, categoriesRes] = await Promise.allSettled([
      http.get('/infinity-booking/users/customers'),
      http.get('/infinity-booking/users/providers'),
      http.get('/infinity-booking/categories')
    ]);

    allCustomers.value = processResponse(customersRes, 'customerProfile');
    allProviders.value = processResponse(providersRes, 'providerProfile');
    serviceCategories.value = processCategories(categoriesRes);

    calculateMetrics();
  } catch (err) {
    error.value = 'Failed to load dashboard data. Please try again later.';
    setDefaultMetrics();
  } finally {
    loading.value = false;
  }
};

const processResponse = (result, profileKey) => {
  if (result.status !== 'fulfilled') return [];
  
  const data = result.value.data;
  const users = data?.data || data?.users || (Array.isArray(data) ? data : []);
  
  return users.map(user => ({
    _id: user._id,
    fullname: user[profileKey]?.fullname?.trim() || 'Unnamed User',
    email: user[profileKey]?.email?.trim() || 'no-email@example.com',
    status: user[profileKey]?.status || 'unknown',
    createdAt: user[profileKey]?.createdAt || user.createdAt || null
  }));
};

const processCategories = (result) => {
  if (result.status !== 'fulfilled') return [];
  
  const data = result.value.data;
  return data?.data || data?.categories || (Array.isArray(data) ? data : []);
};

// Metrics Calculation (all your existing functions remain exactly the same)
const timeBasedMetrics = ref([]);
const totalMetrics = ref([]);

const calculateMetrics = () => {
  const currentStart = getDateRange(selectedPeriod.value);
  const prevStart = getPreviousPeriodRange(selectedPeriod.value);
  
  const currentCustomers = countInPeriod(allCustomers.value, currentStart);
  const currentProviders = countInPeriod(allProviders.value, currentStart);
  const prevCustomers = countInPeriod(allCustomers.value, prevStart);
  const prevProviders = countInPeriod(allProviders.value, prevStart);

  timeBasedMetrics.value = [
    createMetric('New Customers', currentCustomers.length, prevCustomers.length, '👤+', '/customers'),
    createMetric('New Providers', currentProviders.length, prevProviders.length, '👤+', '/providers'),
    createMetric('Active Customers', countByStatus(currentCustomers, 'active'), 0, '✅', '/customers', 'active'),
    createMetric('Active Providers', countByStatus(currentProviders, 'active'), 0, '✅', '/providers', 'active'),
    createMetric('Suspended Customers', countByStatus(currentCustomers, 'suspended'), 0, '⛔', '/customers', 'suspended'),
    createMetric('Suspended Providers', countByStatus(currentProviders, 'suspended'), 0, '⛔', '/providers', 'suspended'),
    createMetric('Pending Providers', countByStatus(currentProviders, 'pending'), 0, '⏳', '/providers', 'pending')
  ];

  totalMetrics.value = [
    createTotalMetric('Total Customers', allCustomers.value.length, '👥', '/customers', 'All statuses'),
    createTotalMetric('Total Providers', allProviders.value.length, '🔧', '/providers', 'All statuses'),
    createTotalMetric('Total Categories', serviceCategories.value.length, '📋', '/services', 'Service categories'),
    createTotalMetric('Active Customers', countByStatus(allCustomers.value, 'active'), '✅', '/customers', 'Currently active', 'active'),
    createTotalMetric('Active Providers', countByStatus(allProviders.value, 'active'), '✅', '/providers', 'Currently active', 'active'),
    createTotalMetric('Suspended Customers', countByStatus(allCustomers.value, 'suspended'), '⛔', '/customers', 'Temporarily blocked', 'suspended'),
    createTotalMetric('Suspended Providers', countByStatus(allProviders.value, 'suspended'), '⛔', '/providers', 'Temporarily blocked', 'suspended'),
    createTotalMetric('Pending Approvals', countByStatus(allProviders.value, 'pending'), '⏳', '/providers', 'Awaiting review', 'pending')
  ];
};

// All your existing helper functions remain exactly the same
const createMetric = (title, current, previous, icon, route, statusFilter = 'all') => ({
  title,
  value: formatNumber(current),
  change: calculateChange(current, previous),
  icon,
  route,
  statusFilter
});

const createTotalMetric = (title, count, icon, route, subtitle, statusFilter = 'all') => ({
  title,
  value: formatNumber(count),
  icon,
  route,
  statusFilter,
  subtitle
});

const calculateChange = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

const countInPeriod = (users, startDate) => 
  users.filter(user => user.createdAt && new Date(user.createdAt) >= startDate);

const countByStatus = (users, status) => 
  users.filter(user => (user.status || '').toLowerCase() === status.toLowerCase()).length;

const getDateRange = (period) => {
  const now = new Date();
  if (period === 'today') return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (period === 'this-week') return new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  if (period === 'this-month') return new Date(now.getFullYear(), now.getMonth(), 1);
  return new Date();
};

const getPreviousPeriodRange = (period) => {
  const now = new Date();
  if (period === 'today') return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  if (period === 'this-week') return new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() - 7);
  if (period === 'this-month') return new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return new Date();
};

const setDefaultMetrics = () => {
  timeBasedMetrics.value = [];
  totalMetrics.value = [];
};

const formatNumber = (num) => new Intl.NumberFormat().format(num);

const navigateToMetric = (metric) => {
  if (!metric.route) return;
  
  const query = metric.statusFilter !== 'all' ? { status: metric.statusFilter } : {};
  router.push({ path: metric.route, query });
};

const handleAction = (action) => {
  if (action.route) router.push(action.route);
};

onMounted(async () => {
  // Fetch admin profile first to get the name
  await fetchAdminProfile();
  // Then fetch all other dashboard data
  await fetchAllData();
});

watch(selectedPeriod, calculateMetrics);
</script>

<style scoped>
.dashboard-container {
  font-family: Arial, sans-serif;
  background-color: #f5f7fa;
  min-height: 100vh;
}

/* Fixed Header - Always 100% width */
.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000; /* Lower than sidebar */
  padding: 1rem;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
}

.header-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}

.header-center h1 {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
  color: #333;
  white-space: nowrap;
}

.header-right {
  margin-left: auto;
}

.notification-bell {
  font-size: 1.25rem;
  cursor: pointer;
}

/* Main Content */
.main-content {
  margin-top: 80px;
  padding: 1rem;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  box-sizing: border-box;
  margin: 0;
}

/* ALL YOUR EXISTING CSS REMAINS EXACTLY THE SAME FROM HERE DOWN */

/* Time Period Toggle */
.time-period-toggle {
  display: flex;
  background-color: #e0e5ff;
  border-radius: 8px;
  padding: 0.5rem;
  margin-bottom: 1.5rem;
  gap: 0.25rem;
}

.time-period-toggle button {
  background: transparent;
  border: none;
  padding: 0.75rem 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  flex: 1;
  font-size: 0.875rem;
  min-width: 0;
  white-space: nowrap;
}

.time-period-toggle button.active {
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Status Messages */
.status-message {
  text-align: center;
  padding: 2rem;
  color: #666;
  font-size: 1rem;
}

.status-message.error {
  color: #ff5252;
}

/* Metrics */
.metrics-section-title {
  font-size: 1.125rem;
  font-weight: bold;
  margin: 1.5rem 0 1rem;
  color: #333;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e0e5ff;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.metric-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.metric-card.clickable {
  cursor: pointer;
  transition: all 0.2s ease;
}

.metric-card.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.metric-icon {
  background: #e0e5ff;
  border-radius: 8px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  font-size: 1.25rem;
}

.metric-title {
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.metric-value {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: #1a202c;
  line-height: 1;
}

.metric-change {
  font-size: 0.875rem;
  font-weight: 600;
}

.metric-change.positive {
  color: #00c853;
}

.metric-change.negative {
  color: #ff5252;
}

.metric-change.static {
  color: #718096;
  font-style: italic;
  font-weight: normal;
}

/* Quick Actions */
.quick-actions {
  margin-bottom: 2rem;
}

.quick-actions h2 {
  font-size: 1.125rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #333;
}

.actions-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.quick-action-item {
  background: white;
  border-radius: 12px;
  padding: 1.25rem 1rem;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
  gap: 1rem;
}

.quick-action-item:hover {
  background: #f8fafc;
  transform: translateX(4px);
}

.action-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.action-title {
  flex-grow: 1;
  font-size: 1rem;
  font-weight: 500;
  color: #2d3748;
}

.action-arrow {
  color: #a0aec0;
  font-size: 1.125rem;
  font-weight: bold;
  flex-shrink: 0;
}

/* ===== RESPONSIVE DESIGN ===== */

/* Tablets and small laptops */
@media (min-width: 768px) and (max-width: 1023px) {
  .fixed-header {
    padding: 1rem 1.5rem;
    z-index: 1000;
  }
  
  .header-center h1 {
    font-size: 1.375rem;
  }
  
  .main-content {
    margin-top: 80px;
    padding: 1.5rem;
  }
  
  .metrics-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.25rem;
  }
  
  .time-period-toggle button {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .fixed-header {
    padding: 1rem 2rem;
    z-index: 1000;
  }
  
  .header-center h1 {
    font-size: 1.5rem;
  }
  
  .main-content {
    margin: 0;
    padding: 2rem;
  }
  
  .metrics-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
  }
  
  .time-period-toggle {
    padding: 0.75rem;
  }
  
  .time-period-toggle button {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }
}

/* Mobile devices */
@media (max-width: 767px) {
  .fixed-header {
    padding: 0.875rem 1rem;
    z-index: 1000;
  }
  
  .header-content {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .header-center {
    position: static;
    transform: none;
    order: 1;
    flex-basis: 100%;
    text-align: center;
  }
  
  .header-center h1 {
    font-size: 1.125rem;
    line-height: 1.3;
    white-space: normal;
  }
  
  .header-right {
    order: 2;
    margin-left: auto;
  }
  
  .main-content {
    margin-top: 70px;
    padding: 1rem;
  }
  
  .time-period-toggle {
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem;
  }
  
  .time-period-toggle button {
    padding: 0.875rem;
    font-size: 0.9rem;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .metric-card {
    padding: 1.25rem;
  }
  
  .metric-value {
    font-size: 1.75rem;
  }
  
  .metric-icon {
    width: 44px;
    height: 44px;
    font-size: 1.125rem;
  }
  
  .quick-action-item {
    padding: 1rem 0.875rem;
  }
  
  .action-icon {
    width: 36px;
    height: 36px;
    font-size: 1.125rem;
  }
  
  .action-title {
    font-size: 0.9rem;
  }
}

/* Very small mobile devices */
@media (max-width: 360px) {
  .fixed-header {
    padding: 0.75rem;
    z-index: 1000;
  }
  
  .header-center h1 {
    font-size: 1rem;
  }
  
  .main-content {
    margin-top: 65px;
    padding: 0.75rem;
  }
  
  .metric-card {
    padding: 1rem;
  }
  
  .metric-value {
    font-size: 1.5rem;
  }
  
  .metric-icon {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
  
  .quick-action-item {
    padding: 0.875rem 0.75rem;
  }
  
  .action-title {
    font-size: 0.875rem;
  }
}

/* Large desktop screens */
@media (min-width: 1440px) {
  .main-content {
    max-width: 1400px;
  }
  
  .metrics-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}

/* Touch device improvements */
@media (hover: none) and (pointer: coarse) {
  .metric-card.clickable:hover {
    transform: none;
  }
  
  .quick-action-item:hover {
    transform: none;
    background: white;
  }
  
  .metric-card.clickable:active,
  .quick-action-item:active {
    background: #f1f5f9;
    transform: scale(0.98);
  }
}
</style>