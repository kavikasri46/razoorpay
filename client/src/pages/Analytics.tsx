import React, { useEffect, useState } from 'react';
import { analyticsApi } from '../services/analyticsApi';
import ChartCard from '../components/ui/ChartCard';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import ErrorState from '../components/ui/ErrorState';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Legend, 
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const Analytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [trends, setTrends] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(false);

      const [trendsRes, categoriesRes, methodsRes] = await Promise.all([
        analyticsApi.getMonthlyTrend(),
        analyticsApi.getCategories(),
        analyticsApi.getPaymentMethods(),
      ]);

      if (trendsRes.success) setTrends(trendsRes.data.trend);
      if (categoriesRes.success) setCategories(categoriesRes.data.categories);
      if (methodsRes.success) setPaymentMethods(methodsRes.data.distribution);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton type="chart" count={2} />
      </div>
    );
  }

  if (error) {
    return <ErrorState onRetry={fetchAnalytics} />;
  }

  // Format currency
  const formatINR = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const COLORS = ['#06b6d4', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-white">Analytics Hub</h2>
        <p className="text-xs text-slate-450 mt-1">Deep analysis of cash flows, payment distributions, and spending behaviors.</p>
      </div>

      {/* Main Income vs Expense Bar Chart */}
      <div className="grid grid-cols-1 gap-6">
        <ChartCard 
          title="Cashflow Comparison" 
          subtitle="Monthly income vs monthly expenditure aggregates"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip 
                formatter={(value: any) => formatINR(value)}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="income" name="Total Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
              <Bar dataKey="expense" name="Total Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Category Pie & Payment Method Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category breakdown */}
        <ChartCard 
          title="Spending Categorization" 
          subtitle="Proportional breakdown of this month's expenses"
        >
          {categories.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
              No expenditure recorded this cycle
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={categories}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categories.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => formatINR(value)}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  iconType="circle"
                  wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Payment Methods */}
        <ChartCard 
          title="Payment Instruments" 
          subtitle="Total volume of transactions mapped to payment tools"
        >
          {paymentMethods.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
              No transactions recorded
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={paymentMethods} layout="vertical" margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis dataKey="method" type="category" stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  formatter={(value: any) => formatINR(value)}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                />
                <Bar dataKey="volume" name="Transaction Volume (₹)" fill="#06b6d4" radius={[0, 4, 4, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
};
export default Analytics;
