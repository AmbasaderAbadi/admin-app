export const authRoutes = [
  { 
    path: '/login', 
    name: 'Login', 
    component: () => import('./pages/LoginPage.vue')
  },
  { 
    path: '/auth/reset-password/:token', 
    name: 'ResetPassword', 
    component: () => import('./pages/LoginPage.vue')
  }
]