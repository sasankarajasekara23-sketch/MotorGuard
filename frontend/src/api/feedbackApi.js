import api from './axiosInstance';

export const getMyFeedback = () => api.get('/feedback');
export const getAllFeedback = () => api.get('/feedback/all');
export const getFeedbackSummary = () => api.get('/feedback/summary');
export const submitFeedback = (data) => api.post('/feedback', data);
export const updateFeedback = (id, data) => api.put(`/feedback/${id}`, data);
export const deleteFeedback = (id) => api.delete(`/feedback/${id}`);
