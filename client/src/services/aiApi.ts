import { api } from './api';

export const aiApi = {
  chat: async (message: string) => {
    const res = await api.post('/ai/chat', { message });
    return res.data;
  },
  analyzeSpending: async () => {
    const res = await api.post('/ai/analyze');
    return res.data;
  },
  getInsights: async () => {
    const res = await api.get('/ai/insights');
    return res.data;
  },
};
export interface AIInsightItem {
  id: string;
  type: 'SPENDING' | 'SAVINGS' | 'BUDGET' | 'SUBSCRIPTION';
  title: string;
  content: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  createdAt: string;
}
export interface AISpendingReport {
  score: number;
  rating: string;
  explanation: string;
  risks: string[];
  opportunities: string[];
  recommendations: string[];
}
