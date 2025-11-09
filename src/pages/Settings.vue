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
      <!-- Avatar (click to edit) -->
      <div class="avatar-wrapper" @click="showAvatarModal = true">
        <img :src="user.photo || 'https://via.placeholder.com/80'" alt="User Avatar" class="avatar" />
        <div class="avatar-overlay">✏️</div>
      </div>
      
      <div class="user-info">
        <h2>{{ user.fullname || 'Admin User' }}</h2>
        <p class="email">{{ user.email }}</p>
      </div>
      
      <!-- Edit Button (for fullname & email) -->
      <button class="edit-btn" @click="showProfileModal = true">Edit Profile</button>
    </div>

    <!-- Edit Profile Modal (fullname & email only) -->
    <div v-if="showProfileModal" class="modal-overlay" @click.self="showProfileModal = false">
      <div class="modal">
        <h3>Edit Profile</h3>
        <div class="form-group">
          <label>Full Name</label>
          <input v-model="editUser.fullname" type="text" />
        </div>
        <div class="form-group">
          <label>Email</label>
          <input v-model="editUser.email" type="email" />
        </div>
        <div class="modal-actions">
          <button class="save-btn" @click="saveProfile">Save</button>
          <button class="cancel-btn" @click="showProfileModal = false">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Edit Avatar Modal -->
    <div v-if="showAvatarModal" class="modal-overlay" @click.self="showAvatarModal = false">
      <div class="modal">
        <h3>Change Avatar</h3>
        <div class="form-group">
          <label>Upload New Photo</label>
          <input type="file" @change="handleAvatarChange" />
          <img v-if="editUser.avatarPreview" :src="editUser.avatarPreview" class="avatar-preview" />
        </div>
        <div class="modal-actions">
          <button class="save-btn" @click="saveAvatar">Save</button>
          <button class="cancel-btn" @click="showAvatarModal = false">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Change Password Modal -->
    <div v-if="showChangePasswordModal" class="modal-overlay" @click.self="showChangePasswordModal = false">
      <div class="modal">
        <h3>Change Password</h3>
        <div class="form-group">
          <label>Current Password *</label>
          <input 
            v-model="currentPassword" 
            type="password" 
            placeholder="Enter your current password"
            required
          />
        </div>
        <div class="form-group">
          <label>New Password *</label>
          <input 
            v-model="newPassword" 
            type="password" 
            placeholder="Enter your new password"
            required
          />
        </div>
        <div class="form-group">
          <label>Confirm New Password *</label>
          <input 
            v-model="confirmNewPassword" 
            type="password" 
            placeholder="Confirm your new password"
            required
          />
          <p v-if="passwordMismatch" class="error-text">Passwords do not match</p>
        </div>
        <div class="modal-actions">
          <button 
            class="save-btn" 
            @click="changePassword" 
            :disabled="isSubmitting || passwordMismatch"
          >
            {{ isSubmitting ? 'Changing...' : 'Change Password' }}
          </button>
          <button class="cancel-btn" @click="showChangePasswordModal = false">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Application Settings -->
    <div class="section">
      <h3>APPLICATION</h3>
      <div class="setting-item" @click="navigateTo('General')">
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

    <!-- Security & Account -->
    <div class="section">
      <h3>SECURITY & ACCOUNT</h3>
      <div class="setting-item" @click="showChangePasswordModal = true">
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
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import http from '../api/http';

const router = useRouter();

// User data from profile endpoint
const user = ref({ 
  fullname: 'Admin User', 
  email: '', 
  photo: 'https://via.placeholder.com/80',
  _id: '' 
});
const editUser = ref({ 
  fullname: 'Admin User', 
  email: '', 
  avatar: null,
  avatarPreview: 'https://via.placeholder.com/80',
  _id: ''
});
const showProfileModal = ref(false);
const showAvatarModal = ref(false);

// Toggles
const notificationsEnabled = ref(true);
const maintenanceMode = ref(false);
const has2FAPIN = ref(false);

// Modals
const show2FAPINModal = ref(false);
const pinInput = ref('');
const showRemovePINModal = ref(false);
const removePINInput = ref('');

// Change Password state
const showChangePasswordModal = ref(false);
const currentPassword = ref('');
const newPassword = ref('');
const confirmNewPassword = ref('');
const isSubmitting = ref(false);
const passwordMismatch = ref(false);

// Watch for password mismatch
watch([newPassword, confirmNewPassword], () => {
  passwordMismatch.value = newPassword.value !== confirmNewPassword.value;
});

// Fetch user profile from /users/profile
const fetchUserProfile = async () => {
  try {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    // ✅ Use /users/profile (not /users/me)
    const response = await http.get('/users/profile');
    const profileData = response.data;
    
    // ✅ Extract fields from profile response
    const userId = profileData._id || '';
    const userEmail = profileData.email || '';
    const userFullname = profileData.fullname || 'Admin User';
    
    // ✅ Handle photo (backend uses profilePhoto)
    let photoUrl = 'https://via.placeholder.com/80';
    if (profileData.profilePhoto) {
      if (profileData.profilePhoto.startsWith('http')) {
        photoUrl = profileData.profilePhoto;
      } else {
        photoUrl = `https://infinity-booking-backend1.onrender.com${profileData.profilePhoto}`;
      }
    }
    
    user.value = {
      _id: userId,
      fullname: userFullname,
      email: userEmail,
      photo: photoUrl,
      role: profileData.role || 'admin'
    };
    editUser.value = { ...user.value };
    
  } catch (e) {
    console.error('Failed to fetch user profile:', e);
    
    if (e.response?.status === 401) {
      // Only redirect on auth errors
      alert('Session expired. Please log in again.');
      localStorage.removeItem('admin_token');
      router.push('/login');
    } else {
      // Show error but stay on page
      alert('Failed to load profile. Please try again later.');
    }
  }
};

