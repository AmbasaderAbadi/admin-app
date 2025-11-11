export const paymentsRoutes = [
  { 
    path: 'payments', 
    name: 'Payments', 
    component: () => import('./pages/PaymentsPage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: 'payments/:id',
    name: 'PaymentDetail',
    component: () => import('./pages/PaymentsPage.vue'),
    props: true,
    meta: { requiresAuth: true }
  }
]