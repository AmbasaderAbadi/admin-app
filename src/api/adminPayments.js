import http from './http';


export const getPayments = () => http.get('/admin/payments');
