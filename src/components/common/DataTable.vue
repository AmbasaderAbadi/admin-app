<!-- src/components/common/DataTable.vue -->
<template>
  <div class="data-table">
    <div class="table-header">
      <div class="table-search">
        <input 
          v-model="searchQuery" 
          type="text" 
          :placeholder="`Search ${title}...`"
          @input="onSearch"
        />
      </div>
      <div class="table-actions">
        <slot name="actions"></slot>
      </div>
    </div>

    <div class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th v-for="col in columns" :key="col.key">{{ col.label }}</th>
            <th v-if="hasActions">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredItems" :key="item._id">
            <td v-for="col in columns" :key="col.key">
              <slot :name="col.key" :item="item">
                {{ item[col.key] || '—' }}
              </slot>
            </td>
            <td v-if="hasActions" class="actions-cell">
              <slot name="row-actions" :item="item"></slot>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="filteredItems.length === 0" class="no-results">
        No {{ title.toLowerCase() }} found
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { debounce } from '@/core/utils/helpers'

const props = defineProps({
  title: String,
  columns: Array,
  items: Array,
  actions: Boolean
})

const emit = defineEmits(['search'])

const searchQuery = ref('')

const filteredItems = computed(() => {
  if (!searchQuery.value.trim()) return props.items || []
  
  const term = searchQuery.value.toLowerCase().trim()
  return props.items.filter(item =>
    Object.values(item).some(value =>
      String(value).toLowerCase().includes(term)
    )
  )
})

const onSearch = debounce(() => {
  emit('search', searchQuery.value)
}, 300)

const hasActions = computed(() => props.actions)
</script>

<style scoped>
.data-table {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e0e5ff;
}

.table-search input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  width: 200px;
}

.table-actions {
  display: flex;
  gap: 8px;
}

.table-container {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th {
  background: #f5f7fa;
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #e0e5ff;
}

.table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.actions-cell {
  display: flex;
  gap: 8px;
}

.no-results {
  text-align: center;
  padding: 40px;
  color: #888;
  font-style: italic;
}
</style>