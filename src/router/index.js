import { createRouter, createWebHistory } from 'vue-router';
import Login from '../pages/Login.vue';
import AdminLayout from '../layouts/AdminLayout.vue';
import Dashboard from '../pages/Dashboard.vue';
import Providers from '../pages/Providers.vue';
import ProviderDetail from '../pages/ProviderDetail.vue';
import Bookings from '../pages/Bookings.vue';
import BookingDetail from '../pages/BookingDetail.vue';
import Payments from '../pages/Payments.vue';
import Customers from '../pages/Customers.vue';
import Settings from '../pages/Settings.vue';

const routes = [
  { path: '/login', name: 'Login', component: Login },

  // Admin layout wraps protected child routes
  {
    path: '/',
    component: AdminLayout,
    children: [
      { path: '', name: 'Dashboard', component: Dashboard },
      { path: 'providers', name: 'Providers', component: Providers },
      { path: 'providers/:id', name: 'ProviderDetail', component: ProviderDetail, props: true },
      { path: 'bookings', name: 'Bookings', component: Bookings },
      { path: 'bookings/:id', name: 'BookingDetail', component: BookingDetail, props: true },
      { path: 'payments', name: 'Payments', component: Payments },
      { path: 'customers', name: 'Customers', component: Customers },
      {path:  'settings', name:'Settings' , component: Settings}
    ]
  },

  // fallback
  { path: '/:pathMatch(.*)*', redirect: '/' }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// simple auth guard: redirect to /login if no token
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('admin_token');
  if (to.name !== 'Login' && !token) return next({ name: 'Login' });
  if (to.name === 'Login' && token) return next({ name: 'Dashboard' });
  next();
});

export default router;
