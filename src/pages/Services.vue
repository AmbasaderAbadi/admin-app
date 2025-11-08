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
            <span>Sub Services: {{ category.subServices?.length || 0 }}</span>
            <span>Providers: {{ category.providerCount || 0 }}</span>
            <span>Created: {{ formatDate(category.createdAt) }}</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="service-actions">
          <button class="edit-btn" @click.stop="editCategory(category)">
            ✏️ Edit
          </button>
          <button class="delete-btn" @click.stop="confirmDelete(category)">
            🗑️ Delete
          </button>
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
      >
        <div class="subservice-info">
          <div class="subservice-name">{{ subService.name }}</div>
          <div class="subservice-description">{{ subService.description || 'No description' }}</div>
          <div class="subservice-stats">
            <span>Created: {{ formatDate(subService.createdAt) }}</span>
          </div>
        </div>

        <!-- Sub-Service Action Buttons -->
        <div class="subservice-actions">
          <button class="edit-btn" @click="editSubService(subService)">
            ✏️ Edit
          </button>
          <button class="delete-btn" @click="confirmDeleteSubService(subService)">
            🗑️ Delete
          </button>
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

          <div class="form-actions">
            <button type="button" class="btn-cancel" @click="cancelEditSubService">Cancel</button>
            <button type="submit" class="btn-submit" :disabled="isSubmitting">
              {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
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
import { ref, onMounted, computed } from 'vue';
import http from '../api/http';

// Reactive State
const categories = ref([]);
const selectedCategory = ref(null);
const subServices = ref([]);
const searchQuery = ref('');
const loading = ref(false);
const error = ref('');
const showAddModal = ref(false);
const showAddSubServiceModal = ref(false);
const editingCategory = ref(null);
const editingSubService = ref(null);
const deleteConfirm = ref(null);
const isSubmitting = ref(false);

// Form Data
const newCategory = ref({ name: '', description: '' });
const newSubService = ref({ name: '', description: '' });

// Fetch Data
onMounted(() => {
  fetchCategories();
});

const fetchCategories = async () => {
  loading.value = true;
  error.value = '';
  try {
    const response = await http.get('/categories');
    
    // Ensure categories have subServices array
    categories.value = Array.isArray(response.data) ? response.data.map(cat => ({
      ...cat,
      subServices: cat.subServices || []
    })) : [];
    
    // Update selectedCategory if it exists
    if (selectedCategory.value) {
      const updatedCategory = categories.value.find(c => c._id === selectedCategory.value._id);
      if (updatedCategory) {
        selectedCategory.value = updatedCategory;
        // Re-fetch sub-services to ensure they're up-to-date
        fetchSubServices(updatedCategory._id);
      }
    }
  } catch (err) {
    console.error('Failed to fetch categories:', err);
    handleError(err);
  } finally {
    loading.value = false;
  }
};

const fetchSubServices = async (categoryId) => {
  loading.value = true;
  error.value = '';
  try {
    const response = await http.get(`/categories/${categoryId}/subcategories`);
    subServices.value = Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    console.error('Failed to fetch sub-services:', err);
    handleError(err);
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
    const response = await http.post('/categories', {
      name: newCategory.value.name.trim(),
      description: newCategory.value.description?.trim() || ''
    });

    // Add to categories list
    categories.value.push({
      ...response.data,
      subServices: []
    });
    
    closeAddModal();
    alert('Category added successfully!');
  } catch (err) {
    console.error('Error adding category:', err);
    handleError(err);
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
    const response = await http.put(`/categories/${editingCategory.value._id}`, {
      name: editingCategory.value.name.trim(),
      description: editingCategory.value.description?.trim() || ''
    });

    // Update in categories list
    const index = categories.value.findIndex(c => c._id === editingCategory.value._id);
    if (index !== -1) {
      categories.value[index] = {
        ...response.data,
        subServices: categories.value[index].subServices || []
      };
      
      // Update selectedCategory if it's the one being edited
      if (selectedCategory.value?._id === editingCategory.value._id) {
        selectedCategory.value = categories.value[index];
      }
    }

    cancelEdit();
    alert('Category updated successfully!');
  } catch (err) {
    console.error('Error updating category:', err);
    handleError(err);
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
    const response = await http.post(`/categories/${selectedCategory.value._id}/subcategories`, {
      name: newSubService.value.name.trim(),
      description: newSubService.value.description?.trim() || ''
    });

    // Add to subServices list
    subServices.value.push(response.data);
    
    // Also update the category in categories list
    const categoryIndex = categories.value.findIndex(c => c._id === selectedCategory.value._id);
    if (categoryIndex !== -1) {
      categories.value[categoryIndex] = {
        ...categories.value[categoryIndex],
        subServices: [...(categories.value[categoryIndex].subServices || []), response.data]
      };
    }

    closeAddSubServiceModal();
    alert('Sub-service added successfully!');
  } catch (err) {
    console.error('Error adding sub-service:', err);
    handleError(err);
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
    // ✅ Use correct endpoint: /infinity-booking/categories/subcategories/{subId}
    const response = await http.put(`/categories/subcategories/${editingSubService.value._id}`, {
      name: editingSubService.value.name.trim(),
      description: editingSubService.value.description?.trim() || ''
    });

    // Update in subServices list
    const index = subServices.value.findIndex(s => s._id === editingSubService.value._id);
    if (index !== -1) {
      subServices.value[index] = response.data;
    }

    // Also update in categories list
    const categoryIndex = categories.value.findIndex(c => c._id === selectedCategory.value._id);
    if (categoryIndex !== -1) {
      const subServiceIndex = categories.value[categoryIndex].subServices.findIndex(s => s._id === editingSubService.value._id);
      if (subServiceIndex !== -1) {
        categories.value[categoryIndex].subServices[subServiceIndex] = response.data;
      }
    }

    cancelEditSubService();
    alert('Sub-service updated successfully!');
  } catch (err) {
    console.error('Error updating sub-service:', err);
    handleError(err);
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
      await http.delete(`/categories/${deleteConfirm.value.item._id}`);
      categories.value = categories.value.filter(c => c._id !== deleteConfirm.value.item._id);
      if (selectedCategory.value?._id === deleteConfirm.value.item._id) {
        goBackToCategories();
      }
    } else {
      // ✅ Use correct endpoint: /infinity-booking/categories/subcategories/{subId}
      await http.delete(`/categories/subcategories/${deleteConfirm.value.item._id}`);
      
      // ✅ Remove from subServices list immediately (optimistic UI)
      subServices.value = subServices.value.filter(s => s._id !== deleteConfirm.value.item._id);
      
      // ✅ Also remove from categories list immediately
      const categoryIndex = categories.value.findIndex(c => c._id === selectedCategory.value._id);
      if (categoryIndex !== -1) {
        categories.value[categoryIndex] = {
          ...categories.value[categoryIndex],
          subServices: categories.value[categoryIndex].subServices.filter(s => s._id !== deleteConfirm.value.item._id)
        };
      }
      
      // ✅ Show success message immediately
      cancelDelete();
      alert('Sub-service deleted successfully!');
    }
  } catch (err) {
    console.error('Error deleting item:', err);
    handleError(err);
  } finally {
    isSubmitting.value = false;
  }
};

