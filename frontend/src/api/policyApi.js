import api from './axiosInstance';

export const getMyPolicies = () => api.get('/policies');
export const getAllPolicies = () => api.get('/policies/all');
export const getPolicyById = (id) => api.get(`/policies/${id}`);
export const createPolicy = (data) => api.post('/policies', data);
export const updatePolicy = (id, data) => api.put(`/policies/${id}`, data);
export const deletePolicy = (id) => api.delete(`/policies/${id}`);
export const renewPolicy = (id) => api.post(`/policies/${id}/renew`);
