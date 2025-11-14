<template>
  <div class="services-dashboard">
    <!-- Header Section -->
    <div class="dashboard-header">
      <div class="header-background">
        <div class="header-content">
          <div class="header-text">
            <h1 class="page-title">{{ getPageTitle() }}</h1>
            <p class="page-subtitle">{{ getPageDescription() }}</p>
          </div>
          <div class="header-actions">
            <button 
              v-if="!selectedCategory" 
              class="btn-primary btn-add" 
              @click="showAddModal = true"
            >
              <span class="btn-icon">+</span>
              New Category
            </button>
            <button 
              v-if="selectedCategory" 
              class="btn-primary btn-add" 
              @click="showAddSubCategoryModal = true"
            >
              <span class="btn-icon">+</span>
              New Sub-Category
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Breadcrumb Navigation -->
    <div class="breadcrumb-nav">
      <div class="breadcrumb-content">
        <div 
          class="breadcrumb-item" 
          :class="{ 'active': !selectedCategory }"
          @click="goToRoot"
        >
          <span class="breadcrumb-icon">📁</span>
          <span class="breadcrumb-text">Service Categories</span>
        </div>
        <div v-if="selectedCategory" class="breadcrumb-separator">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div 
          v-if="selectedCategory" 
          class="breadcrumb-item active"
        >
          <span class="breadcrumb-icon">{{ getCategoryIcon(selectedCategory.name) }}</span>
          <span class="breadcrumb-text">{{ selectedCategory.name }}</span>
        </div>
      </div>
    </div>

    <!-- Search Section -->
    <div class="search-section">
      <div class="search-container">
        <div class="search-input-wrapper">
          <span class="search-icon">🔍</span>
          <input 
            v-model="searchQuery"
            type="text" 
            :placeholder="getSearchPlaceholder()"
            class="search-input"
            @input="filterItems"
          />
          <div class="search-results">
            {{ getResultsCount() }}
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="dashboard-content">
      <!-- Loading & Error States -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>{{ getLoadingMessage() }}</p>
      </div>
      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <h3>Something went wrong</h3>
        <p>{{ error }}</p>
        <button class="btn-secondary" @click="fetchCategories">Try Again</button>
      </div>

      <!-- Category List View -->
      <div v-else-if="!selectedCategory" class="categories-view">
        <div class="grid-container">
          <div 
            v-for="(category, index) in displayedCategories" 
            :key="category._id" 
            class="category-card"
            @click="viewCategoryDetails(category)"
          >
            <div class="card-content">
              <div class="card-icon">
                <div class="icon-wrapper">
                  {{ getCategoryIcon(category.name) }}
                </div>
              </div>
              <div class="card-info">
                <h3 class="card-title">{{ category.name }}</h3>
                <p class="card-description">{{ category.description || 'No description available' }}</p>
                <div class="card-stats">
                  <div class="stat">
                    <span class="stat-number">{{ getSubCategoryCount(category) }}</span>
                    <span class="stat-label">Sub-Categories</span>
                  </div>
                </div>
              </div>
              <div class="card-actions" @click.stop>
                <button class="action-btn more-options" @click="toggleMenu(index)">
                  <span>⋯</span>
                </button>
                <div 
                  v-if="openMenuIndex === index" 
                  class="dropdown-menu"
                  @click.stop
                >
                  <button @click="editCategory(category)" class="dropdown-item">
                    <span class="item-icon">✏️</span>
                    Edit Category
                  </button>
                  <button class="dropdown-item delete-btn" @click="confirmDelete(category, 'category')">
                    <span class="item-icon">🗑️</span>
                    Delete Category
                  </button>
                </div>
              </div>
            </div>
            <div class="card-footer">
              <span class="created-date">Created {{ formatDate(category.createdAt) }}</span>
            </div>
          </div>
        </div>
        <div v-if="displayedCategories.length === 0" class="empty-state">
          <div class="empty-illustration">
            <div class="empty-icon">📁</div>
            <h3>No Categories Found</h3>
            <p>Get started by creating your first service category</p>
            <button class="btn-primary empty-btn" @click="showAddModal = true">
              <span class="btn-icon">+</span>
              Create Category
            </button>
          </div>
        </div>
      </div>

      <!-- Sub-Category List View -->
      <div v-else class="subcategories-view">
        <div class="grid-container">
          <div 
            v-for="(subCategory, index) in displayedSubCategories" 
            :key="subCategory._id" 
            class="subcategory-card"
          >
            <div class="card-content">
              <div class="card-icon">
                <div class="icon-wrapper">
                  {{ getSubCategoryIcon(subCategory.name) }}
                </div>
              </div>
              <div class="card-info">
                <h3 class="card-title">{{ subCategory.name }}</h3>
                <p class="card-description">{{ subCategory.description || 'No description available' }}</p>
                <div class="card-stats">
                  <div class="stat">
                    <span class="stat-number">{{ subCategory.providerCount || 0 }}</span>
                    <span class="stat-label">Providers</span>
                  </div>
                </div>
              </div>
              <div class="card-actions" @click.stop>
                <button class="action-btn more-options" @click="toggleSubCategoryMenu(index)">
                  <span>⋯</span>
                </button>
                <div 
                  v-if="openSubCategoryMenuIndex === index" 
                  class="dropdown-menu"
                  @click.stop
                >
                  <button @click="editSubCategory(subCategory)" class="dropdown-item">
                    <span class="item-icon">✏️</span>
                    Edit Sub-Category
                  </button>
                  <button class="dropdown-item delete-btn" @click="confirmDelete(subCategory, 'subcategory')">
                    <span class="item-icon">🗑️</span>
                    Delete Sub-Category
                  </button>
                </div>
              </div>
            </div>
            <div class="card-footer">
              <span class="created-date">Created {{ formatDate(subCategory.createdAt) }}</span>
            </div>
          </div>
        </div>
        <div v-if="displayedSubCategories.length === 0" class="empty-state">
          <div class="empty-illustration">
            <div class="empty-icon">📂</div>
            <h3>No Sub-Categories Found</h3>
            <p>Add sub-categories to "{{ selectedCategory.name }}"</p>
            <button class="btn-primary empty-btn" @click="showAddSubCategoryModal = true">
              <span class="btn-icon">+</span>
              Create Sub-Category
            </button>
          </div>
        </div>
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
            <input v-model="newCategory.name" type="text" required placeholder="Enter category name" />
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea v-model="newCategory.description" rows="3" placeholder="Enter category description"></textarea>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-cancel" @click="closeAddModal">Cancel</button>
            <button type="submit" class="btn btn-submit" :disabled="isSubmitting">
              {{ isSubmitting ? 'Adding...' : 'Add Category' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Add Sub-Category Modal -->
    <div v-if="showAddSubCategoryModal" class="modal-overlay" @click="closeAddSubCategoryModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Add Sub-Category to {{ selectedCategory?.name }}</h2>
          <button class="close-btn" @click="closeAddSubCategoryModal">×</button>
        </div>

        <form @submit.prevent="addSubCategory" class="add-form">
          <div class="form-group">
            <label>Sub-Category Name *</label>
            <input v-model="newSubCategory.name" type="text" required placeholder="Enter sub-category name" />
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea v-model="newSubCategory.description" rows="3" placeholder="Enter sub-category description"></textarea>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-cancel" @click="closeAddSubCategoryModal">Cancel</button>
            <button type="submit" class="btn btn-submit" :disabled="isSubmitting">
              {{ isSubmitting ? 'Adding...' : 'Add Sub-Category' }}
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
            <button type="button" class="btn btn-cancel" @click="cancelEdit">Cancel</button>
            <button type="submit" class="btn btn-submit" :disabled="isSubmitting">
              {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Edit Sub-Category Modal -->
    <div v-if="editingSubCategory" class="modal-overlay" @click="cancelEditSubCategory">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Edit Sub-Category</h2>
          <button class="close-btn" @click="cancelEditSubCategory">×</button>
        </div>

        <form @submit.prevent="updateSubCategory" class="add-form">
          <div class="form-group">
            <label>Sub-Category Name *</label>
            <input v-model="editingSubCategory.name" type="text" required />
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea v-model="editingSubCategory.description" rows="3"></textarea>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-cancel" @click="cancelEditSubCategory">Cancel</button>
            <button type="submit" class="btn btn-submit" :disabled="isSubmitting">
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
          <h2>Delete {{ deleteConfirm.type }}</h2>
          <button class="close-btn" @click="cancelDelete">×</button>
        </div>

        <div class="modal-body">
          <div class="warning-icon">⚠️</div>
          <p>Are you sure you want to delete "{{ deleteConfirm.item.name }}"?</p>
          <p class="warning-text" v-if="deleteConfirm.type === 'category'">
            This will remove all sub-categories and services in this category.
          </p>
          <p class="warning-text" v-else-if="deleteConfirm.type === 'subcategory'">
            This will remove all services associated with this sub-category.
          </p>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="cancelDelete">Cancel</button>
          <button class="btn btn-danger" @click="performDelete" :disabled="isSubmitting">
            {{ isSubmitting ? 'Deleting...' : 'Delete' }}
          </button>
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
const subCategories = ref([]);
const searchQuery = ref('');
const loading = ref(false);
const error = ref('');
const openMenuIndex = ref(null);
const openSubCategoryMenuIndex = ref(null);
const showAddModal = ref(false);
const showAddSubCategoryModal = ref(false);
const editingCategory = ref(null);
const editingSubCategory = ref(null);
const deleteConfirm = ref(null);
const isSubmitting = ref(false);

// Form Data
const newCategory = ref({ name: '', description: '' });
const newSubCategory = ref({ name: '', description: '' });

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
  openSubCategoryMenuIndex.value = null;
};

const fetchCategories = async () => {
  loading.value = true;
  error.value = '';
  try {
    const response = await http.get('/infinity-booking/categories');
    categories.value = Array.isArray(response.data) ? response.data : [];
    
    // Fetch subcategory counts for each category
    await Promise.all(
      categories.value.map(async (category) => {
        try {
          const subCatResponse = await http.get(`/infinity-booking/categories/${category._id}/subcategories`);
          category.subCategories = Array.isArray(subCatResponse.data) ? subCatResponse.data : [];
        } catch (err) {
          console.error(`Failed to fetch subcategories for category ${category._id}:`, err);
          category.subCategories = [];
        }
      })
    );
  } catch (err) {
    console.error('Failed to fetch categories:', err);
    error.value = err?.response?.data?.message || 'Failed to load service categories.';
    categories.value = [];
  } finally {
    loading.value = false;
  }
};

const fetchSubCategories = async (categoryId) => {
  loading.value = true;
  error.value = '';
  try {
    const response = await http.get(`/infinity-booking/categories/${categoryId}/subcategories`);
    subCategories.value = Array.isArray(response.data) ? response.data : [];
    
    // Update the category's subCategories array
    const categoryIndex = categories.value.findIndex(cat => cat._id === categoryId);
    if (categoryIndex !== -1) {
      categories.value[categoryIndex].subCategories = subCategories.value;
    }
  } catch (err) {
    console.error('Failed to fetch sub-categories:', err);
    error.value = err?.response?.data?.message || 'Failed to load sub-categories.';
    subCategories.value = [];
  } finally {
    loading.value = false;
  }
};

// Navigation
const viewCategoryDetails = async (category) => {
  selectedCategory.value = category;
  await fetchSubCategories(category._id);
};

const goBackToCategories = () => {
  selectedCategory.value = null;
  subCategories.value = [];
  searchQuery.value = '';
};

const goToRoot = () => {
  selectedCategory.value = null;
  subCategories.value = [];
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

const displayedSubCategories = computed(() => {
  if (!searchQuery.value.trim()) return subCategories.value;
  
  const term = searchQuery.value.toLowerCase().trim();
  return subCategories.value.filter(sub => 
    (sub.name || '').toLowerCase().includes(term) ||
    (sub.description && sub.description.toLowerCase().includes(term))
  );
});

const filterItems = () => {
  // Computed properties handle filtering
};

// CRUD Operations
const addCategory = async () => {
  if (!newCategory.value.name.trim()) {
    alert('Category name is required!');
    return;
  }

  isSubmitting.value = true;
  try {
    const response = await http.post('/infinity-booking/categories', {
      name: newCategory.value.name.trim(),
      description: newCategory.value.description?.trim() || ''
    });

    // Add empty subCategories array to the new category
    const newCategoryWithSubs = { ...response.data, subCategories: [] };
    categories.value.push(newCategoryWithSubs);
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
    const response = await http.put(`/infinity-booking/categories/${editingCategory.value._id}`, {
      name: editingCategory.value.name.trim(),
      description: editingCategory.value.description?.trim() || ''
    });

    const index = categories.value.findIndex(c => c._id === editingCategory.value._id);
    if (index !== -1) {
      // Preserve the subCategories array when updating
      categories.value[index] = { 
        ...response.data, 
        subCategories: categories.value[index].subCategories || [] 
      };
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

const addSubCategory = async () => {
  if (!newSubCategory.value.name.trim()) {
    alert('Sub-category name is required!');
    return;
  }

  isSubmitting.value = true;
  try {
    const response = await http.post(`/infinity-booking/categories/${selectedCategory.value._id}/subcategories`, {
      name: newSubCategory.value.name.trim(),
      description: newSubCategory.value.description?.trim() || ''
    });

    const newSubCategoryWithDefaults = { 
      ...response.data, 
      providerCount: 0 
    };
    
    subCategories.value.push(newSubCategoryWithDefaults);
    
    // Update the category's subCategories array
    const categoryIndex = categories.value.findIndex(cat => cat._id === selectedCategory.value._id);
    if (categoryIndex !== -1) {
      if (!categories.value[categoryIndex].subCategories) {
        categories.value[categoryIndex].subCategories = [];
      }
      categories.value[categoryIndex].subCategories.push(newSubCategoryWithDefaults);
    }
    
    closeAddSubCategoryModal();
    alert('Sub-category added successfully!');
  } catch (err) {
    console.error('Add sub-category error:', err);
    alert(err?.response?.data?.message || 'Failed to add sub-category. Please try again.');
  } finally {
    isSubmitting.value = false;
  }
};

const updateSubCategory = async () => {
  if (!editingSubCategory.value.name.trim()) {
    alert('Sub-category name is required!');
    return;
  }

  isSubmitting.value = true;
  try {
    const response = await http.put(`/infinity-booking/categories/subcategories/${editingSubCategory.value._id}`, {
      name: editingSubCategory.value.name.trim(),
      description: editingSubCategory.value.description?.trim() || ''
    });

    const index = subCategories.value.findIndex(s => s._id === editingSubCategory.value._id);
    if (index !== -1) {
      subCategories.value[index] = response.data;
    }

    // Update in categories array as well
    const categoryIndex = categories.value.findIndex(cat => cat._id === selectedCategory.value._id);
    if (categoryIndex !== -1 && categories.value[categoryIndex].subCategories) {
      const subIndex = categories.value[categoryIndex].subCategories.findIndex(
        sub => sub._id === editingSubCategory.value._id
      );
      if (subIndex !== -1) {
        categories.value[categoryIndex].subCategories[subIndex] = response.data;
      }
    }

    cancelEditSubCategory();
    alert('Sub-category updated successfully!');
  } catch (err) {
    console.error('Update sub-category error:', err);
    alert(err?.response?.data?.message || 'Failed to update sub-category. Please try again.');
  } finally {
    isSubmitting.value = false;
  }
};

const deleteCategory = async (category) => {
  isSubmitting.value = true;
  try {
    await http.delete(`/infinity-booking/categories/${category._id}`);
    categories.value = categories.value.filter(c => c._id !== category._id);
    if (selectedCategory.value?._id === category._id) {
      goBackToCategories();
    }
    alert('Category deleted successfully!');
  } catch (err) {
    console.error('Delete category error:', err);
    alert(err?.response?.data?.message || 'Failed to delete category. Please try again.');
  } finally {
    isSubmitting.value = false;
  }
};

const deleteSubCategory = async (subCategory) => {
  isSubmitting.value = true;
  try {
    await http.delete(`/infinity-booking/categories/subcategories/${subCategory._id}`);
    subCategories.value = subCategories.value.filter(s => s._id !== subCategory._id);
    
    // Update the category's subCategories array
    const categoryIndex = categories.value.findIndex(cat => cat._id === selectedCategory.value._id);
    if (categoryIndex !== -1 && categories.value[categoryIndex].subCategories) {
      categories.value[categoryIndex].subCategories = categories.value[categoryIndex].subCategories.filter(
        sub => sub._id !== subCategory._id
      );
    }
    
    alert('Sub-category deleted successfully!');
  } catch (err) {
    console.error('Delete sub-category error:', err);
    alert(err?.response?.data?.message || 'Failed to delete sub-category. Please try again.');
  } finally {
    isSubmitting.value = false;
  }
};

const confirmDelete = (item, type) => {
  deleteConfirm.value = { item, type };
};

const performDelete = async () => {
  if (deleteConfirm.value.type === 'category') {
    await deleteCategory(deleteConfirm.value.item);
  } else if (deleteConfirm.value.type === 'subcategory') {
    await deleteSubCategory(deleteConfirm.value.item);
  }
  cancelDelete();
};

// Menu Toggles
const toggleMenu = (index) => {
  openMenuIndex.value = openMenuIndex.value === index ? null : index;
};

const toggleSubCategoryMenu = (index) => {
  openSubCategoryMenuIndex.value = openSubCategoryMenuIndex.value === index ? null : index;
};

// Modal Handlers
const closeAddModal = () => {
  showAddModal.value = false;
  newCategory.value = { name: '', description: '' };
};

const closeAddSubCategoryModal = () => {
  showAddSubCategoryModal.value = false;
  newSubCategory.value = { name: '', description: '' };
};

const editCategory = (category) => {
  editingCategory.value = { ...category };
};

const editSubCategory = (subCategory) => {
  editingSubCategory.value = { ...subCategory };
};

const cancelEdit = () => {
  editingCategory.value = null;
};

const cancelEditSubCategory = () => {
  editingSubCategory.value = null;
};

const cancelDelete = () => {
  deleteConfirm.value = null;
};

// Utility Functions
const getCategoryIcon = (categoryName) => {
  if (!categoryName) return '📁';
  const name = categoryName.toLowerCase();
  
  if (name.includes('home') || name.includes('house') || name.includes('garden')) return '🏠';
  if (name.includes('beauty') || name.includes('spa') || name.includes('hair')) return '💅';
  if (name.includes('tech') || name.includes('computer') || name.includes('it')) return '💻';
  if (name.includes('education') || name.includes('tutor')) return '🎓';
  if (name.includes('transport') || name.includes('ride') || name.includes('delivery')) return '🚗';
  if (name.includes('food') || name.includes('catering')) return '🍕';
  if (name.includes('health') || name.includes('medical')) return '🏥';
  if (name.includes('legal')) return '⚖️';
  if (name.includes('finance')) return '💰';
  
  return '📁';
};

const getSubCategoryIcon = (subCategoryName) => {
  if (!subCategoryName) return '📂';
  const name = subCategoryName.toLowerCase();
  
  if (name.includes('plumb') || name.includes('pipe')) return '🔧';
  if (name.includes('electr') || name.includes('wire')) return '⚡';
  if (name.includes('clean') || name.includes('wash')) return '🧽';
  if (name.includes('massage')) return '💆';
  if (name.includes('hair')) return '💇';
  if (name.includes('tutor')) return '👨‍🏫';
  if (name.includes('repair')) return '🛠️';
  if (name.includes('maintain')) return '🔧';
  if (name.includes('install')) return '⚙️';
  
  return '📂';
};

const getSubCategoryCount = (category) => {
  return category.subCategories?.length || 0;
};

const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString();
};

const getPageTitle = () => {
  if (selectedCategory.value) return `Sub-Categories - ${selectedCategory.value.name}`;
  return 'Service Categories';
};

const getPageDescription = () => {
  if (selectedCategory.value) return `Manage sub-categories under ${selectedCategory.value.name}`;
  return 'Manage and organize your service categories and sub-categories';
};

const getSearchPlaceholder = () => {
  if (selectedCategory.value) return 'Search sub-categories...';
  return 'Search categories...';
};

const getResultsCount = () => {
  const count = selectedCategory.value ? displayedSubCategories.value.length : displayedCategories.value.length;
  const type = selectedCategory.value ? 'sub-categories' : 'categories';
  return `${count} ${type} found`;
};

const getLoadingMessage = () => {
  if (selectedCategory.value) return 'Loading sub-categories...';
  return 'Loading categories...';
};
</script>

<style scoped>
/* Modern, Professional Styling */
.services-dashboard {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7f4 100%);
  overflow-x: hidden;
}

/* Header Styles */
.dashboard-header {
  margin-bottom: 24px;
  position: relative;
}

.header-background {
  background: linear-gradient(120deg, #4285f4 0%, #3367d6 100%);
  border-radius: 16px;
  padding: 32px;
  color: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.header-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="80" r="3" fill="rgba(255,255,255,0.1)"/><circle cx="40" cy="60" r="1" fill="rgba(255,255,255,0.1)"/></svg>');
  opacity: 0.2;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 2;
}

.header-text {
  flex-grow: 1;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}

.page-subtitle {
  font-size: 16px;
  font-weight: 400;
  opacity: 0.9;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.btn-primary {
  background: white;
  color: #4285f4;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-primary:hover {
  background: #f8f9fa;
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  backdrop-filter: blur(10px);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.btn-icon {
  font-size: 16px;
}

/* Breadcrumb Navigation */
.breadcrumb-nav {
  margin-bottom: 24px;
}

.breadcrumb-content {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 14px;
  color: #666;
}

.breadcrumb-item:hover {
  background: #f8f9fa;
}

.breadcrumb-item.active {
  color: #4285f4;
  background: #e8f0fe;
  font-weight: 500;
}

.breadcrumb-separator {
  color: #999;
  margin: 0 8px;
}

/* Search Section */
.search-section {
  margin-bottom: 24px;
}

.search-container {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  position: relative;
}

.search-input {
  flex-grow: 1;
  padding: 14px 50px 14px 48px;
  border: 2px solid #e0e5ff;
  border-radius: 10px;
  font-size: 16px;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #4285f4;
  box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.2);
}

.search-icon {
  position: absolute;
  left: 16px;
  color: #999;
  font-size: 18px;
  z-index: 2;
}

.search-results {
  position: absolute;
  right: 16px;
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

/* Main Content */
.dashboard-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.category-card,
.subcategory-card {
  background: white;
  border-radius: 16px;
  padding: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  border: 1px solid #e0e5ff;
}

.category-card:hover,
.subcategory-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: #d0d5ff;
}

.card-content {
  display: flex;
  padding: 20px;
  position: relative;
}

.card-icon {
  margin-right: 16px;
  flex-shrink: 0;
}

.icon-wrapper {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: #e8f0fe;
  color: #4285f4;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.card-info {
  flex-grow: 1;
  min-width: 0;
  overflow: hidden;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-description {
  font-size: 14px;
  color: #666;
  margin: 0 0 12px 0;
  line-height: 1.5;
  word-break: break-word;
}

.card-stats {
  display: flex;
  gap: 20px;
  margin-top: 12px;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 20px;
  font-weight: bold;
  color: #4285f4;
  margin-bottom: 2px;
}

.stat-label {
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.card-actions {
  position: absolute;
  top: 16px;
  right: 16px;
}

.action-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #999;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: #f8f9fa;
  color: #666;
}

.dropdown-menu {
  position: absolute;
  right: 0;
  top: 40px;
  background: white;
  border: 1px solid #e0e5ff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 180px;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 16px;
  text-align: left;
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  color: #333;
  transition: background-color 0.2s ease;
}

.dropdown-item:hover {
  background: #f8f9fa;
}

.dropdown-item.delete-btn {
  color: #ff5252;
}

.dropdown-item.delete-btn:hover {
  background: #ffebee;
}

.item-icon {
  font-size: 16px;
}

.card-footer {
  padding: 12px 20px;
  background: #f8f9fa;
  border-top: 1px solid #e0e5ff;
  border-radius: 0 0 16px 16px;
  font-size: 12px;
  color: #888;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.empty-illustration {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.empty-icon {
  font-size: 64px;
  opacity: 0.3;
}

.empty-state h3 {
  font-size: 24px;
  color: #333;
  margin: 0 0 8px 0;
}

.empty-state p {
  font-size: 16px;
  margin: 0 0 20px 0;
}

.empty-btn {
  background: #4285f4;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s ease;
}

.empty-btn:hover {
  background: #3367d6;
}

/* Loading & Error States */
.loading-state {
  text-align: center;
  padding: 60px;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4285f4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state {
  text-align: center;
  padding: 60px;
  color: #666;
}

.error-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.error-state h3 {
  color: #ff5252;
  margin: 0 0 8px 0;
}

/* Modal Styles */
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
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e0e5ff;
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 600;
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
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e5ff;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #4285f4;
  box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.2);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}

.btn-cancel,
.btn-submit {
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.btn-cancel {
  background: #eee;
  color: #333;
  border: none;
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
  padding: 24px;
  text-align: center;
}

.warning-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.warning-text {
  color: #ff5252;
  font-size: 14px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #e0e5ff;
}

.btn-danger {
  background: #ff5252;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  cursor: pointer;
}

.btn-danger:hover:not(:disabled) {
  background: #d32f2f;
}

/* Responsive */
@media (max-width: 768px) {
  .header-background {
    padding: 24px;
  }
  
  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .header-actions {
    justify-content: flex-end;
  }
  
  .grid-container {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    width: 95%;
    margin: 10px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .card-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .card-icon {
    margin-right: 0;
  }
  
  .card-actions {
    position: static;
    align-self: flex-end;
  }
}
</style>