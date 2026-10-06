import api from './axiosInstance';

export const getMyClaims = () => api.get('/claims');
export const getAllClaims = () => api.get('/claims/all');
export const submitClaim = (data) => api.post('/claims', data);
export const updateClaim = (id, data) => api.put(`/claims/${id}`, data);
export const deleteClaim = (id) => api.delete(`/claims/${id}`);
export const reviewClaim = (id) => api.put(`/claims/${id}/review`);
export const decideClaim = (id, data) => api.put(`/claims/${id}/decide`, data);
export const payClaim = (id) => api.put(`/claims/${id}/pay`);
