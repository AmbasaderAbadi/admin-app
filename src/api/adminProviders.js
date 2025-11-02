import http from './http';

// ✅ Get all providers
export const getProviders = () => http.get('/admin/providers');

// ✅ Get a single provider by ID
export const getProviderDetail = (id) => http.get(`/admin/providers/${id}`);

// ✅ Approve provider
export const approveProvider = (id) => http.put(`/admin/providers/${id}/approve`);

// ✅ Reject provider
export const rejectProvider = (id) => http.put(`/admin/providers/${id}/reject`);

// ✅ Delete provider (optional)
export const deleteProvider = (id) => http.delete(`/admin/providers/${id}`);
