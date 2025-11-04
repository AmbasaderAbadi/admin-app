<template>
  <div class="dashboard-container">
    <!-- Header -->
    <div class="header">
      <div class="header-left">
        <div class="help-icon">?</div>
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

    <!-- Metrics Grid -->
    <div class="metrics-grid">
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
        :class="['nav-item', { 'active': activeNav === navItem.title }]"
        @click="activeNav = navItem.title"
      >
        <div class="nav-icon">{{ navItem.icon }}</div>
        <div class="nav-title">{{ navItem.title }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminDashboard',
  data() {
    return {
      selectedPeriod: 'This Week',
      timePeriods: ['Today', 'This Week', 'This Month'],
      metrics: [
        { title: 'Total Bookings', value: '1,234', change: 5, icon: '📅' },
        { title: 'Total Revenue', value: '$25,678', change: 8, icon: '💰' },
        { title: 'New Customers', value: '82', change: 12, icon: '👤+' },
        { title: 'Active Providers', value: '45', change: -2, icon: '👥' },
        { title: 'Pending Approvals', value: '12', change: 0, icon: '📋' },
        { title: 'Upcoming', value: '58', change: 0, icon: '🔄' }
      ],
      quickActions: [
        { title: 'Manage Bookings', icon: '📆' },
        { title: 'View Customers', icon: '👥' },
        { title: 'Payments', icon: '💳' },
        { title: 'System Settings', icon: '⚙️' }
      ],
      navItems: [
        { title: 'Dashboard', icon: '📊' },
        { title: 'Bookings', icon: '📅' },
        { title: 'Customers', icon: '👥' },
        { title: 'Settings', icon: '⚙️' }
      ],
      activeNav: 'Dashboard'
    };
  },
  methods: {
    handleAction(action) {
      console.log('Action clicked:', action.title);
      // Add your action handling logic here
    }
  }
};
</script>

<style scoped>
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
  width: 40px;
  height: 40px;
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
  position:static;
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
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
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
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
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
  left: 20;
  right: 0;
  background-color: white;
  align-items: center;
  display: flex;
  justify-content: center;
  padding: 10px 0;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.05);
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