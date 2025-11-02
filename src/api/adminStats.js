import http from './http';


export const getStats = () => http.get('/admin/stats');
