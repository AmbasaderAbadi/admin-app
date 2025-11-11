import http from '@/core/api/http'

export const fetchCategories = async () => {
  const response = await http.get('/categories')
  return response.data || []
}

export const fetchSubCategories = async (categoryId) => {
  const response = await http.get(`/categories/${categoryId}/subcategories`)
  return response.data || []
}

export const addCategory = async (categoryData) => {
  const response = await http.post('/categories', categoryData)
  return response.data
}

export const updateCategory = async (categoryId, categoryData) => {
  const response = await http.put(`/categories/${categoryId}`, categoryData)
  return response.data
}

export const deleteCategory = async (categoryId) => {
  const response = await http.delete(`/categories/${categoryId}`)
  return response.data
}

export const addSubCategory = async (categoryId, subCategoryData) => {
  const response = await http.post(`/categories/${categoryId}/subcategories`, subCategoryData)
  return response.data
}

export const updateSubCategory = async (subCategoryId, subCategoryData) => {
  const response = await http.put(`/categories/subcategories/${subCategoryId}`, subCategoryData)
  return response.data
}

export const deleteSubCategory = async (subCategoryId) => {
  const response = await http.delete(`/categories/subcategories/${subCategoryId}`)
  return response.data
}