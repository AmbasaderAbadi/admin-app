<template>
  <div class="settings-container">
    <!-- Header -->
    <div class="header">
      <button class="back-btn" @click="goBack">
        <span>←</span>
      </button>
      <h1>Settings</h1>
    </div>

    <!-- User Profile Section -->
    <div class="user-profile">
      <img :src="user.avatar || 'https://via.placeholder.com/80'" alt="User Avatar" class="avatar" />
      <div class="user-info">
        <h2>{{ user.name }}</h2>
        <p class="email">{{ user.email }}</p>
      </div>
      <button class="edit-btn" @click="editProfile">Edit</button>
    </div>

    <!-- Application Settings -->
    <div class="section">
      <h3>APPLICATION</h3>
      <div class="setting-item" @click="navigateTo('general')">
        <div class="icon"><span>📊</span></div>
        <span>General</span>
        <span class="chevron">›</span>
      </div>
      <div class="setting-item" @click="navigateTo('booking-rules')">
        <div class="icon"><span>⚙️</span></div>
        <span>Booking Rules</span>
        <span class="chevron">›</span>
      </div>
      <div class="setting-item toggle-item">
        <div class="icon"><span>🔔</span></div>
        <span>Notifications</span>
        <label class="toggle-switch">
          <input type="checkbox" v-model="notificationsEnabled" @change="saveSetting('notifications', notificationsEnabled)" />
          <span class="slider"></span>
        </label>
      </div>
      <div class="setting-item toggle-item">
        <div class="icon"><span>🔧</span></div>
        <span>Maintenance Mode</span>
        <label class="toggle-switch">
          <input type="checkbox" v-model="maintenanceMode" @change="saveSetting('maintenance', maintenanceMode)" />
          <span class="slider"></span>
        </label>
      </div>
    </div>

    <!-- User Management -->
    <div class="section">
      <h3>USER MANAGEMENT</h3>
      <div class="setting-item" @click="navigateTo('manage-admins')">
        <div class="icon"><span>👥</span></div>
        <span>Manage Admins</span>
        <span class="chevron">›</span>
      </div>
    </div>

    <!-- Security & Account -->
    <div class="section">
      <h3>SECURITY & ACCOUNT</h3>
      <div class="setting-item" @click="navigateTo('change-password')">
        <div class="icon"><span>🔑</span></div>
        <span>Change Password</span>
        <span class="chevron">›</span>
      </div>
      <div class="setting-item toggle-item">
        <div class="icon"><span>🔒</span></div>
        <span>Two-Factor Authentication</span>
        <label class="toggle-switch">
          <input type="checkbox" v-model="twoFactorEnabled" @change="saveSetting('2fa', twoFactorEnabled)" />
          <span class="slider"></span>
        </label>
      </div>
    </div>

    <!-- Logout Button -->
    <div class="logout-section">
      <button class="logout-btn" @click="logout">
        <span>🚪</span> Log Out
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// User data (fetch from backend or store)
const user = ref({
  name: 'Jordan Smith',
  email: 'jordan.smith@infinity.io',
  avatar: 'https://randomuser.me/api/portraits/men/32.jpg' // placeholder
});

// Toggle states
const notificationsEnabled = ref(true);
const maintenanceMode = ref(false);
const twoFactorEnabled = ref(false);

// Load saved settings from localStorage or API
onMounted(() => {
  const saved = localStorage.getItem('appSettings');
  if (saved) {
    const settings = JSON.parse(saved);
    notificationsEnabled.value = settings.notifications ?? true;
    maintenanceMode.value = settings.maintenance ?? false;
    twoFactorEnabled.value = settings['2fa'] ?? false;
  }
});

// Navigate to sub-pages
const navigateTo = (page) => {
  router.push(`/settings/${page}`);
};

// Edit profile action
const editProfile = () => {
  router.push('/profile/edit');
};

// Save setting to localStorage (replace with API call in production)
const saveSetting = (key, value) => {
  const settings = JSON.parse(localStorage.getItem('appSettings') || '{}');
  settings[key] = value;
  localStorage.setItem('appSettings', JSON.stringify(settings));
  console.log(`Saved ${key}:`, value);
};

// Go back to previous page
const goBack = () => {
  router.back();
};

// Logout action
const logout = () => {
  // Clear auth token, user session, etc.
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
  // Redirect to login
  router.push('/login');
};
</script>

<style scoped>
.settings-container {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
  background-color: #f8f9fa;
}

.header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.back-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #333;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  margin-bottom: 20px;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.user-info h2 {
  margin: 0 0 4px 0;
  font-size: 18px;
}

.email {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.edit-btn {
  background-color: #eee;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  margin-left: auto;
}

.section {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.section h3 {
  font-size: 14px;
  text-transform: uppercase;
  color: #666;
  margin: 0 0 12px 0;
  font-weight: 600;
}

.setting-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  cursor: pointer;
  transition: background-color 0.1s;
}

.setting-item:hover {
  background-color: #f5f5f5;
}

.setting-item:not(.toggle-item) {
  justify-content: space-between;
}

.icon {
  width: 40px;
  height: 40px;
  background-color: #e6f0ff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  margin-right: 12px;
}

.setting-item span:last-child {
  color: #888;
  font-size: 16px;
}

.toggle-item {
  justify-content: space-between;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 24px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #4285f4;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.logout-section {
  margin-top: 20px;
}

.logout-btn {
  width: 100%;
  padding: 12px;
  background-color: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background-color 0.2s;
}

.logout-btn:hover {
  background-color: #fecaca;
}
</style>