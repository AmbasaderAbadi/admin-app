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
      <button class="edit-btn" @click="showEditModal = true">Edit</button>
    </div>

    <!-- Edit Profile Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
      <div class="modal">
        <h3>Edit Profile</h3>
        <div class="form-group">
          <label>Name</label>
          <input v-model="editUser.name" type="text" />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input v-model="editUser.email" type="email" />
        </div>
        <div class="form-group">
          <label>Avatar</label>
          <input type="file" @change="handleAvatarChange" />
          <img v-if="editUser.avatar" :src="editUser.avatar" class="avatar-preview" />
        </div>
        <div class="modal-actions">
          <button class="save-btn" @click="saveProfile">Save</button>
          <button class="cancel-btn" @click="showEditModal = false">Cancel</button>
        </div>
      </div>
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
      
      <!-- 2FA PIN -->
      <div 
        class="setting-item" 
        @click="has2FAPIN ? openRemovePINModal() : setup2FAPIN()"
      >
        <div class="icon"><span>🔐</span></div>
        <div class="setting-info">
          <span>Two-Factor PIN</span>
          <span class="setting-desc">
            {{ has2FAPIN ? 'Tap to disable 2FA' : 'Tap to enable 2FA with 6-digit PIN' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Logout Button -->
    <div class="logout-section">
      <button class="logout-btn" @click="logout">
        <span>🚪</span> Log Out
      </button>
    </div>

    <!-- Set PIN Modal -->
    <div v-if="show2FAPINModal" class="modal-overlay" @click.self="show2FAPINModal = false">
      <div class="modal">
        <h3>Set 6-Digit PIN for 2FA</h3>
        <p>Enter a secure 6-digit numeric PIN.</p>
        <div class="form-group">
          <input 
            v-model="pinInput" 
            type="password" 
            inputmode="numeric"
            maxlength="6"
            placeholder="••••••"
            @input="pinInput = pinInput.replace(/\D/g, '').slice(0, 6)"
            class="pin-input"
          />
        </div>
        <div class="modal-actions">
          <button 
            class="save-btn" 
            @click="save2FAPIN" 
            :disabled="pinInput.length !== 6"
          >
            Set PIN
          </button>
          <button class="cancel-btn" @click="show2FAPINModal = false">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Remove PIN Modal -->
    <div v-if="showRemovePINModal" class="modal-overlay" @click.self="showRemovePINModal = false">
      <div class="modal">
        <h3>Disable Two-Factor Authentication</h3>
        <p>Enter your 6-digit PIN to confirm.</p>
        <div class="form-group">
          <input 
            v-model="removePINInput" 
            type="password" 
            inputmode="numeric"
            maxlength="6"
            placeholder="••••••"
            @input="removePINInput = removePINInput.replace(/\D/g, '').slice(0, 6)"
            class="pin-input"
          />
        </div>
        <div class="modal-actions">
          <button 
            class="save-btn" 
            @click="remove2FAPIN" 
            :disabled="removePINInput.length !== 6"
          >
            Disable 2FA
          </button>
          <button class="cancel-btn" @click="showRemovePINModal = false">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import http from '../api/http';

const router = useRouter();

// User data
const user = ref({ name: '', email: '', avatar: '' });
const editUser = ref({ name: '', email: '', avatar: '' });
const showEditModal = ref(false);

// Toggles
const notificationsEnabled = ref(true);
const maintenanceMode = ref(false);
const has2FAPIN = ref(false); // Whether 2FA PIN is set (2FA enabled)

// Modals
const show2FAPINModal = ref(false);
const pinInput = ref('');
const showRemovePINModal = ref(false);
const removePINInput = ref('');

// Load user data and settings
onMounted(() => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    const parsed = JSON.parse(storedUser);
    user.value = {
      name: parsed.name || 'Admin User',
      email: parsed.email || '',
      avatar: parsed.avatar || 'https://via.placeholder.com/80'
    };
    editUser.value = { ...user.value };
  }

  const saved = localStorage.getItem('appSettings');
  if (saved) {
    const settings = JSON.parse(saved);
    notificationsEnabled.value = settings.notifications ?? true;
    maintenanceMode.value = settings.maintenance ?? false;
    has2FAPIN.value = settings.has2FAPIN ?? false;
  }
});

