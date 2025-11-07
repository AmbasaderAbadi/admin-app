<template>
  <div class="providers-container">
    <!-- Header -->
    <div class="header">
      <h1>Service Providers</h1>
      <button class="filter-button">☰</button>
    </div>

    <!-- Search Bar -->
    <div class="search-bar">
      <input 
        v-model="searchQuery"
        type="text" 
        placeholder="Search by name, service, or email..."
        @input="applyFilters"
      />
      <span class="search-icon">🔍</span>
    </div>

    <!-- Status Filter Buttons -->
    <div class="filter-buttons">
      <button
        :class="['filter-button', { active: selectedStatus === 'all' }]"
        @click="selectedStatus = 'all'"
      >
        All
      </button>
      <button
        :class="['filter-button', { active: selectedStatus === 'active' }]"
        @click="selectedStatus = 'active'"
      >
        Active
      </button>
      <button
        :class="['filter-button', { active: selectedStatus === 'pending' }]"
        @click="selectedStatus = 'pending'"
      >
        Pending
      </button>
      <button
        :class="['filter-button', { active: selectedStatus === 'inactive' }]"
        @click="selectedStatus = 'inactive'"
      >
        Inactive
      </button>
      <button
        :class="['filter-button', { active: selectedStatus === 'suspended' }]"
        @click="selectedStatus = 'suspended'"
      >
        Suspended
      </button>
    </div>

    <!-- Loading & Error States -->
    <div v-if="loading" class="status-message">Loading providers...</div>
    <div v-else-if="error" class="status-message error">{{ error }}</div>

    <!-- Providers List -->
    <div v-else class="providers-list">
      <div 
        v-for="(provider, index) in filteredProviders" 
        :key="provider.id || index" 
        class="provider-card"
      >
        <div class="provider-avatar">
          <img 
            v-if="provider.avatar" 
            :src="provider.avatar" 
            :alt="provider.fullname || 'Provider'"
          />
          <div v-else class="avatar-placeholder">
            {{ (provider.fullname || '')[0]?.toUpperCase() || '?' }}
          </div>
        </div>
        
        <div class="provider-info">
          <div class="provider-name">{{ provider.fullname || '—' }}</div>
          <div class="provider-service">{{ provider.serviceCategories || '—' }}</div>
          <div class="provider-email">{{ provider.email || '—' }}</div>
          <div 
            :class="['provider-status', getNormalizedStatus(provider.status)]"
          >
            {{ getDisplayStatus(provider.status) }}
          </div>
        </div>
        
        <!-- Three-dot menu -->
        <div class="provider-actions" @click.stop>
          <button class="more-options" @click="openMenuIndex = index">
            ⋮
          </button>
          
          <div 
            v-if="openMenuIndex === index" 
            class="dropdown-menu"
            @click.stop
          >
            <button @click="viewDetails(provider)">View Details</button>
          </div>
        </div>
      </div>

      <div v-if="filteredProviders.length === 0" class="no-results">
        No providers found
      </div>
    </div>

    <!-- Add Provider Button -->
    <div class="add-provider-button">
      <button @click="addNewProvider">
        <span>+</span>
      </button>
    </div>
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
        </div>

        <!-- Service Info -->
        <div class="section">
          <h3>🔧 Service Details</h3>
          <div class="detail-row">
            <span class="label">Service Categories:</span>
            <span class="value">{{ selectedProvider.serviceCategories || '—' }}</span>
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
          <div class="detail-row">
            <span class="label">Joined:</span>
            <span class="value">{{ selectedProvider.created_at ? new Date(selectedProvider.created_at).toLocaleString() : '—' }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Last Login:</span>
            <span class="value">{{ selectedProvider.last_login ? new Date(selectedProvider.last_login).toLocaleString() : 'Never' }}</span>
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
          <button class="btn btn-primary" @click="editProvider(selectedProvider)">
            Edit Profile
          </button>
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
          <input v-model="newProvider.serviceCategories" type="text" placeholder="e.g., barber, massage, cleaning" required />
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
          <input v-model="newProvider.workExperience" type="text" placeholder="e.g., 3 years" required />
        </div>

        <div class="form-group">
          <label>Certificate (File) *</label>
          <input 
            ref="certificateInput"
            type="file" 
            accept=".jpg,.jpeg,.png,.pdf" 
            @change="handleFileChange"
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
</template>

<script>
import http from '../api/http';

export default {
  name: 'Providers',
  data() {
    return {
      providers: [],
      searchQuery: '',
      selectedStatus: 'all',
      filteredProviders: [],
      loading: false,
      error: '',
      openMenuIndex: null,

      // 👇 For detail modal
      selectedProvider: null,

      // 👇 For add modal
      showAddModal: false,
      newProvider: {
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
      },
      isSubmitting: false,
      passwordMismatch: false
    };
  },
  async mounted() {
    await this.fetchProviders();
    const handleClickOutside = () => {
      this.openMenuIndex = null;
    };
    document.addEventListener('click', handleClickOutside);
    this._clickHandler = handleClickOutside;
  },
  beforeUnmount() {
    document.removeEventListener('click', this._clickHandler);
  },
  methods: {
    async fetchProviders() {
      this.loading = true;
      this.error = '';
      try {
        const response = await http.get('/users/providers');
        this.providers = Array.isArray(response.data) ? response.data : [];
        this.applyFilters();
      } catch (error) {
        console.error('Error fetching providers:', error);
        this.error = 'Failed to load providers. Please try again later.';
      } finally {
        this.loading = false;
      }
    },
    
    applyFilters() {
      let result = [...this.providers];

      if (this.searchQuery.trim()) {
        const term = this.searchQuery.toLowerCase().trim();
        result = result.filter(provider => 
          (provider.fullname?.toLowerCase().includes(term)) ||
          (provider.serviceCategories?.toLowerCase().includes(term)) ||
          (provider.email?.toLowerCase().includes(term)) ||
          (provider.location?.toLowerCase().includes(term))
        );
      }

      if (this.selectedStatus !== 'all') {
        result = result.filter(provider => {
          const norm = this.getNormalizedStatus(provider.status);
          return norm === this.selectedStatus;
        });
      }

      this.filteredProviders = result;
    },
    
    getNormalizedStatus(status) {
      const s = (status || '').toLowerCase().trim();
      if (['active', 'approved'].includes(s)) return 'active';
      if (['inactive', 'rejected'].includes(s)) return 'inactive';
      if (['pending', 'awaiting'].includes(s)) return 'pending';
      if (['suspended', 'blocked'].includes(s)) return 'suspended';
      return 'unknown';
    },
    
    getDisplayStatus(status) {
      const s = (status || '').toLowerCase().trim();
      if (['active', 'approved'].includes(s)) return 'Active';
      if (['inactive', 'rejected'].includes(s)) return 'Inactive';
      if (['pending', 'awaiting'].includes(s)) return 'Pending';
      if (['suspended', 'blocked'].includes(s)) return 'Suspended';
      return 'Unknown';
    },
    
    viewDetails(provider) {
      this.selectedProvider = provider;
    },

    closeDetailModal() {
      this.selectedProvider = null;
    },

    editProvider(provider) {
      alert(`Edit functionality for ${provider.fullname} will be added soon.`);
      this.closeDetailModal();
    },

    // Add provider methods
    addNewProvider() {
      this.newProvider = {
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
      this.passwordMismatch = false;
      this.showAddModal = true;
    },

    closeModal() {
      this.showAddModal = false;
    },

    handleFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.newProvider.certificate = file;
        this.newProvider.certificateName = file.name;
      }
    },

    async submitNewProvider() {
      if (this.newProvider.password !== this.newProvider.confirmPassword) {
        this.passwordMismatch = true;
        return;
      }
      this.passwordMismatch = false;

      this.isSubmitting = true;
      try {
        const formData = new FormData();
        formData.append('fullname', this.newProvider.fullname.trim());
        formData.append('email', this.newProvider.email.trim());
        formData.append('phonenumber', this.newProvider.phonenumber.trim());
        formData.append('location', this.newProvider.location.trim());
        formData.append('serviceCategories', this.newProvider.serviceCategories.trim());
        formData.append('FIN', this.newProvider.FIN.trim());
        formData.append('password', this.newProvider.password);
        formData.append('workExperience', this.newProvider.workExperience.trim());
        formData.append('role', 'provider');

        if (this.newProvider.certificate) {
          formData.append('certificate', this.newProvider.certificate);
        }

        await http.post('/users/providers', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        await this.fetchProviders();
        this.closeModal();
        alert('Provider added successfully!');
      } catch (e) {
        console.error('Full error:', e);
        if (e.response) {
          console.error('Backend error:', e.response.data);
          alert(`Registration failed: ${e.response.data?.message || 'Invalid data'}`);
        } else if (e.request) {
          alert('Network error. Please check your connection.');
        } else {
          alert('Request setup failed.');
        }
      } finally {
        this.isSubmitting = false;
      }
    },

    // Utility methods for detail modal
    isImage(url) {
      if (!url) return false;
      const ext = url.split('.').pop().toLowerCase();
      return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
    },

    getFileName(url) {
      if (!url) return 'No file';
      return url.split('/').pop() || 'Untitled';
    }
  },
  watch: {
    searchQuery() {
      this.applyFilters();
    },
    selectedStatus() {
      this.applyFilters();
    }
  }
};
</script>

<style scoped>
/* Modal Overlay */
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
  width: 90%;
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

/* Add Provider Form Styles */
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

/* Your existing styles */
.providers-container {
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
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e5ff;
}

.header h1 {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

.filter-button {
  background: none;
  border: none;
  font-size: 15px;
  cursor: pointer;
  color: #666;
}

.search-bar {
  position: relative;
  margin-bottom: 20px;
}

.search-bar input {
  width: 100%;
  padding: 12px 20px;
  border-radius: 8px;
  border: 1px solid #e0e5ff;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s ease;
}

.search-bar input:focus {
  border-color: #5a6cff;
}

.search-icon {
  position: absolute;
  left: 5px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
}

.filter-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-buttons .filter-button {
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid #e0e5ff;
  background-color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-buttons .filter-button.active {
  background-color: #4285f4;
  color: white;
  border-color: #4285f4;
}

.status-message {
  text-align: center;
  color: gray;
  padding: 20px;
}

.status-message.error {
  color: red;
}

.no-results {
  text-align: center;
  color: var(--muted);
  padding: 20px;
}

.providers-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.provider-card {
  background-color: white;
  border-radius: 12px;
  padding: 15px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  position: relative;
}

.provider-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 15px;
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
  font-size: 24px;
  font-weight: bold;
  color: #5a6cff;
}

.provider-info {
  flex-grow: 1;
}

.provider-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 4px;
}

.provider-service {
  font-size: 14px;
  color: #666;
  margin-bottom: 3px;
}

.provider-email {
  font-size: 13px;
  color: #555;
  margin-bottom: 4px;
  font-style: italic;
}

.provider-status {
  font-size: 13px;
  font-weight: 500;
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
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
  display: flex;
  align-items: center;
}

.more-options {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  padding: 5px;
  border-radius: 50%;
}

.more-options:hover {
  background-color: #f0f0f0;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 30px;
  background: white;
  border: 1px solid #e0e5ff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 1000;
  min-width: 140px;
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

.add-provider-button {
  position: fixed;
  bottom: 30px;
  right: 30px;
}

.add-provider-button button {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #4285f4;
  color: white;
  border: none;
  font-size: 30px;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.add-provider-button button:hover {
  background-color: #3367d6;
  transform: scale(1.05);
}
</style>