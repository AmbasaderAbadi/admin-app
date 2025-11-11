import { createRouter, createWebHistory } from 'vue-router';
// Import all module routes
import { authRoutes } from '../../modules/auth/index.js';
import { dashboardRoutes } from '../../modules/dashboard/index.js';
import { usersRoutes } from '../../modules/users/index.js';
import { providersRoutes } from '../../modules/providers/index.js';
import { servicesRoutes } from '../../modules/services/index.js';
import { bookingsRoutes } from '../../modules/bookings/index.js';
import { paymentsRoutes } from '../../modules/payments/index.js';
import { settingsRoutes } from '../../modules/settings/index.js';

const routes = [
  // Auth routes
  ...authRoutes,
  
  // Protected routes with admin layout
  {
    path: '/',
    component: () => import('../layouts/AdminLayout.vue'),
    children: [
      ...dashboardRoutes,
      ...usersRoutes,
      ...providersRoutes,
      ...servicesRoutes,
      ...bookingsRoutes,
      ...paymentsRoutes,
      // ✅ Combine settings routes WITH sub-routes
      ...settingsRoutes,
      {
        path: 'settings/general',
        name: 'GeneralSettings',
        component: () => import('../../modules/settings/pages/General.vue')
      },
      {
        path: 'settings/booking-rules',
        name: 'BookingRules',
        component: () => import('../../modules/settings/pages/BookingRules.vue') // ✅ Now exists
      }
    ]
  },
  
  // Fallback route
  { path: '/:pathMatch(.*)*', redirect: '/' }
];

// ... rest of your router code unchanged ...

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Authentication guard
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('admin_token');
  
  // Allow reset password route without authentication
  if (to.name === 'ResetPassword') {
    return next();
  }
  
  // Redirect to login if trying to access protected route without token
  if (to.name !== 'Login' && !token) {
    return next({ name: 'Login' });
  }
  
  // Redirect to dashboard if already logged in and trying to access login
  if (to.name === 'Login' && token) {
    return next({ name: 'Dashboard' });
  }
  
  next();
});

export default router;