// Load settings and user profile
onMounted(() => {
  fetchUserProfile();
  
  const saved = localStorage.getItem('appSettings');
  if (saved) {
    try {
      const settings = JSON.parse(saved);
      notificationsEnabled.value = settings.notifications ?? true;
      maintenanceMode.value = settings.maintenance ?? false;
      has2FAPIN.value = settings.has2FAPIN ?? false;
    } catch (e) {
      console.error('Failed to parse settings:', e);
    }
  }
});

// Navigation
// Use named routes instead of path building
const navigateTo = (routeName) => {
  router.push({ name: routeName });
};
const goBack = () => router.back();

// Avatar handling
const handleAvatarChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    editUser.value.avatar = file;
    
    const reader = new FileReader();
    reader.onload = () => {
      editUser.value.avatarPreview = reader.result;
    };
    reader.readAsDataURL(file);
  }
};

// Save profile (fullname & email only)
const saveProfile = async () => {
  if (!user.value._id) {
    alert('User ID is missing. Please refresh the page.');
    return;
  }
  
  if (!editUser.value.fullname?.trim()) {
    alert('Full name is required.');
    return;
  }
  
  if (!editUser.value.email?.trim()) {
    alert('Email is required.');
    return;
  }

  try {
    // ✅ PATCH /users/:id (update fullname & email)
    const response = await http.patch(`/users/${user.value._id}`, {
      fullname: editUser.value.fullname.trim(),
      email: editUser.value.email.trim()
    });
    
    // Update local state with response
    user.value = {
      _id: user.value._id,
      fullname: editUser.value.fullname.trim(),
      email: editUser.value.email.trim(),
      photo: user.value.photo,
      role: user.value.role
    };
    editUser.value = { ...user.value };
    
    showProfileModal.value = false;
    alert('Profile updated successfully!');
  } catch (e) {
    console.error('Failed to update profile:', e);
    const errorMsg = e.response?.data?.message || 'Failed to update profile. Please try again.';
    alert(errorMsg);
  }
};

// Save avatar (photo only)
const saveAvatar = async () => {
  if (!user.value._id) {
    alert('User ID is missing. Please refresh the page.');
    return;
  }

  if (!(editUser.value.avatar instanceof File)) {
    alert('Please select a photo first.');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('photo', editUser.value.avatar); // ✅ Backend expects 'photo'
    
    // ✅ PATCH /users/:id/upload-photo
    const response = await http.patch(`/users/${user.value._id}/upload-photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    // ✅ Handle response
    if (response.data?.profilePhoto) {
      const photoPath = response.data.profilePhoto;
      user.value.photo = photoPath.startsWith('http') 
        ? photoPath 
        : `https://infinity-booking-backend1.onrender.com${photoPath}`;
    } else if (response.data?.photo) {
      user.value.photo = response.data.photo;
    }
    
    editUser.value.avatar = null;
    editUser.value.avatarPreview = user.value.photo;
    
    showAvatarModal.value = false;
    alert('Avatar updated successfully!');
  } catch (e) {
    console.error('Failed to upload avatar:', e);
    const errorMsg = e.response?.data?.message || 'Failed to upload avatar. Please try again.';
    alert(errorMsg);
  }
};

// Save setting
const saveSetting = (key, value) => {
  try {
    const settings = JSON.parse(localStorage.getItem('appSettings') || '{}');
    settings[key] = value;
    localStorage.setItem('appSettings', JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings:', e);
  }
};

// Logout
const logout = () => {
  localStorage.removeItem('admin_token');
  localStorage.removeItem('admin_user');
  router.push('/login');
};

// Change Password
const changePassword = async () => {
  if (!currentPassword.value.trim()) {
    alert('Current password is required.');
    return;
  }
  if (!newPassword.value.trim()) {
    alert('New password is required.');
    return;
  }
  if (passwordMismatch.value) {
    alert('New passwords do not match.');
    return;
  }

  isSubmitting.value = true;
  try {
    // ✅ PATCH /users/change-password
    await http.patch('/users/change-password', {
      currentPassword: currentPassword.value,
      newPassword: newPassword.value
    });

    currentPassword.value = '';
    newPassword.value = '';
    confirmNewPassword.value = '';
    passwordMismatch.value = false;

    showChangePasswordModal.value = false;
    alert('Password changed successfully!');
  } catch (e) {
    console.error('Failed to change password:', e);
    const errorMsg = e.response?.data?.message || 'Failed to change password. Please try again.';
    alert(errorMsg);
  } finally {
    isSubmitting.value = false;
  }
};

// 2FA PIN Methods (keep as is)
const setup2FAPIN = () => {
  pinInput.value = '';
  show2FAPINModal.value = true;
};

const openRemovePINModal = () => {
  removePINInput.value = '';
  showRemovePINModal.value = true;
};

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
    alert('2FA PIN set successfully!');
  } catch (e) {
    console.error('Failed to set 2FA PIN:', e);
    const message = e.response?.data?.message || 'Failed to set PIN. Please try again.';
    alert(message);
  }
};

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

.avatar-wrapper {
  position: relative;
  cursor: pointer;
  width: 60px;
  height: 60px;
}

.avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  transition: transform 0.2s;
}

.avatar:hover {
  transform: scale(1.05);
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  opacity: 0;
  transition: opacity 0.2s;
}

.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
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
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #333;
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="password"],
.form-group input[type="file"] {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #5a6cff;
}

.error-text {
  color: #ff5252;
  font-size: 12px;
  margin-top: 4px;
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

.avatar-preview {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-top: 8px;
  object-fit: cover;
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