<template>
  <div class="avatar-upload-container">
    <!-- Current Avatar Preview -->
    <div v-if="currentAvatar" class="avatar-preview">
      <img 
        :src="currentAvatar" 
        :alt="altText || 'Avatar'"
        class="avatar-image"
      />
      <button class="remove-btn" @click="removeAvatar">
        × Remove
      </button>
    </div>

    <!-- Upload Area -->
    <div 
      class="upload-area"
      :class="{ 'drag-over': isDragOver }"
      @dragover.prevent="isDragOver = true"
      @dragleave="isDragOver = false"
      @drop.prevent="handleDrop"
    >
      <div class="upload-content">
        <div class="upload-icon">📁</div>
        <div class="upload-text">
          <p>Drag & drop your avatar here</p>
          <p>or</p>
          <button class="browse-btn" @click="browseFiles">Browse Files</button>
        </div>
        <input 
          ref="fileInput"
          type="file" 
          accept="image/*" 
          @change="handleFileSelect"
          hidden
        />
      </div>
    </div>

    <!-- File Info -->
    <div v-if="selectedFile" class="file-info">
      <span class="file-name">{{ selectedFile.name }}</span>
      <span class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
    </div>

    <!-- Upload Progress -->
    <div v-if="uploadProgress > 0" class="progress-container">
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: uploadProgress + '%' }"
        ></div>
      </div>
      <span class="progress-text">{{ uploadProgress }}% uploaded</span>
    </div>

    <!-- Upload Button -->
    <button 
      v-if="selectedFile"
      class="upload-btn"
      @click="uploadAvatar"
      :disabled="isUploading"
    >
      {{ isUploading ? 'Uploading...' : 'Upload Avatar' }}
    </button>

    <!-- Error Message -->
    <p v-if="error" class="error-message">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import http from '../../../core/api/http';

// Props
const props = defineProps({
  currentAvatar: String,
  altText: {
    type: String,
    default: 'Avatar'
  }
});

// Emits
const emit = defineEmits(['update:avatar', 'upload-success', 'upload-error']);

// Reactive State
const isDragOver = ref(false);
const selectedFile = ref(null);
const uploadProgress = ref(0);
const isUploading = ref(false);
const error = ref('');
const fileInput = ref(null);

// Methods
const browseFiles = () => {
  fileInput.value?.click();
};

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    validateAndSetFile(file);
  }
};

const handleDrop = (event) => {
  isDragOver.value = false;
  const file = event.dataTransfer.files[0];
  if (file) {
    validateAndSetFile(file);
  }
};

const validateAndSetFile = (file) => {
  error.value = '';
  
  // Validate file type
  if (!file.type.startsWith('image/')) {
    error.value = 'Please select an image file (JPG, PNG, GIF)';
    return;
  }
  
  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    error.value = 'File size exceeds 5MB limit';
    return;
  }
  
  selectedFile.value = file;
  uploadProgress.value = 0;
};

const uploadAvatar = async () => {
  if (!selectedFile.value) return;
  
  isUploading.value = true;
  error.value = '';
  
  try {
    const formData = new FormData();
    formData.append('avatar', selectedFile.value);
    
    // ✅ Use correct endpoint for avatar upload
    const response = await http.post('/users/avatar/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        uploadProgress.value = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
      }
    });
    
    // ✅ Emit success with new avatar URL
    emit('update:avatar', response.data.avatarUrl);
    emit('upload-success', response.data);
    
    selectedFile.value = null;
    alert('Avatar uploaded successfully!');
  } catch (err) {
    console.error('Avatar upload failed:', err);
    error.value = err?.response?.data?.message || 'Failed to upload avatar. Please try again.';
    emit('upload-error', err);
  } finally {
    isUploading.value = false;
  }
};

const removeAvatar = () => {
  selectedFile.value = null;
  emit('update:avatar', null);
  alert('Avatar removed successfully!');
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
</script>

<style scoped>
.avatar-upload-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 300px;
}

.avatar-preview {
  position: relative;
  width: 150px;
  height: 150px;
  margin: 0 auto;
}

.avatar-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e0e5ff;
}

.remove-btn {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ff5252;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover {
  background: #ff3333;
}

.upload-area {
  border: 2px dashed #e0e5ff;
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #f8f9fa;
}

.upload-area.drag-over {
  border-color: #4285f4;
  background-color: #e3f2fd;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.upload-icon {
  font-size: 32px;
}

.upload-text p {
  margin: 0;
  color: #666;
}

.browse-btn {
  background-color: #4285f4;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 8px;
}

.browse-btn:hover {
  background-color: #3367d6;
}

.file-info {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background-color: #f0f0f0;
  border-radius: 6px;
  font-size: 14px;
}

.file-name {
  font-weight: 500;
  color: #333;
  word-break: break-all;
}

.file-size {
  color: #666;
}

.progress-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background-color: #e0e5ff;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #4285f4;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: #666;
  text-align: right;
}

.upload-btn {
  background-color: #4285f4;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.upload-btn:hover:not(:disabled) {
  background-color: #3367d6;
}

.upload-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.error-message {
  color: #ff5252;
  font-size: 12px;
  margin-top: 4px;
  text-align: center;
}

/* Responsive */
@media (max-width: 768px) {
  .avatar-upload-container {
    max-width: 100%;
  }
  
  .avatar-preview {
    width: 120px;
    height: 120px;
  }
  
  .upload-area {
    padding: 20px;
  }
  
  .upload-icon {
    font-size: 28px;
  }
  
  .browse-btn {
    padding: 6px 12px;
    font-size: 13px;
  }
  
  .upload-btn {
    padding: 8px 16px;
    font-size: 13px;
  }
}
</style>