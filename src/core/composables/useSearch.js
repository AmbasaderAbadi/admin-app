// src/core/composables/useSearch.js
import { ref, computed } from 'vue'

export function useSearch(items, searchKey = 'name') {
  const searchQuery = ref('')
  
  const filteredItems = computed(() => {
    if (!searchQuery.value.trim()) return items.value
    
    const term = searchQuery.value.toLowerCase().trim()
    return items.value.filter(item =>
      (item[searchKey] || '').toLowerCase().includes(term)
    )
  })
  
  const setSearchQuery = (query) => {
    searchQuery.value = query
  }
  
  return {
    searchQuery,
    filteredItems,
    setSearchQuery
  }
}