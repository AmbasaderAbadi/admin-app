import http from './http';


export function getCustomers() {
  return http.get("/api/customers");
}
export function updateCustomer(id, data) {
  return http.patch(`/api/customers/${id}`, data);
}

export function deleteCustomer(id) {
  return http.delete(`/api/customers/${id}`);
}
