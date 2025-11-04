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
            :alt="provider.name"
          />
          <div v-else class="avatar-placeholder">
            {{ provider.name?.charAt(0).toUpperCase() || '?' }}
          </div>
        </div>
        
        <div class="provider-info">
          <div class="provider-name">{{ provider.name || '—' }}</div>
          <div class="provider-service">{{ provider.service || '—' }}</div>
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
</template>

<script>
import http from '../api/http';

export default {
  name: 'Providers',
  data() {
    return {
      providers: [],
      searchQuery: '',
      selectedStatus: 'all', // ✅ new: track selected status filter
      filteredProviders: [],
      loading: false,
      error: '',
      openMenuIndex: null
    };
  },
  async mounted() {
    await this.fetchProviders();
    document.addEventListener('click', () => {
      this.openMenuIndex = null;
    });
  },
  beforeUnmount() {
    document.removeEventListener('click', () => {
      this.openMenuIndex = null;
    });
  },
  methods: {
    async fetchProviders() {
      this.loading = true;
      this.error = '';
      try {
        // ✅ Fetches ALL providers (no status filter on backend)
        const response = await http.get('/users/providers');
        this.providers = Array.isArray(response.data) ? response.data : [];
        this.applyFilters(); // Apply filters after fetch
      } catch (error) {
        console.error('Error fetching providers:', error);
        this.error = 'Failed to load providers. Please try again later.';
      } finally {
        this.loading = false;
      }
    },
    
    applyFilters() {
      let result = [...this.providers];

      // 🔍 Search filter
      if (this.searchQuery.trim()) {
        const term = this.searchQuery.toLowerCase().trim();
        result = result.filter(provider => 
          (provider.name?.toLowerCase().includes(term)) ||
          (provider.service?.toLowerCase().includes(term)) ||
          (provider.email?.toLowerCase().includes(term)) ||
          (provider.city && provider.city.toLowerCase().includes(term))
        );
      }

      // ✅ Status filter
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
      const details = `
📋 Full Provider Details

ID: ${provider.id || 'N/A'}
Name: ${provider.name || 'N/A'}
Email: ${provider.email || 'N/A'}
Service: ${provider.service || 'N/A'}
Status: ${this.getDisplayStatus(provider.status)}
City: ${provider.city || 'N/A'}
Phone: ${provider.phone || 'N/A'}
Joined: ${provider.created_at ? new Date(provider.created_at).toLocaleString() : 'N/A'}
      `;
      alert(details);
      this.openMenuIndex = null;
    },

    addNewProvider() {
      console.log('Add new provider clicked');
    }
  },
  // Watch for changes in search or status
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
/* ✅ Your UI + new filter buttons */
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

/* ✅ NEW: Status Filter Buttons */
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