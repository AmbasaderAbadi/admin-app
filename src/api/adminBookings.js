import http from './http';

// ✅ Get all bookings
export const getBookings = () => http.get('/admin/bookings');

// ✅ Get a single booking by ID
export const getBookingDetail = (id) => http.get(`/admin/bookings/${id}`);

// ✅ Update booking (for example, confirm/cancel)
export const updateBooking = (id, data) => http.put(`/admin/bookings/${id}`, data);

// ✅ Delete booking (optional)
export const deleteBooking = (id) => http.delete(`/admin/bookings/${id}`);
