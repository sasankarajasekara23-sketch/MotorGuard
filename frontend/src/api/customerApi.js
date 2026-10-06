import api from './axiosInstance';

export const getMyProfile = () => api.get('/customers/me');
export const updateMyProfile = (data) => api.put('/customers/me', data);
export const getCustomerById = (id) => api.get(`/customers/${id}`);
export const updateCustomerById = (id, data) => api.put(`/customers/${id}`, data);
export const getAllCustomers = () => api.get('/customers');
