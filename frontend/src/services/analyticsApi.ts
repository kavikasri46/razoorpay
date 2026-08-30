import { api } from './api';

export const analyticsApi = {
  getOverview: async () => {
    const res = await api.get('/analytics/overview');
    return res.data;
  },
  getMonthlyTrend: async () => {
    const res = await api.get('/analytics/monthly');
    return res.data;
  },
  getCategories: async () => {
    const res = await api.get('/analytics/categories');
    return res.data;
  },
  getPaymentMethods: async () => {
    const res = await api.get('/analytics/payment-methods');
    return res.data;
  },
};
