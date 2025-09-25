import api from './axios';

export const fetchDepartments = () => api.get('/api/departments');
export const createDepartment = (data) => api.post('/api/departments', data);
