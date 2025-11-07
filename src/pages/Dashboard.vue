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
        :key="period" 
        :class="{ 'active': selectedPeriod === period }"
        @click="selectedPeriod = period"
      >
        {{ period }}
      </button>
    </div>

    <!-- Loading & Error States -->
    <div v-if="loading" class="status-message">Loading dashboard...</div>
    <div v-else-if="error" class="status-message error">{{ error }}</div>

    <!-- Metrics Grid -->
    <div v-else class="metrics-grid">
      <div 
        v-for="metric in metrics" 
        :key="metric.title" 
        class="metric-card"
      >
        <div class="metric-icon">{{ metric.icon }}</div>
        <div class="metric-title">{{ metric.title }}</div>
        <div class="metric-value">{{ metric.value }}</div>
        <div 
          :class="['metric-change', { 'positive': metric.change >= 0, 'negative': metric.change < 0 }]"
        >
          {{ metric.change >= 0 ? '+' : '' }}{{ metric.change }}%
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
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import http from '../api/http';

export default {
  name: 'AdminDashboard',
  setup() {
    const router = useRouter();
    const route = useRoute();

    const isActive = (title) => {
      const pathMap = {
        'Dashboard': '/',
        'Bookings': '/bookings',
        'Customers': '/customers',
        'Settings': '/settings'
      };
      return route.path === pathMap[title];
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
      selectedPeriod: 'This Week',
      timePeriods: ['Today', 'This Week', 'This Month'],
      metrics: [
        { title: 'New Customers', value: '—', change: 0, icon: '👤+' },
        { title: 'Active Providers', value: '—', change: 0, icon: '👥' },
        { title: 'Active Customers', value: '—', change: 0, icon: '👥' },
        { title: 'Pending Approvals', value: '—', change: 0, icon: '📋' }
      ],
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
      rawProviders: [],
      rawCustomers: []
    };
  },
  async mounted() {
    await this.fetchRawData();
  },
  watch: {
    selectedPeriod() {
      this.calculateMetrics();
    }
  },
  methods: {
    async fetchRawData() {
      this.loading = true;
      this.error = '';
      
      try {
        const [providersRes, customersRes] = await Promise.all([
          http.get('/users/providers'),
          http.get('/users/customers')
        ]);

        this.rawProviders = Array.isArray(providersRes.data) ? providersRes.data : [];
        this.rawCustomers = Array.isArray(customersRes.data) ? customersRes.data : [];

        // 🔍 Debug: Log raw data
        console.log('Fetched Customers:', this.rawCustomers.map(c => ({
          email: c.email,
          fullname: c.fullname,
          created_at: c.created_at,
          status: c.status
        })));
        console.log('Fetched Providers:', this.rawProviders.map(p => ({
          email: p.email,
          fullname: p.fullname,
          created_at: p.created_at,
          status: p.status
        })));

        this.calculateMetrics();
      } catch (error) {
        console.error('Failed to fetch dashboard ', error);
        this.error = 'Failed to load dashboard data. Please try again later.';
      } finally {
        this.loading = false;
      }
    },

    getPeriodRange(period) {
      const now = new Date();
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);

      if (period === 'Today') {
        return { start, end: new Date(now) };
      } else if (period === 'This Week') {
        const day = start.getDay();
        start.setDate(start.getDate() - day);
        return { start, end: new Date(now) };
      } else if (period === 'This Month') {
        start.setDate(1);
        return { start, end: new Date(now) };
      }
      return { start, end: new Date(now) };
    },

    // ✅ Safe date parser
    parseDate(dateStr) {
      if (!dateStr) return new Date(0);
      try {
        return new Date(dateStr);
      } catch {
        return new Date(0);
      }
    },

    calculateMetrics() {
      const { start, end } = this.getPeriodRange(this.selectedPeriod);

      // ✅ Filter customers
      const newCustomers = this.rawCustomers.filter(customer => {
        const joined = this.parseDate(customer.created_at);
        return joined >= start && joined <= end;
      }).length;

      // ✅ Active Customers = all customers (since no status)
      const activeCustomers = newCustomers;

      // ✅ Filter providers
      const pendingProviders = this.rawProviders.filter(provider => {
        const created = this.parseDate(provider.created_at || provider.registered_at);
        return (
          ['pending', 'awaiting'].includes((provider.status || '').toLowerCase()) &&
          created >= start && created <= end
        );
      }).length;

      const activeProviders = this.rawProviders.filter(provider => {
        const created = this.parseDate(provider.created_at || provider.registered_at);
        return (
          ['active', 'approved'].includes((provider.status || '').toLowerCase()) &&
          created >= start && created <= end
        );
      }).length;

      this.metrics = [
        { 
          title: 'New Customers', 
          value: this.formatNumber(newCustomers), 
          change: 0, 
          icon: '👤+' 
        },
        { 
          title: 'Active Providers', 
          value: this.formatNumber(activeProviders), 
          change: 0, 
          icon: '👥' 
        },
        { 
          title: 'Active Customers', 
          value: this.formatNumber(activeCustomers), 
          change: 0, 
          icon: '👥' 
        },
        { 
          title: 'Pending Approvals', 
          value: this.formatNumber(pendingProviders), 
          change: 0, 
          icon: '📋' 
        }
      ];
    },

    formatNumber(num) {
      return new Intl.NumberFormat().format(num);
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
/* Your existing styles */
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
  width: 300px;
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

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.metric-card {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
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
  font-size: 21px;
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
  font-size: 14px;
  font-weight: 500;
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
</style>