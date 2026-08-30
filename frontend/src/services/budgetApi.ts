import { api } from './api';

export const budgetApi = {
  getBudgets: async () => {
    const res = await api.get('/budgets');
    return res.data;
  },
  createBudget: async (budgetData: any) => {
    const res = await api.post('/budgets', budgetData);
    return res.data;
  },
  updateBudget: async (id: string, amount: number) => {
    const res = await api.put(`/budgets/${id}`, { amount });
    return res.data;
  },
  deleteBudget: async (id: string) => {
    const res = await api.delete(`/budgets/${id}`);
    return res.data;
  },
};
