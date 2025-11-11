export const bookingsRoutes = [
  { 
    path: 'bookings', 
    name: 'Bookings', 
    component: () => import('./pages/BookingsPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: 'bookings/:id',
    name: 'BookingDetail',
    component: () => import('./pages/BookingsPage.vue'),
    props: true,
    meta: { requiresAuth: true }
  }
]