export const usersRoutes = [
  { 
    path: 'customers', 
    name: 'Customers', 
    component: () => import('./pages/UsersPage.vue')
  }
]