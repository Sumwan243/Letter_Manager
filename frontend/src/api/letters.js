import api from './axios';

// Letter Types
export const fetchLetterTypes = () => api.get('/letter-types');
export const fetchLetterTypeById = (id) => api.get(`/letter-types/${id}`);

// Letters CRUD operations
export const fetchLetters = () => api.get('/letters');
export const fetchLetterById = (id) => api.get(`/letters/${id}`);
export const createLetter = (data) => {
  console.log('API: Creating letter with data:', data);
  return api.post('/letters', data);
};
export const updateLetter = (id, data) => api.put(`/letters/${id}`, data);
export const deleteLetter = (id) => api.delete(`/letters/${id}`);

// Letter status management
export const updateLetterStatus = (id, status) => api.patch(`/letters/${id}/status`, { status });

// User-specific letters
export const fetchUserLetters = (userId) => api.get(`/users/${userId}/letters`);

// Admin operations
export const fetchAllLetters = () => api.get('/admin/letters');
export const fetchLettersByUser = (userId) => api.get(`/admin/users/${userId}/letters`);
export const approveLetter = (id) => api.patch(`/admin/letters/${id}/approve`);
export const rejectLetter = (id) => api.patch(`/admin/letters/${id}/reject`);

// Search and filter
export const searchLetters = (query) => api.get('/letters/search', { params: query });
export const filterLettersByStatus = (status) => api.get('/letters/filter', { params: { status } });
export const filterLettersByType = (typeId) => api.get('/letters/filter', { params: { type_id: typeId } });

// Export letters
export const exportLetters = (format = 'pdf') => api.get('/letters/export', { 
  params: { format },
  responseType: 'blob'
});

// Letter templates
export const fetchLetterTemplates = () => api.get('/letter-templates');
export const fetchLetterTemplateById = (id) => api.get(`/letter-templates/${id}`);
export const createLetterTemplate = (data) => api.post('/letter-templates', data);
export const updateLetterTemplate = (id, data) => api.put(`/letter-templates/${id}`, data);
export const deleteLetterTemplate = (id) => api.delete(`/letter-templates/${id}`);
