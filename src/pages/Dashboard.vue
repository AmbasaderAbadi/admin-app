<template>
  <div class="dashboard-container">
    <!-- Header -->
    <div class="header">
      <div class="header-left">
        <div class="help-icon">
          <img src="../assets/Infinity Booking Logo Enhanced.png" width="50px" height="50px" alt="infinity-booking logo" />
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

<script>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import http from '../api/http';

export default {
  name: 'AdminDashboard',
  setup() {
    const router = useRouter();

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

    return {
      navigateTo,
      isActive
    };
  },
  data() {
    return {
      selectedPeriod: 'today',
      timePeriods: [
        { label: 'Today', value: 'today' },
        { label: 'This Week', value: 'this-week' },
        { label: 'This Month', value: 'this-month' }
      ],
      timeBasedMetrics: [],
      totalMetrics: [],
      loading: false,
      error: '',
      quickActions: [
        { title: 'Manage Bookings', icon: '📆', route: '/bookings' },
        { title: 'View Customers', icon: '👥', route: '/customers' },
        { title: 'Payments', icon: '💳', route: '/payments' },
        { title: 'System Settings', icon: '⚙️', route: '/settings' }
      ],
      navItems: [
        { title: 'Dashboard', icon: '📊' },
        { title: 'Bookings', icon: '📅' },
        { title: 'Customers', icon: '👥' },
        { title: 'Settings', icon: '⚙️' }
      ],
      allCustomers: [],
      allProviders: [],
      serviceCategories: []
    };
  },
  computed: {
    selectedPeriodLabel() {
      return this.timePeriods.find(p => p.value === this.selectedPeriod)?.label || 'Period';
    }
  },
  async mounted() {
    await this.fetchAllData();
  },
  watch: {
    selectedPeriod() {
      this.calculateMetrics();
    }
  },
  methods: {
    async fetchAllData() {
      this.loading = true;
      this.error = '';
      
      try {
        // ✅ Handle each API call separately - no Promise.all()
        let customersData = [];
        let providersData = [];
        let categoriesData = [];

        // ✅ Fetch customers
        try {
          const customersRes = await http.get('/users/customers');
          customersData = Array.isArray(customersRes.data) ? customersRes.data : [];
        } catch (err) {
          console.warn('Failed to fetch customers:', err);
        }

        // ✅ Fetch providers  
        try {
          const providersRes = await http.get('/users/providers');
          providersData = Array.isArray(providersRes.data) ? providersRes.data : [];
        } catch (err) {
          console.warn('Failed to fetch providers:', err);
        }

        // ✅ Fetch categories
        try {
          const categoriesRes = await http.get('/categories');
          categoriesData = Array.isArray(categoriesRes.data) ? categoriesRes.data : [];
        } catch (err) {
          console.warn('Failed to fetch categories:', err);
        }

        // ✅ Process the data
        this.allCustomers = customersData.map(user => {
          const profile = user.customerProfile || {};
          return {
            _id: user._id,
            fullname: profile.fullname || 'Unnamed Customer',
            email: profile.email || 'no-email@example.com',
            status: profile.status || 'unknown',
            createdAt: profile.createdAt || user.createdAt || null
          };
        });

        this.allProviders = providersData.map(user => {
          const profile = user.providerProfile || {};
          return {
            _id: user._id,
            fullname: profile.fullname || 'Unnamed Provider',
            email: profile.email || 'no-email@example.com',
            status: profile.status || 'pending',
            createdAt: profile.createdAt || user.createdAt || null
          };
        });

        this.serviceCategories = categoriesData;

        this.calculateMetrics();
      } catch (error) {
        console.error('Unexpected error in fetchAllData:', error);
        this.error = 'Failed to load dashboard data. Please try again later.';
        // ✅ Still show metrics with default values
        this.timeBasedMetrics = this.getDefaultTimeMetrics();
        this.totalMetrics = this.getDefaultTotalMetrics();
      } finally {
        this.loading = false;
      }
    },

    getDefaultTimeMetrics() {
      return [
        { title: 'New Customers', value: '—', change: 0, icon: '👤+', route: '/customers', statusFilter: 'all' },
        { title: 'New Providers', value: '—', change: 0, icon: '👤+', route: '/providers', statusFilter: 'all' },
        { title: 'New Active Customers', value: '—', change: 0, icon: '✅', route: '/customers', statusFilter: 'active' },
        { title: 'New Active Providers', value: '—', change: 0, icon: '✅', route: '/providers', statusFilter: 'active' },
        { title: 'New Suspended Customers', value: '—', change: 0, icon: '⛔', route: '/customers', statusFilter: 'suspended' },
        { title: 'New Suspended Providers', value: '—', change: 0, icon: '⛔', route: '/providers', statusFilter: 'suspended' },
        { title: 'New Pending Providers', value: '—', change: 0, icon: '⏳', route: '/providers', statusFilter: 'pending' }
      ];
    },

    getDefaultTotalMetrics() {
      return [
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
    },

    getDateRange(period) {
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
    },

    getPreviousPeriodRange(period) {
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
    },

    countInPeriod(users, periodStart) {
      return users.filter(user => {
        const createdAt = user.createdAt ? new Date(user.createdAt) : null;
        return createdAt && createdAt >= periodStart;
      });
    },

    getStatusCount(users, status) {
      return users.filter(user => 
        (user.status || '').toLowerCase() === status.toLowerCase()
      ).length;
    },

    calculateMetrics() {
      const currentStart = this.getDateRange(this.selectedPeriod);
      const prevStart = this.getPreviousPeriodRange(this.selectedPeriod);
      
      const currentNewCustomers = this.countInPeriod(this.allCustomers, currentStart);
      const currentNewProviders = this.countInPeriod(this.allProviders, currentStart);
      const prevNewCustomers = this.countInPeriod(this.allCustomers, prevStart);
      const prevNewProviders = this.countInPeriod(this.allProviders, prevStart);
      
      const newActiveCustomers = currentNewCustomers.filter(c => c.status === 'active').length;
      const newActiveProviders = currentNewProviders.filter(p => p.status === 'active').length;
      const newSuspendedCustomers = currentNewCustomers.filter(c => c.status === 'suspended').length;
      const newSuspendedProviders = currentNewProviders.filter(p => p.status === 'suspended').length;
      const newPendingProviders = currentNewProviders.filter(p => p.status === 'pending').length;
      
      const calcChange = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
      };
      
      this.timeBasedMetrics = [
        { 
          title: 'New Customers', 
          value: this.formatNumber(currentNewCustomers.length), 
          change: calcChange(currentNewCustomers.length, prevNewCustomers.length), 
          icon: '👤+',
          route: '/customers',
          statusFilter: 'all'
        },
        { 
          title: 'New Providers', 
          value: this.formatNumber(currentNewProviders.length), 
          change: calcChange(currentNewProviders.length, prevNewProviders.length), 
          icon: '👤+',
          route: '/providers',
          statusFilter: 'all'
        },
        { 
          title: ' Active Customers', 
          value: this.formatNumber(newActiveCustomers), 
          change: 0, 
          icon: '✅',
          route: '/customers',
          statusFilter: 'active'
        },
        { 
          title: 'Active Providers', 
          value: this.formatNumber(newActiveProviders), 
          change: 0, 
          icon: '✅',
          route: '/providers',
          statusFilter: 'active'
        },
        { 
          title: 'Suspended Customers', 
          value: this.formatNumber(newSuspendedCustomers), 
          change: 0, 
          icon: '⛔',
          route: '/customers',
          statusFilter: 'suspended'
        },
        { 
          title: 'Suspended Providers', 
          value: this.formatNumber(newSuspendedProviders), 
          change: 0, 
          icon: '⛔',
          route: '/providers',
          statusFilter: 'suspended'
        },
        { 
          title: 'Pending Providers', 
          value: this.formatNumber(newPendingProviders), 
          change: 0, 
          icon: '⏳',
          route: '/providers',
          statusFilter: 'pending'
        }
      ];
      
      const totalCustomers = this.allCustomers.length;
      const totalProviders = this.allProviders.length;
      const activeCustomers = this.getStatusCount(this.allCustomers, 'active');
      const activeProviders = this.getStatusCount(this.allProviders, 'active');
      const inactiveCustomers = this.getStatusCount(this.allCustomers, 'inactive');
      const inactiveProviders = this.getStatusCount(this.allProviders, 'inactive');
      const suspendedCustomers = this.getStatusCount(this.allCustomers, 'suspended');
      const suspendedProviders = this.getStatusCount(this.allProviders, 'suspended');
      const pendingProviders = this.getStatusCount(this.allProviders, 'pending');
      const totalCategories = this.serviceCategories.length;
      
      this.totalMetrics = [
        { 
          title: 'Total Customers', 
          value: this.formatNumber(totalCustomers), 
          icon: '👥',
          route: '/customers',
          statusFilter: 'all',
          subtitle: 'All statuses'
        },
        { 
          title: 'Total Providers', 
          value: this.formatNumber(totalProviders), 
          icon: '🔧',
          route: '/providers',
          statusFilter: 'all',
          subtitle: 'All statuses'
        },
        { 
          title: 'Total Categories', 
          value: this.formatNumber(totalCategories), 
          icon: '📋',
          route: '/services',
          statusFilter: 'all',
          subtitle: 'Service categories'
        },
        { 
          title: 'Active Customers', 
          value: this.formatNumber(activeCustomers), 
          icon: '✅',
          route: '/customers',
          statusFilter: 'active',
          subtitle: 'Currently active'
        },
        { 
          title: 'Active Providers', 
          value: this.formatNumber(activeProviders), 
          icon: '✅',
          route: '/providers',
          statusFilter: 'active',
          subtitle: 'Currently active'
        },
        { 
          title: 'Inactive Customers', 
          value: this.formatNumber(inactiveCustomers), 
          icon: '⏸️',
          route: '/customers',
          statusFilter: 'inactive',
          subtitle: 'Deactivated'
        },
        { 
          title: 'Inactive Providers', 
          value: this.formatNumber(inactiveProviders), 
          icon: '⏸️',
          route: '/providers',
          statusFilter: 'inactive',
          subtitle: 'Deactivated'
        },
        { 
          title: 'Suspended Customers', 
          value: this.formatNumber(suspendedCustomers), 
          icon: '⛔',
          route: '/customers',
          statusFilter: 'suspended',
          subtitle: 'Temporarily blocked'
        },
        { 
          title: 'Suspended Providers', 
          value: this.formatNumber(suspendedProviders), 
          icon: '⛔',
          route: '/providers',
          statusFilter: 'suspended',
          subtitle: 'Temporarily blocked'
        },
        { 
          title: 'Pending Approvals', 
          value: this.formatNumber(pendingProviders), 
          icon: '⏳',
          route: '/providers',
          statusFilter: 'pending',
          subtitle: 'Awaiting review'
        }
      ];
    },

    formatNumber(num) {
      return new Intl.NumberFormat().format(num);
    },

    navigateToMetric(metric) {
      if (metric.route) {
        if (metric.statusFilter && metric.statusFilter !== 'all') {
          this.$router.push({
            path: metric.route,
            query: { 
              status: metric.statusFilter
            }
          });
        } else {
          this.$router.push(metric.route);
        }
      }
    },

    handleAction(action) {
      if (action.route) {
        this.$router.push(action.route);
      }
    }
  }
};
</script>

<style scoped>
/* ... your existing styles ... */
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
  position: fixed;
  bottom: 0;
  left: 19%;
  right: 0;
  background-color: white;
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