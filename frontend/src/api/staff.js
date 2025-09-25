import api from './axios';

export const fetchStaff = (departmentId) => api.get('/api/staff', { params: departmentId ? { department_id: departmentId } : {} });
export const createStaff = (data) => api.post('/api/staff', data);
