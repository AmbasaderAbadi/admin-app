<template>
  <div class="services-container">
    <!-- Category Detail Header (when viewing sub-services) -->
    <div v-if="selectedCategory" class="category-detail-header">
      <button class="back-btn" @click="goBackToCategories">
        ← Back to Categories
      </button>
      <h1>{{ selectedCategory.name }} - Sub Services</h1>
      <button class="add-btn" @click="showAddSubServiceModal = true">
        <span>+</span> Add Sub Service
      </button>
    </div>

    <!-- Main Header (category list view) -->
    <div v-else class="header">
      <h1>Service Categories</h1>
      <button class="add-btn" @click="showAddModal = true">
        <span>+</span> Add New Category
      </button>
    </div>

    <!-- Search Bar -->
    <div class="search-bar">
      <input 
        v-model="searchQuery"
        type="text" 
        :placeholder="selectedCategory ? 'Search sub-services...' : 'Search categories...'"
        @input="filterItems"
      />
    </div>

    <!-- Loading & Error States -->
    <div v-if="loading" class="status-message">Loading {{ selectedCategory ? 'sub-services' : 'categories' }}...</div>
    <div v-else-if="error" class="status-message error">{{ error }}</div>

    <!-- Category List View -->
    <div v-else-if="!selectedCategory" class="services-list">
      <div 
        v-for="(category, index) in displayedCategories" 
        :key="category._id" 
        class="service-card"
        @click="viewCategoryDetails(category)"
      >
        <div class="service-info">
          <div class="service-name">{{ category.name }}</div>
          <div class="service-description">{{ category.description || 'No description' }}</div>
          <div class="service-stats">
            <span>Sub Services: {{ category.subCategories?.length || 0 }}</span>
            <span>Providers: {{ category.providerCount || 0 }}</span>
            <span>Created: {{ formatDate(category.createdAt) }}</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="service-actions" @click.stop>
          <button class="more-options" @click="toggleMenu(index)">
            ⋮
          </button>
          
          <div 
            v-if="openMenuIndex === index" 
            class="dropdown-menu"
            @click.stop
          >
            <button @click="editCategory(category)">
              ✏️ Edit
            </button>
            <button class="delete-btn" @click="confirmDelete(category)">
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>

      <div v-if="displayedCategories.length === 0" class="no-results">
        No service categories found
      </div>
    </div>

    <!-- Sub-Service List View -->
    <div v-else class="subservices-list">
      <div 
        v-for="(subService, index) in displayedSubServices" 
        :key="subService._id" 
        class="subservice-card"
        @click="viewSubServiceDetails(subService)"
      >
        <div class="subservice-info">
          <div class="subservice-name">{{ subService.name }}</div>
          <div class="subservice-description">{{ subService.description || 'No description' }}</div>
          <div class="subservice-stats">
            <span>Created: {{ formatDate(subService.createdAt) }}</span>
            <span>Providers: {{ subService.providerCount || 0 }}</span>
            <span>Bookings: {{ subService.bookingCount || 0 }}</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="subservice-actions" @click.stop>
          <button class="more-options" @click="toggleSubServiceMenu(index)">
            ⋮
          </button>
          
          <div 
            v-if="openSubServiceMenuIndex === index" 
            class="dropdown-menu"
            @click.stop
          >
            <button @click="editSubService(subService)">
              ✏️ Edit
            </button>
            <button class="delete-btn" @click="confirmDeleteSubService(subService)">
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>

      <div v-if="displayedSubServices.length === 0" class="no-results">
        No sub-services found for this category
      </div>
    </div>

    <!-- Add Category Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click="closeAddModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Add New Service Category</h2>
          <button class="close-btn" @click="closeAddModal">×</button>
        </div>

        <form @submit.prevent="addCategory" class="add-form">
          <div class="form-group">
            <label>Category Name *</label>
            <input v-model="newCategory.name" type="text" required />
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea v-model="newCategory.description" rows="3"></textarea>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="closeAddModal">Cancel</button>
            <button type="submit" class="btn-submit" :disabled="isSubmitting">
              {{ isSubmitting ? 'Adding...' : 'Add Category' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Add Sub-Service Modal -->
    <div v-if="showAddSubServiceModal" class="modal-overlay" @click="closeAddSubServiceModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Add Sub-Service to {{ selectedCategory?.name }}</h2>
          <button class="close-btn" @click="closeAddSubServiceModal">×</button>
        </div>

        <form @submit.prevent="addSubService" class="add-form">
          <div class="form-group">
            <label>Sub-Service Name *</label>
            <input v-model="newSubService.name" type="text" required />
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea v-model="newSubService.description" rows="3"></textarea>
          </div>

          <div class="form-group">
            <label>Price</label>
            <input v-model.number="newSubService.price" type="number" min="0" step="0.01" />
          </div>

          <div class="form-group">
            <label>Duration (minutes)</label>
            <input v-model.number="newSubService.duration" type="number" min="1" />
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="closeAddSubServiceModal">Cancel</button>
            <button type="submit" class="btn-submit" :disabled="isSubmitting">
              {{ isSubmitting ? 'Adding...' : 'Add Sub-Service' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Category Modal -->
    <div v-if="editingCategory" class="modal-overlay" @click="cancelEdit">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Edit Service Category</h2>
          <button class="close-btn" @click="cancelEdit">×</button>
        </div>

        <form @submit.prevent="updateCategory" class="add-form">
          <div class="form-group">
            <label>Category Name *</label>
            <input v-model="editingCategory.name" type="text" required />
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea v-model="editingCategory.description" rows="3"></textarea>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="cancelEdit">Cancel</button>
            <button type="submit" class="btn-submit" :disabled="isSubmitting">
              {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Sub-Service Modal -->
    <div v-if="editingSubService" class="modal-overlay" @click="cancelEditSubService">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Edit Sub-Service</h2>
          <button class="close-btn" @click="cancelEditSubService">×</button>
        </div>

        <form @submit.prevent="updateSubService" class="add-form">
          <div class="form-group">
            <label>Sub-Service Name *</label>
            <input v-model="editingSubService.name" type="text" required />
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea v-model="editingSubService.description" rows="3"></textarea>
          </div>

          <div class="form-group">
            <label>Price</label>
            <input v-model.number="editingSubService.price" type="number" min="0" step="0.01" />
          </div>

          <div class="form-group">
            <label>Duration (minutes)</label>
            <input v-model.number="editingSubService.duration" type="number" min="1" />
          </div>

          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="cancelEditSubService">Cancel</button>
            <button type="submit" class="btn-submit" :disabled="isSubmitting">
              {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Sub-Service Detail Modal -->
    <div v-if="selectedSubService" class="modal-overlay" @click="closeSubServiceDetailModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ selectedSubService.name }} Details</h2>
          <button class="close-btn" @click="closeSubServiceDetailModal">×</button>
        </div>

        <div class="detail-body">
          <!-- Basic Info -->
          <div class="section">
            <h3>📋 Sub-Service Information</h3>
            <div class="detail-row">
              <span class="label">Name:</span>
              <span class="value">{{ selectedSubService.name || '—' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Description:</span>
              <span class="value">{{ selectedSubService.description || '—' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Price:</span>
              <span class="value">${{ selectedSubService.price || '0.00' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Duration:</span>
              <span class="value">{{ selectedSubService.duration || '—' }} mins</span>
            </div>
            <div class="detail-row">
              <span class="label">Created:</span>
              <span class="value">{{ formatDate(selectedSubService.createdAt) }}</span>
            </div>
          </div>

          <!-- Providers in this sub-service -->
          <div class="section">
            <h3>🔧 Service Providers ({{ selectedSubService.providers?.length || 0 }})</h3>
            <div class="providers-list" v-if="selectedSubService.providers && selectedSubService.providers.length > 0">
              <div 
                v-for="provider in selectedSubService.providers" 
                :key="provider._id"
                class="provider-in-service"
              >
                <div class="provider-name">{{ provider.fullname }}</div>
                <div class="provider-status">{{ provider.status }}</div>
              </div>
            </div>
            <div v-else class="no-data-message">
              No service providers offering this sub-service yet.
            </div>
          </div>

          <!-- Bookings for this sub-service -->
          <div class="section">
            <h3>📅 Bookings ({{ selectedSubService.bookings?.length || 0 }})</h3>
            <div class="bookings-list" v-if="selectedSubService.bookings && selectedSubService.bookings.length > 0">
              <div 
                v-for="booking in selectedSubService.bookings" 
                :key="booking._id"
                class="booking-in-service"
              >
                <div class="booking-info">
                  <div class="booking-customer">{{ booking.customer?.fullname || '—' }}</div>
                  <div class="booking-date">{{ formatDate(booking.bookingDate) }}</div>
                  <div class="booking-status">{{ booking.status }}</div>
                </div>
              </div>
            </div>
            <div v-else class="no-data-message">
              No bookings for this sub-service yet.
            </div>
          </div>

          <!-- Actions -->
          <div class="modal-footer">
            <button class="btn btn-secondary" @click="closeSubServiceDetailModal">Close</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="deleteConfirm" class="modal-overlay" @click="cancelDelete">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Delete {{ deleteConfirm.type === 'category' ? 'Category' : 'Sub-Service' }}</h2>
          <button class="close-btn" @click="cancelDelete">×</button>
        </div>

        <div class="modal-body">
          <p>Are you sure you want to delete "{{ deleteConfirm.item.name }}"?</p>
          <p v-if="deleteConfirm.type === 'category'" class="warning-text">
            This will remove all sub-services and providers in this category.
          </p>
          <p v-else class="warning-text">
            This will remove this sub-service from the category.
          </p>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="cancelDelete">Cancel</button>
          <button class="btn btn-danger" @click="performDelete">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onBeforeUnmount } from 'vue';
import http from '../../../core/api/http';

// Reactive State
const categories = ref([]);
const selectedCategory = ref(null);
const subServices = ref([]);
const selectedSubService = ref(null);
const searchQuery = ref('');
const loading = ref(false);
const error = ref('');
const openMenuIndex = ref(null);
const openSubServiceMenuIndex = ref(null);
const editingCategory = ref(null);
const editingSubService = ref(null);
const deleteConfirm = ref(null);
const isSubmitting = ref(false);

// Form Data
const newCategory = ref({ name: '', description: '' });
const newSubService = ref({ name: '', description: '', price: '', duration: '' });

// Modal State
const showAddModal = ref(false);
const showAddSubServiceModal = ref(false);

// Fetch Data
onMounted(() => {
  fetchCategories();
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});

const handleClickOutside = () => {
  openMenuIndex.value = null;
  openSubServiceMenuIndex.value = null;
};

const fetchCategories = async () => {
  loading.value = true;
  error.value = '';
  try {
    // ✅ Use CORRECT endpoint: /infinity-booking/categories
    const response = await http.get('/infinity-booking/categories');
    const rawCategories = Array.isArray(response.data) ? response.data : [];

    categories.value = rawCategories.map(cat => ({
      ...cat,
      subCategories: cat.subCategories || [],
      providerCount: cat.providerCount || 0
    }));

    // If viewing a specific category, refresh its sub-services
    if (selectedCategory.value) {
      const updatedCategory = categories.value.find(c => c._id === selectedCategory.value._id);
      if (updatedCategory) {
        selectedCategory.value = updatedCategory;
        fetchSubServices(updatedCategory._id);
      }
    }
  } catch (err) {
    console.error('Failed to fetch categories:', err);
    error.value = err?.response?.data?.message || 'Failed to load service categories. Please try again later.';
    categories.value = [];
  } finally {
    loading.value = false;
  }
};

const fetchSubServices = async (categoryId) => {
  loading.value = true;
  error.value = '';
  try {
    // ✅ Use CORRECT endpoint: /infinity-booking/categories/{id}/subcategories
    const response = await http.get(`/infinity-booking/categories/${categoryId}/subcategories`);
    subServices.value = Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    console.error('Failed to fetch sub-services:', err);
    error.value = err?.response?.data?.message || 'Failed to load sub-services. Please try again.';
    subServices.value = [];
  } finally {
    loading.value = false;
  }
};

// Navigation
const viewCategoryDetails = (category) => {
  selectedCategory.value = category;
  fetchSubServices(category._id);
};

const goBackToCategories = () => {
  selectedCategory.value = null;
  subServices.value = [];
  searchQuery.value = '';
};

// View Sub-Service Details
const viewSubServiceDetails = async (subService) => {
  selectedSubService.value = subService;
  
  // Fetch detailed information for this sub-service
  try {
    // ✅ Use CORRECT endpoint: /infinity-booking/services/{id}/details
    const response = await http.get(`/infinity-booking/services/${subService._id}/details`);
    selectedSubService.value = {
      ...subService,
      ...response.data
    };
  } catch (err) {
    console.error('Failed to fetch sub-service details:', err);
    // Use basic data if details endpoint fails
    selectedSubService.value = subService;
  }
};

// Filtering
const displayedCategories = computed(() => {
  if (!searchQuery.value.trim()) return categories.value;
  
  const term = searchQuery.value.toLowerCase().trim();
  return categories.value.filter(cat => 
    (cat.name || '').toLowerCase().includes(term) ||
    (cat.description && cat.description.toLowerCase().includes(term))
  );
});

const displayedSubServices = computed(() => {
  if (!searchQuery.value.trim()) return subServices.value;
  
  const term = searchQuery.value.toLowerCase().trim();
  return subServices.value.filter(sub => 
    (sub.name || '').toLowerCase().includes(term) ||
    (sub.description && sub.description.toLowerCase().includes(term))
  );
});

const filterItems = () => {
  // Computed properties handle filtering
};

// Category CRUD
const addCategory = async () => {
  if (!newCategory.value.name.trim()) {
    alert('Category name is required!');
    return;
  }

  isSubmitting.value = true;
  try {
    // ✅ Use CORRECT endpoint: /infinity-booking/categories
    const response = await http.post('/infinity-booking/categories', {
      name: newCategory.value.name.trim(),
      description: newCategory.value.description?.trim() || ''
    });

    categories.value.push({
      ...response.data,
      subCategories: [],
      providerCount: 0
    });
    
    closeAddModal();
    alert('Category added successfully!');
  } catch (err) {
    console.error('Add category error:', err);
    alert(err?.response?.data?.message || 'Failed to add category. Please try again.');
  } finally {
    isSubmitting.value = false;
  }
};

const updateCategory = async () => {
  if (!editingCategory.value.name.trim()) {
    alert('Category name is required!');
    return;
  }

  isSubmitting.value = true;
  try {
    // ✅ Use CORRECT endpoint: /infinity-booking/categories/{id}
    const response = await http.put(`/infinity-booking/categories/${editingCategory.value._id}`, {
      name: editingCategory.value.name.trim(),
      description: editingCategory.value.description?.trim() || ''
    });

    const index = categories.value.findIndex(c => c._id === editingCategory.value._id);
    if (index !== -1) {
      categories.value[index] = {
        ...response.data,
        subCategories: categories.value[index].subCategories || []
      };
      
      if (selectedCategory.value?._id === editingCategory.value._id) {
        selectedCategory.value = categories.value[index];
      }
    }

    cancelEdit();
    alert('Category updated successfully!');
  } catch (err) {
    console.error('Update category error:', err);
    alert(err?.response?.data?.message || 'Failed to update category. Please try again.');
  } finally {
    isSubmitting.value = false;
  }
};

// Sub-Service CRUD
const addSubService = async () => {
  if (!newSubService.value.name.trim()) {
    alert('Sub-service name is required!');
    return;
  }

  isSubmitting.value = true;
  try {
    // ✅ Use CORRECT endpoint: /infinity-booking/categories/{id}/subcategories
    const response = await http.post(`/infinity-booking/categories/${selectedCategory.value._id}/subcategories`, {
      name: newSubService.value.name.trim(),
      description: newSubService.value.description?.trim() || '',
      price: parseFloat(newSubService.value.price) || 0,
      duration: parseInt(newSubService.value.duration) || 30
    });

    subServices.value.push(response.data);
    
    // Update category in main list
    const categoryIndex = categories.value.findIndex(c => c._id === selectedCategory.value._id);
    if (categoryIndex !== -1) {
      categories.value[categoryIndex] = {
        ...categories.value[categoryIndex],
        subCategories: [...(categories.value[categoryIndex].subCategories || []), response.data]
      };
    }

    closeAddSubServiceModal();
    alert('Sub-service added successfully!');
  } catch (err) {
    console.error('Add sub-service error:', err);
    alert(err?.response?.data?.message || 'Failed to add sub-service. Please try again.');
  } finally {
    isSubmitting.value = false;
  }
};

const updateSubService = async () => {
  if (!editingSubService.value.name.trim()) {
    alert('Sub-service name is required!');
    return;
  }

  isSubmitting.value = true;
  try {
    // ✅ Use CORRECT endpoint: /infinity-booking/categories/subcategories/{subId}
    const response = await http.put(`/infinity-booking/categories/subcategories/${editingSubService.value._id}`, {
      name: editingSubService.value.name.trim(),
      description: editingSubService.value.description?.trim() || '',
      price: parseFloat(editingSubService.value.price) || 0,
      duration: parseInt(editingSubService.value.duration) || 30
    });

    const index = subServices.value.findIndex(s => s._id === editingSubService.value._id);
    if (index !== -1) {
      subServices.value[index] = response.data;
    }

    // Update in categories list
    const categoryIndex = categories.value.findIndex(c => c._id === selectedCategory.value._id);
    if (categoryIndex !== -1) {
      const subIndex = categories.value[categoryIndex].subCategories.findIndex(s => s._id === editingSubService.value._id);
      if (subIndex !== -1) {
        categories.value[categoryIndex].subCategories[subIndex] = response.data;
      }
    }

    cancelEditSubService();
    alert('Sub-service updated successfully!');
  } catch (err) {
    console.error('Update sub-service error:', err);
    alert(err?.response?.data?.message || 'Failed to update sub-service. Please try again.');
  } finally {
    isSubmitting.value = false;
  }
};

// Delete Operations
const confirmDelete = (item, type) => {
  deleteConfirm.value = { item, type };
};

const confirmDeleteSubService = (subService) => {
  confirmDelete(subService, 'subservice');
};

const performDelete = async () => {
  isSubmitting.value = true;
  try {
    if (deleteConfirm.value.type === 'category') {
      // ✅ Use CORRECT endpoint: /infinity-booking/categories/{id}
      await http.delete(`/infinity-booking/categories/${deleteConfirm.value.item._id}`);
      categories.value = categories.value.filter(c => c._id !== deleteConfirm.value.item._id);
      
      if (selectedCategory.value?._id === deleteConfirm.value.item._id) {
        goBackToCategories();
      }
    } else {
      // ✅ Use CORRECT endpoint: /infinity-booking/categories/subcategories/{id}
      await http.delete(`/infinity-booking/categories/subcategories/${deleteConfirm.value.item._id}`);
      
      subServices.value = subServices.value.filter(s => s._id !== deleteConfirm.value.item._id);
      
      const categoryIndex = categories.value.findIndex(c => c._id === selectedCategory.value._id);
      if (categoryIndex !== -1) {
        categories.value[categoryIndex] = {
          ...categories.value[categoryIndex],
          subCategories: categories.value[categoryIndex].subCategories.filter(s => s._id !== deleteConfirm.value.item._id)
        };
      }
    }
    
    cancelDelete();
    alert(`${deleteConfirm.value.type === 'category' ? 'Category' : 'Sub-service'} deleted successfully!`);
  } catch (err) {
    console.error('Delete error:', err);
    alert(err?.response?.data?.message || `Failed to delete ${deleteConfirm.value.type}. Please try again.`);
  } finally {
    isSubmitting.value = false;
  }
};

// Menu Toggles
const toggleMenu = (index) => {
  openMenuIndex.value = openMenuIndex.value === index ? null : index;
};

const toggleSubServiceMenu = (index) => {
  openSubServiceMenuIndex.value = openSubServiceMenuIndex.value === index ? null : index;
};

// Modal Handlers
const closeAddModal = () => {
  showAddModal.value = false;
  newCategory.value = { name: '', description: '' };
};

const closeAddSubServiceModal = () => {
  showAddSubServiceModal.value = false;
  newSubService.value = { name: '', description: '', price: '', duration: '' };
};

const editCategory = (category) => {
  editingCategory.value = { ...category };
};

const editSubService = (subService) => {
  editingSubService.value = { ...subService };
};

const cancelEdit = () => {
  editingCategory.value = null;
};

const cancelEditSubService = () => {
  editingSubService.value = null;
};

const cancelDelete = () => {
  deleteConfirm.value = null;
};

const closeSubServiceDetailModal = () => {
  selectedSubService.value = null;
};

// Utility Functions
const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString();
};
</script>

<style scoped>
/* ... your existing styles ... */
.services-container {
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
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e5ff;
}

.header h1 {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

.add-btn {
  background-color: #4285f4;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.add-btn:hover {
  background-color: #3367d6;
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
  transition: border-color 0.2s;
}

.search-bar input:focus {
  border-color: #5a6cff;
}

.status-message {
  text-align: center;
  padding: 20px;
  color: #666;
}

.status-message.error {
  color: #ff5252;
}

.services-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.service-card {
  background-color: white;
  border-radius: 12px;
  padding: 15px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  position: relative;
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.service-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.service-info {
  flex-grow: 1;
  min-width: 0;
}

.service-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
}

.service-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
  word-break: break-word;
}

.service-stats {
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: #888;
}

.service-actions {
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

/* Category Detail Header */
.category-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e0e5ff;
}

.back-btn {
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
}

.back-btn:hover {
  background-color: #e0e0e0;
}

/* Sub-Services List */
.subservices-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.subservice-card {
  background-color: white;
  border-radius: 12px;
  padding: 15px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  position: relative;
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.subservice-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.subservice-info {
  flex-grow: 1;
  min-width: 0;
}

.subservice-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
}

.subservice-description {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
  word-break: break-word;
}

.subservice-stats {
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: #888;
}

.subservice-actions {
  position: absolute;
  top: 10px;
  right: 10px;
}

/* Modal styles */
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
  max-width: 700px;
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

.providers-list,
.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.provider-in-service,
.booking-in-service {
  background: #f0f0f0;
  border-radius: 8px;
  padding: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.provider-name,
.booking-customer {
  font-weight: 500;
  color: #333;
}

.provider-status,
.booking-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  background: #e8f5e8;
  color: #00c853;
}

.booking-date {
  font-size: 12px;
  color: #666;
}

.no-data-message {
  font-size: 14px;
  color: #888;
  padding: 12px;
  text-align: center;
  font-style: italic;
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

  .service-card,
  .subservice-card {
    padding: 12px;
  }

  .service-name,
  .subservice-name {
    font-size: 16px;
  }

  .add-btn {
    width: 100%;
    text-align: center;
    padding: 10px;
  }

  .category-detail-header {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .service-info,
  .subservice-info {
    width: 100%;
    margin-right: 0;
  }

  .service-actions,
  .subservice-actions {
    position: static;
    align-self: flex-end;
  }

  .modal-content {
    width: 95%;
    margin: 10px;
  }

  .form-group input,
  .form-group textarea {
    font-size: 14px;
    padding: 8px 12px;
  }

  .btn-cancel,
  .btn-submit {
    padding: 8px 16px;
    font-size: 13px;
  }
}
</style>