// Modal Handlers
const closeAddModal = () => {
  showAddModal.value = false;
  newCategory.value = { name: '', description: '' };
};

const closeAddSubServiceModal = () => {
  showAddSubServiceModal.value = false;
  newSubService.value = { name: '', description: '' };
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

// Utility Functions
const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString();
};

const handleError = (err) => {
  let errorMessage = 'An error occurred. Please try again.';
  if (err.response?.data?.message) {
    errorMessage = err.response.data.message;
  } else if (err.response?.status === 400) {
    errorMessage = 'Invalid input. Please check your data.';
  } else if (err.response?.status === 500) {
    errorMessage = 'Server error. Please try again later.';
  } else if (err.request) {
    errorMessage = 'Network error. Please check your connection.';
  }
  error.value = errorMessage;
};
</script>

<style scoped>
/* ... your existing styles ... */

.services-container {
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
  transition: border-color 0.2s ease;
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
  display: flex;
  gap: 8px;
}

.edit-btn,
.delete-btn {
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.edit-btn {
  background-color: #4285f4;
  color: white;
}

.edit-btn:hover {
  background-color: #3367d6;
}

.delete-btn {
  background-color: #ff5252;
  color: white;
}

.delete-btn:hover {
  background-color: #ff3333;
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
  display: flex;
  gap: 8px;
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
  width: 90%;
  max-width: 500px;
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

.modal-body {
  padding: 20px;
  font-size: 16px;
}

.warning-text {
  color: #ff5252;
  font-weight: 500;
  margin-top: 10px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #e0e5ff;
  margin-top: 10px;
}

.btn-secondary {
  background: #eee;
  border: none;
  color: #333;
}

.btn-secondary:hover {
  background: #ddd;
}

.btn-danger {
  background: #ff5252;
  color: white;
  border: none;
}

.btn-danger:hover {
  background: #ff3333;
}

/* Responsive */
@media (max-width: 768px) {
  .services-container {
    padding: 12px;
  }
  
  .header {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  
  .add-btn {
    width: 100%;
    text-align: center;
    padding: 10px;
  }
  
  .search-bar input {
    padding: 10px 16px;
    font-size: 15px;
  }
  
  .service-card {
    flex-direction: column;
    align-items: flex-start;
    padding: 12px;
  }
  
  .service-info {
    width: 100%;
    margin-bottom: 10px;
  }
  
  .service-stats {
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .service-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .category-detail-header {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
  
  .subservice-card {
    flex-direction: column;
    align-items: flex-start;
    padding: 12px;
  }
  
  .subservice-info {
    width: 100%;
    margin-bottom: 10px;
  }
  
  .subservice-stats {
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .subservice-actions {
    width: 100%;
    justify-content: space-between;
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