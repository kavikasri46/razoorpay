import { api } from './api';

export const transactionApi = {
  getTransactions: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    type?: string;
    status?: string;
    paymentMethod?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const res = await api.get('/transactions', { params });
    return res.data;
  },
  getTransactionById: async (id: string) => {
    const res = await api.get(`/transactions/${id}`);
    return res.data;
  },
  createTransaction: async (txData: any) => {
    const res = await api.post('/transactions', txData);
    return res.data;
  },
  updateTransaction: async (id: string, txData: any) => {
    const res = await api.put(`/transactions/${id}`, txData);
    return res.data;
  },
  deleteTransaction: async (id: string) => {
    const res = await api.delete(`/transactions/${id}`);
    return res.data;
  },
};
