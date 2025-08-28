import api from './axios';

// Letter Types (protected)
export const fetchLetterTypes = () => api.get('/api/letter-types');
export const fetchLetterTypeById = (id) => api.get(`/api/letter-types/${id}`);

// Letters CRUD operations (protected)
export const fetchLetters = () => api.get('/api/letters');
export const fetchLetterById = (id) => api.get(`/api/letters/${id}`);
export const createLetter = (data) => {
  console.log('API: Creating letter with data:', data);
  return api.post('/api/letters', data);
};
export const updateLetter = (id, data) => api.put(`/api/letters/${id}`, data);
export const deleteLetter = (id) => api.delete(`/api/letters/${id}`);

// Letter status management
export const updateLetterStatus = (id, status) => api.patch(`/api/letters/${id}/status`, { status });

// User-specific letters
export const fetchUserLetters = (userId) => api.get(`/api/users/${userId}/letters`);

// Admin operations
export const fetchAllLetters = () => api.get('/api/admin/letters');
export const fetchLettersByUser = (userId) => api.get(`/api/admin/users/${userId}/letters`);
export const approveLetter = (id) => api.patch(`/api/admin/letters/${id}/approve`);
export const rejectLetter = (id) => api.patch(`/api/admin/letters/${id}/reject`);

// Search and filter
export const searchLetters = (query) => api.get('/api/letters/search', { params: query });
export const filterLettersByStatus = (status) => api.get('/api/letters/filter', { params: { status } });
export const filterLettersByType = (typeId) => api.get('/api/letters/filter', { params: { type_id: typeId } });

// Export letters
export const exportLetters = (format = 'pdf') => api.get('/api/letters/export', { 
  params: { format },
  responseType: 'blob'
});

// Letter templates
export const fetchLetterTemplates = () => api.get('/api/letter-templates');
export const fetchLetterTemplateById = (id) => api.get(`/api/letter-templates/${id}`);
export const createLetterTemplate = (data) => api.post('/api/letter-templates', data);
export const updateLetterTemplate = (id, data) => api.put(`/api/letter-templates/${id}`, data);
export const deleteLetterTemplate = (id) => api.delete(`/api/letter-templates/${id}`);