// Navigation
const navigateTo = (page) => router.push(`/settings/${page}`);
const goBack = () => router.back();

// Avatar handling
const handleAvatarChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      editUser.value.avatar = reader.result;
    };
    reader.readAsDataURL(file);
  }
};

// Save profile
const saveProfile = () => {
  user.value = { ...editUser.value };
  localStorage.setItem('user', JSON.stringify(user.value));
  showEditModal.value = false;
  alert('Profile updated successfully!');
};

// Save setting
const saveSetting = (key, value) => {
  const settings = JSON.parse(localStorage.getItem('appSettings') || '{}');
  settings[key] = value;
  localStorage.setItem('appSettings', JSON.stringify(settings));
};

// Logout
const logout = () => {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('user');
  router.push('/login');
};

// 2FA PIN: Open setup modal
const setup2FAPIN = () => {
  pinInput.value = '';
  show2FAPINModal.value = true;
};

// 2FA PIN: Open remove modal
const openRemovePINModal = () => {
  removePINInput.value = '';
  showRemovePINModal.value = true;
};

// 2FA PIN: Save to backend (Enable 2FA)
const save2FAPIN = async () => {
  if (pinInput.value.length !== 6) {
    alert('Please enter a valid 6-digit PIN.');
    return;
  }

  try {
    await http.post('/auth/2fa/pin/setup', { pin: pinInput.value });
    has2FAPIN.value = true;
    saveSetting('has2FAPIN', true);
    show2FAPINModal.value = false;
    alert('2FA PIN set successfully! You will be prompted to verify it on your next login.');
  } catch (e) {
    console.error('Failed to set 2FA PIN:', e);
    const message = e.response?.data?.message || 'Failed to set PIN. Please try again.';
    alert(message);
  }
};

// 2FA PIN: Remove from backend (Disable 2FA)
const remove2FAPIN = async () => {
  if (removePINInput.value.length !== 6) {
    alert('Please enter your 6-digit PIN to disable 2FA.');
    return;
  }

  try {
    await http.post('/auth/2fa/pin/remove', { pin: removePINInput.value });
    has2FAPIN.value = false;
    saveSetting('has2FAPIN', false);
    showRemovePINModal.value = false;
    alert('2FA disabled successfully.');
  } catch (e) {
    console.error('Failed to remove 2FA PIN:', e);
    const message = e.response?.data?.message || 'Invalid PIN or server error.';
    alert(message);
  }
};
</script>

<style scoped>
.settings-container {
  padding: 20px;
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
  flex-wrap: wrap;
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

/* Sections */
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
  gap: 12px;
}

.setting-item:hover {
  background-color: #f5f5f5;
}

.setting-info {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.setting-desc {
  font-size: 12px;
  color: #666;
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

.chevron {
  color: #999;
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

/* Modals */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
  padding: 10px;
}

.modal {
  background: white;
  padding: 20px;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
}

.modal h3 {
  margin-top: 0;
  margin-bottom: 12px;
}

.form-group {
  margin-bottom: 12px;
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="file"] {
  width: 100%;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 14px;
}

/* PIN Input */
.pin-input {
  width: 100%;
  padding: 12px;
  font-size: 28px;
  text-align: center;
  letter-spacing: 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.error-text {
  color: #ff5252;
  font-size: 12px;
  margin-top: 4px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}

.save-btn {
  background-color: #4285f4;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

.save-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.cancel-btn {
  background-color: #eee;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
}

/* Responsive */
@media (max-width: 600px) {
  .user-profile {
    flex-direction: column;
    align-items: flex-start;
  }
  .edit-btn {
    margin-left: 0;
    margin-top: 8px;
  }
}
</style>