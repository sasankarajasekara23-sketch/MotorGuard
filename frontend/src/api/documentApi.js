import api from './axiosInstance';

export const getMyDocuments = () => api.get('/documents');
export const getAllDocuments = () => api.get('/documents/all');
export const uploadDocument = (formData) => api.post('/documents/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const updateDocument = (id, formData) => api.put(`/documents/${id}`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteDocument = (id) => api.delete(`/documents/${id}`);
export const getDownloadUrl = (id) => `/api/documents/${id}/download`;

// Downloads require the Authorization header, so they must go through the
// authenticated axios instance (a plain <a href> to a protected endpoint
// would navigate without the JWT and get a 401).
export const downloadDocumentFile = (id) => api.get(`/documents/${id}/download`, { responseType: 'blob' });
