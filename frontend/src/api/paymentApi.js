import api from './axiosInstance';

export const payPremium = (data) => api.post('/payments/premium', data);
export const disburseClaimPayout = (data) => api.post('/payments/payout', data);
export const getMyPayments = () => api.get('/payments/my');
export const getPaymentById = (id) => api.get(`/payments/${id}`);
export const getAllPayments = () => api.get('/payments/all');
export const getPaymentsByPolicy = (policyId) => api.get(`/payments/policy/${policyId}`);
export const getPaymentsByClaim = (claimId) => api.get(`/payments/claim/${claimId}`);
