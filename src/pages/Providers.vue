<!-- src/views/Providers.vue -->
<template>
  <div class="providers-container">
    <!-- Header -->
    <div class="header">
      <h1>Service Providers</h1>
    </div>

    <!-- Search Bar -->
    <div class="search-bar">
      <input 
        v-model="searchQuery"
        type="text" 
        placeholder="Search by name, service, or email..."
        @input="applyFilters"
      />
    </div>

    <!-- Status Filter Buttons -->
    <div class="filter-buttons">
      <button
        :class="['filter-button', { active: selectedStatus === 'all' }]"
        @click="applyFilter('all')"
      >
        All
      </button>
      <button
        :class="['filter-button', { active: selectedStatus === 'active' }]"
        @click="applyFilter('active')"
      >
        Active
      </button>
      <button
        :class="['filter-button', { active: selectedStatus === 'pending' }]"
        @click="applyFilter('pending')"
      >
        Pending
      </button>
      <button
        :class="['filter-button', { active: selectedStatus === 'inactive' }]"
        @click="applyFilter('inactive')"
      >
        Inactive
      </button>
      <button
        :class="['filter-button', { active: selectedStatus === 'suspended' }]"
        @click="applyFilter('suspended')"
      >
        Suspended
      </button>
    </div>

    <!-- Sort Controls -->
    <div class="sort-controls">
      <label>Sort by: </label>
      <select v-model="sortBy" @change="sortProviders">
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
      </select>
    </div>

    <!-- Loading & Error States -->
    <div v-if="loading" class="status-message">Loading providers...</div>
    <div v-else-if="error" class="status-message error">{{ error }}</div>

    <!-- Providers List -->
    <div v-else class="providers-list">
      <div 
        v-for="(provider, index) in displayedProviders" 
        :key="provider._id" 
        class="provider-card"
        @click="viewDetails(provider)"
      >
        <div class="provider-avatar">
          <img 
            v-if="provider.avatar" 
            :src="provider.avatar" 
            :alt="provider.fullname"
          />
          <div v-else class="avatar-placeholder">
            {{ provider.fullname?.charAt(0)?.toUpperCase() || '?' }}
          </div>
        </div>
        
        <div class="provider-info">
          <div class="provider-name">{{ provider.fullname || '—' }}</div>
          <div class="provider-service">{{ provider.serviceCategories?.join(', ') || '—' }}</div>
          <div class="provider-email">{{ provider.email || '—' }}</div>
          <div class="provider-date">
            Joined: {{ formatDate(provider.createdAt) }}
          </div>
        </div>
        
        <div class="provider-status-container">
          <span :class="['provider-status', getNormalizedStatus(provider.status)]">
            {{ getDisplayStatus(provider.status) }}
          </span>
        </div>

        <!-- Three-dot menu -->
        <div class="provider-actions" @click.stop>
          <button class="more-options" @click="toggleMenu(index)">
            ⋮
          </button>
          
          <div 
            v-if="openMenuIndex === index" 
            class="dropdown-menu"
            @click.stop
          >
            <button
              v-if="isActivatable(provider.status)"
              @click="updateStatus(provider, 'active')"
            >
              Activate
            </button>
            <button
              v-if="isSuspendable(provider.status)"
              @click="updateStatus(provider, 'suspended')"
            >
              Suspend
            </button>
            <button
              class="delete-btn"
              @click="deleteProvider(provider)"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      <div v-if="displayedProviders.length === 0" class="no-results">
        No providers found
      </div>
    </div>

    <!-- Add Provider Button -->
    <div class="add-provider-button">
      <button @click="addNewProvider">
        <span>+</span>
      </button>
    </div>

    <!-- Provider Detail Modal -->
    <div v-if="selectedProvider" class="modal-overlay" @click="closeDetailModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Provider Details</h2>
          <button class="close-btn" @click="closeDetailModal">×</button>
        </div>

        <div class="detail-body">
          <!-- Basic Info -->
          <div class="section">
            <h3>👤 Personal Information</h3>
            <div class="detail-row">
              <span class="label">Full Name:</span>
              <span class="value">{{ selectedProvider.fullname || '—' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Email:</span>
              <span class="value">{{ selectedProvider.email || '—' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Phone:</span>
              <span class="value">{{ selectedProvider.phonenumber || '—' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Location:</span>
              <span class="value">{{ selectedProvider.location || '—' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Joined:</span>
              <span class="value">{{ formatDate(selectedProvider.createdAt) }}</span>
            </div>
          </div>

          <!-- Service Info -->
          <div class="section">
            <h3>🔧 Service Details</h3>
            <div class="detail-row">
              <span class="label">Service Categories:</span>
              <span class="value">{{ selectedProvider.serviceCategories?.join(', ') || '—' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">FIN (ID):</span>
              <span class="value">{{ selectedProvider.FIN || '—' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Work Experience:</span>
              <span class="value">{{ selectedProvider.workExperience || '—' }}</span>
            </div>
          </div>

          <!-- Status & Metadata -->
          <div class="section">
            <h3>📊 Status & Activity</h3>
            <div class="detail-row">
              <span class="label">Status:</span>
              <span :class="['status-badge', getNormalizedStatus(selectedProvider.status)]">
                {{ getDisplayStatus(selectedProvider.status) }}
              </span>
            </div>
          </div>

          <!-- Certificate -->
          <div class="section" v-if="selectedProvider.certificate">
            <h3>📄 Certificate</h3>
            <div class="certificate-preview">
              <img 
                v-if="isImage(selectedProvider.certificate)" 
                :src="selectedProvider.certificate" 
                alt="Certificate"
                class="certificate-img"
              />
              <div v-else class="certificate-file">
                <span>📎 {{ getFileName(selectedProvider.certificate) }}</span>
                <a :href="selectedProvider.certificate" target="_blank" class="download-link">Download</a>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeDetailModal">Close</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Provider Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Add New Service Provider</h2>
          <button class="close-btn" @click="closeModal">×</button>
        </div>

        <form @submit.prevent="submitNewProvider" class="add-form">
          <div class="form-group">
            <label>Full Name *</label>
            <input v-model="newProvider.fullname" type="text" required />
          </div>

          <div class="form-group">
            <label>Email *</label>
            <input v-model="newProvider.email" type="email" required />
          </div>

          <div class="form-group">
            <label>Phone Number *</label>
            <input v-model="newProvider.phonenumber" type="text" required />
          </div>

          <div class="form-group">
            <label>Location *</label>
            <input v-model="newProvider.location" type="text" required />
          </div>

          <div class="form-group">
            <label>Service Categories *</label>
            <input v-model="newProvider.serviceCategories" type="text" 
                   placeholder="e.g., barber, massage, cleaning" 
                   required />
          </div>

          <div class="form-group">
            <label>FIN (Provider ID) *</label>
            <input v-model="newProvider.FIN" type="text" required />
          </div>

          <div class="form-group">
            <label>Password *</label>
            <input v-model="newProvider.password" type="password" required />
          </div>

          <div class="form-group">
            <label>Confirm Password *</label>
            <input v-model="newProvider.confirmPassword" type="password" required />
            <p v-if="passwordMismatch" class="error-text">Passwords do not match</p>
          </div>

          <div class="form-group">
            <label>Work Experience *</label>
            <input v-model="newProvider.workExperience" type="text" 
                   placeholder="e.g., 3 years" 
                   required />
          </div>

          <div class="form-group">
            <label>Certificate (File) *</label>
            <input 
              ref="certificateInput"
              type="file" 
              accept=".jpg,.jpeg,.png,.pdf" 
              @change="handleFileChange"
              required
            />
            <p v-if="newProvider.certificateName" class="file-name">{{ newProvider.certificateName }}</p>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="closeModal">Cancel</button>
            <button type="submit" class="btn-submit" :disabled="isSubmitting">
              {{ isSubmitting ? 'Adding...' : 'Add Provider' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount, watch, nextTick } from 'vue';
import http from '../api/http';
import { useRoute, useRouter } from 'vue-router';

const providers = ref([]);
const searchQuery = ref('');
const selectedStatus = ref('all');
const sortBy = ref('newest');
const loading = ref(false);
const error = ref('');
const openMenuIndex = ref(null);
const selectedProvider = ref(null);
const showAddModal = ref(false);
const newProvider = ref({
  fullname: '',
  email: '',
  phonenumber: '',
  location: '',
  serviceCategories: '',
  FIN: '',
  password: '',
  confirmPassword: '',
  workExperience: '',
  certificate: null,
  certificateName: ''
});
const isSubmitting = ref(false);
const passwordMismatch = ref(false);
const route = useRoute();
const router = useRouter();

const handleClickOutside = () => {
  openMenuIndex.value = null;
};

onMounted(() => {
  const urlStatus = route.query.status;
  if (urlStatus && ['all', 'active', 'pending', 'inactive', 'suspended'].includes(urlStatus)) {
    selectedStatus.value = urlStatus;
  }
  const urlSort = route.query.sort;
  if (urlSort && ['newest', 'oldest'].includes(urlSort)) {
    sortBy.value = urlSort;
  }
  
  fetchProviders();
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

const fetchProviders = async () => {
  loading.value = true;
  error.value = '';
  try {
    let url = '/users/providers';
    if (selectedStatus.value !== 'all') {
      url += `?status=${selectedStatus.value}`;
    }

    const res = await http.get(url);
    const rawUsers = Array.isArray(res.data) ? res.data : [];

    providers.value = rawUsers.map((user) => {
      const profile = user.providerProfile || {};
      return {
        _id: user._id,
        profileId: profile._id || null,
        fullname: profile.fullname?.trim() || 'Unnamed Provider',
        email: profile.email?.trim() || 'no-email@example.com',
        phonenumber: profile.phonenumber?.trim() || '—',
        location: profile.location || '—',
        serviceCategories: Array.isArray(profile.serviceCategories) 
          ? profile.serviceCategories 
          : (profile.serviceCategories ? [profile.serviceCategories] : []),
        FIN: profile.FIN || '—',
        workExperience: profile.workExperience || '—',
        certificate: profile.certificate || null,
        status: profile.status || 'pending',
        createdAt: profile.createdAt || user.createdAt || null,
        avatar: profile.avatar || null
      };
    });

    openMenuIndex.value = null;
    nextTick(() => sortProviders());
  } catch (e) {
    console.error('Failed to fetch providers:', e);
    error.value = 'Failed to load providers. Please try again later.';
    providers.value = [];
  } finally {
    loading.value = false;
  }
};

const applyFilter = (status) => {
  router.push({
    query: { ...route.query, status: status === 'all' ? undefined : status }
  });
  selectedStatus.value = status;
  fetchProviders();
};

const sortProviders = () => {
  let sorted = [...providers.value];
  
  if (sortBy.value === 'newest') {
    sorted = sorted.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return dateB - dateA;
    });
  } else {
    sorted = sorted.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return dateA - dateB;
    });
  }
  
  // Apply search filter
  if (searchQuery.value.trim()) {
    const term = searchQuery.value.toLowerCase().trim();
    sorted = sorted.filter(p =>
      p.fullname.toLowerCase().includes(term) ||
      p.email.toLowerCase().includes(term) ||
      p.location.toLowerCase().includes(term) ||
      (Array.isArray(p.serviceCategories) && 
        p.serviceCategories.some(cat => cat.toLowerCase().includes(term)))
    );
  }
  
  displayedProviders.value = sorted;
};

const toggleMenu = (index) => {
  openMenuIndex.value = openMenuIndex.value === index ? null : index;
};

const displayedProviders = ref([]);

const getNormalizedStatus = (status) => {
  const s = (status || '').toLowerCase().trim();
  if (['active', 'approved'].includes(s)) return 'active';
  if (['inactive', 'rejected'].includes(s)) return 'inactive';
  if (['pending', 'awaiting'].includes(s)) return 'pending';
  if (['suspended', 'blocked'].includes(s)) return 'suspended';
  return 'unknown';
};

const getDisplayStatus = (status) => {
  const s = (status || '').toLowerCase().trim();
  if (['active', 'approved'].includes(s)) return 'Active';
  if (['inactive', 'rejected'].includes(s)) return 'Inactive';
  if (['pending', 'awaiting'].includes(s)) return 'Pending';
  if (['suspended', 'blocked'].includes(s)) return 'Suspended';
  return 'Unknown';
};

const isSuspendable = (status) => {
  return ['active', 'pending'].includes(getNormalizedStatus(status));
};

const isActivatable = (status) => {
  return ['suspended', 'inactive', 'pending'].includes(getNormalizedStatus(status));
};

const updateStatus = async (provider, newStatus) => {
  try {
    await http.patch('/users/providers/status', {
      email: provider.email,
      status: newStatus
    });

    const idx = providers.value.findIndex(p => p._id === provider._id);
    if (idx !== -1) {
      providers.value[idx].status = newStatus;
    }

    openMenuIndex.value = null;
  } catch (e) {
    console.error('Failed to update provider status:', e);
    alert('Failed to update provider status. Please try again.');
  }
};

const deleteProvider = async (provider) => {
  if (!confirm(`Delete ${provider.fullname}?`)) return;

  try {
    await http.delete(`/users/${encodeURIComponent(provider._id)}`);
    providers.value = providers.value.filter(p => p._id !== provider._id);
    openMenuIndex.value = null;
    if (selectedProvider.value?._id === provider._id) {
      selectedProvider.value = null;
    }
    alert('Deleted successfully!');
  } catch (e) {
    console.error('Delete failed:', e);
    alert(e.response?.data?.message || 'Failed to delete provider.');
  }
};

const viewDetails = (provider) => {
  selectedProvider.value = provider;
};

const closeDetailModal = () => {
  selectedProvider.value = null;
};

const addNewProvider = () => {
  newProvider.value = {
    fullname: '',
    email: '',
    phonenumber: '',
    location: '',
    serviceCategories: '',
    FIN: '',
    password: '',
    confirmPassword: '',
    workExperience: '',
    certificate: null,
    certificateName: ''
  };
  passwordMismatch.value = false;
  showAddModal.value = true;
};

const closeModal = () => {
  showAddModal.value = false;
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    newProvider.value.certificate = file;
    newProvider.value.certificateName = file.name;
  }
};

const submitNewProvider = async () => {
  if (newProvider.value.password !== newProvider.value.confirmPassword) {
    passwordMismatch.value = true;
    return;
  }
  passwordMismatch.value = false;

  isSubmitting.value = true;
  try {
    const formData = new FormData();
    formData.append('fullname', newProvider.value.fullname.trim());
    formData.append('email', newProvider.value.email.trim());
    formData.append('phonenumber', newProvider.value.phonenumber.trim());
    formData.append('location', newProvider.value.location.trim());
    formData.append('serviceCategories', newProvider.value.serviceCategories.trim());
    formData.append('FIN', newProvider.value.FIN.trim());
    formData.append('password', newProvider.value.password);
    formData.append('workExperience', newProvider.value.workExperience.trim());
    formData.append('role', 'provider');

    if (newProvider.value.certificate) {
      formData.append('certificate', newProvider.value.certificate);
    }

    await http.post('/users/providers', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    await fetchProviders();
    closeModal();
    alert('Provider added successfully!');
  } catch (e) {
    console.error('Full error:', e);
    if (e.response?.data?.message) {
      alert(`Registration failed: ${e.response.data.message}`);
    } else {
      alert('Failed to add provider. Please try again.');
    }
  } finally {
    isSubmitting.value = false;
  }
};

const isImage = (url) => {
  if (!url) return false;
  const ext = url.split('.').pop()?.toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
};

const getFileName = (url) => {
  if (!url) return 'No file';
  return url.split('/').pop() || 'Untitled';
};

const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString();
};

const applyFilters = () => {
  nextTick(() => sortProviders());
};

// Watch URL changes
watch(() => route.query.status, (newStatus) => {
  if (newStatus && ['all', 'active', 'pending', 'inactive', 'suspended'].includes(newStatus)) {
    applyFilter(newStatus);
  }
});

// Watch sort changes
watch(sortBy, (newSort) => {
  router.push({
    query: { ...route.query, sort: newSort }
  });
  sortProviders();
});
</script>

<style scoped>
/* ... your existing provider styles + new sort controls ... */
.providers-container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  padding: 16px;
  background-color: #f5f7fa;
  min-height: 100vh;
  max-width: 100%;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.header h1 {
  font-size: 22px;
  font-weight: bold;
  margin: 0;
}

.search-bar {
  position: relative;
  margin-bottom: 16px;
}

.search-bar input {
  width: 100%;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #e0e5ff;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;
}

.search-bar input:focus {
  border-color: #5a6cff;
}

.filter-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.filter-button {
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid #e0e5ff;
  background-color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.filter-button.active {
  background-color: #4285f4;
  color: white;
  border-color: #4285f4;
}

.sort-controls {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 8px;
}

.sort-controls label {
  font-weight: 500;
  color: #333;
}

.sort-controls select {
  padding: 6px 12px;
  border: 1px solid #e0e5ff;
  border-radius: 6px;
  background: white;
  font-size: 14px;
  cursor: pointer;
}

.status-message {
  text-align: center;
  color: #777;
  padding: 20px;
  font-size: 16px;
}

.status-message.error {
  color: #ff5252;
}

.providers-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.provider-card {
  background: white;
  border-radius: 12px;
  padding: 14px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 6px rgba(0,0,0,0.06);
  position: relative;
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.provider-card:hover {
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.provider-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 12px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e0e5ff;
}

.provider-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 20px;
  font-weight: bold;
  color: #5a6cff;
}

.provider-info {
  flex-grow: 1;
  min-width: 0;
  overflow: hidden;
}

.provider-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.provider-service {
  font-size: 13px;
  color: #666;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.provider-email {
  font-size: 12px;
  color: #555;
  font-style: italic;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.provider-date {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}

.provider-status-container {
  margin: 0 30px 0 12px;
  flex-shrink: 0;
}

.provider-status {
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 12px;
  display: inline-block;
}

.provider-status.active {
  color: #00c853;
  background-color: #e8f5e8;
}

.provider-status.inactive {
  color: #9e9e9e;
  background-color: #f5f5f5;
}

.provider-status.pending {
  color: #ff9800;
  background-color: #fff3e0;
}

.provider-status.suspended {
  color: #ff5252;
  background-color: #ffebee;
}

.provider-status.unknown {
  color: #666;
  background-color: #f0f0f0;
}

.provider-actions {
  position: absolute;
  top: 10px;
  right: 10px;
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
  top: 28px;
  background: white;
  border: 1px solid #e0e5ff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1000;
  min-width: 130px;
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

.add-provider-button {
  position: fixed;
  bottom: 24px;
  right: 24px;
}

.add-provider-button button {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: #4285f4;
  color: white;
  border: none;
  font-size: 28px;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.add-provider-button button:hover {
  background-color: #3367d6;
  transform: scale(1.05);
}

/* Modal styles (unchanged) */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 92%;
  max-width: 600px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e5ff;
}

.modal-header h2 {
  font-size: 20px;
  font-weight: bold;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.close-btn:hover {
  color: #333;
}

.detail-body {
  padding: 20px;
  font-size: 14px;
  line-height: 1.6;
}

.section {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.section h3 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-row {
  display: flex;
  margin-bottom: 12px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 8px;
  align-items: flex-start;
}

.label {
  font-weight: 500;
  color: #333;
  min-width: 120px;
  display: block;
}

.value {
  flex-grow: 1;
  color: #555;
}

.status-badge {
  font-size: 12px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 12px;
  display: inline-block;
}

.status-badge.active {
  color: #00c853;
  background-color: #e8f5e8;
}

.status-badge.inactive {
  color: #9e9e9e;
  background-color: #f5f5f5;
}

.status-badge.pending {
  color: #ff9800;
  background-color: #fff3e0;
}

.status-badge.suspended {
  color: #ff5252;
  background-color: #ffebee;
}

.status-badge.unknown {
  color: #666;
  background-color: #f0f0f0;
}

.certificate-preview {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
}

.certificate-img {
  max-width: 100%;
  max-height: 200px;
  object-fit: contain;
  border-radius: 8px;
  margin: 8px 0;
}

.certificate-file {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f0f0f0;
  border-radius: 8px;
}

.download-link {
  color: #4285f4;
  text-decoration: none;
  font-weight: 500;
}

.download-link:hover {
  text-decoration: underline;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #e0e5ff;
  margin-top: 10px;
}

.btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-secondary {
  background: #eee;
  border: none;
  color: #333;
}

.btn-secondary:hover {
  background: #ddd;
}

.btn-primary {
  background: #4285f4;
  color: white;
  border: none;
}

.btn-primary:hover {
  background: #3367d6;
}

.add-form {
  padding: 20px;
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

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #5a6cff;
}

.file-name {
  font-size: 12px;
  color: #555;
  margin-top: 4px;
  word-break: break-all;
}

.error-text {
  color: #ff5252;
  font-size: 12px;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 10px;
}

.btn-cancel,
.btn-submit {
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-cancel {
  background: #eee;
  border: none;
  color: #333;
}

.btn-cancel:hover {
  background: #ddd;
}

.btn-submit {
  background: #4285f4;
  color: white;
  border: none;
}

.btn-submit:hover:not(:disabled) {
  background: #3367d6;
}

.btn-submit:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .header h1 {
    font-size: 20px;
  }

  .provider-card {
    padding: 12px;
  }

  .provider-name {
    font-size: 15px;
  }

  .provider-status-container {
    margin: 0 28px 0 10px;
  }

  .add-provider-button {
    bottom: 16px;
    right: 16px;
  }

  .add-provider-button button {
    width: 50px;
    height: 50px;
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .filter-buttons {
    gap: 6px;
  }

  .filter-button {
    padding: 5px 12px;
    font-size: 13px;
  }

  .sort-controls {
    flex-wrap: wrap;
  }

  .sort-controls label,
  .sort-controls select {
    width: 100%;
  }

  .provider-info {
    margin-right: 10px;
  }

  .provider-status-container {
    margin-right: 24px;
  }

  .modal-content {
    width: 95%;
    max-width: 100%;
    margin: 10px;
  }

  .detail-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .label {
    margin-bottom: 4px;
    min-width: auto;
  }
}
/* Add to bottom of <style> in both files */
@media (max-width: 768px) {
  .customers-container,
  .providers-container {
    padding: 12px;
  }
  
  .header h1 {
    font-size: 20px;
  }
  
  .search-bar input {
    padding: 10px 16px;
    font-size: 15px;
  }
  
  .filter-buttons {
    gap: 6px;
  }
  
  .filter-button {
    padding: 6px 12px;
    font-size: 13px;
  }
  
  .sort-controls {
    flex-wrap: wrap;
    gap: 6px;
  }
  
  .sort-controls select {
    padding: 6px 10px;
    font-size: 14px;
  }
  
  /* Card layout adjustments */
  .customer-card,
  .provider-card {
    padding: 12px;
    flex-direction: column;
    align-items: flex-start;
  }
  
  .customer-avatar,
  .provider-avatar {
    margin-right: 0;
    margin-bottom: 12px;
  }
  
  .customer-info,
  .provider-info {
    width: 100%;
    margin-bottom: 12px;
  }
  
  .customer-status,
  .provider-status-container {
    margin: 0 0 12px 0;
    align-self: flex-start;
  }
  
  .customer-actions,
  .provider-actions {
    position: static;
    align-self: flex-end;
  }
  
  .customer-date,
  .provider-date {
    font-size: 11px;
    margin-top: 4px;
  }
  
  /* Modal full-screen on mobile */
  .modal-content {
    width: 95%;
    margin: 10px;
    max-height: 90vh;
  }
  
  .add-customer-button,
  .add-provider-button {
    bottom: 20px;
    right: 20px;
  }
  
  .add-customer-button button,
  .add-provider-button button {
    width: 50px;
    height: 50px;
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .header h1 {
    font-size: 18px;
  }
  
  .metric-value {
    font-size: 22px;
  }
  
  .customer-name,
  .provider-name {
    font-size: 15px;
  }
  
  .bottom-navigation {
    padding: 6px 0;
  }
  
  .nav-icon {
    font-size: 20px;
  }
}
</style>