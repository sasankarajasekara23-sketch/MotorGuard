import api from './axiosInstance';

export const getMyVehicles = () => api.get('/vehicles');
export const getAllVehicles = () => api.get('/vehicles/all');
export const addVehicle = (data) => api.post('/vehicles', data);
export const updateVehicle = (id, data) => api.put(`/vehicles/${id}`, data);
export const deleteVehicle = (id) => api.delete(`/vehicles/${id}`);
