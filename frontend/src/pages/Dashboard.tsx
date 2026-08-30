import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analyticsApi } from '../services/analyticsApi';
import { transactionApi } from '../services/transactionApi';
import { aiApi, AIInsightItem } from '../services/aiApi';
import StatCard from '../components/ui/StatCard';
import ChartCard from '../components/ui/ChartCard';
import Badge from '../components/ui/Badge';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import ErrorState from '../components/ui/ErrorState';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Plus, 
  ArrowRight,
  BrainCircuit
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export const Dashboard: React.FC = () => {
  const [overview, setOverview] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [recentTx, setRecentTx] = useState<any[]>([]);
  const [insight, setInsight] = useState<AIInsightItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(false);

      const [overviewRes, trendsRes, categoriesRes, txRes, insightsRes] = await Promise.all([
        analyticsApi.getOverview(),
        analyticsApi.getMonthlyTrend(),
        analyticsApi.getCategories(),
        transactionApi.getTransactions({ page: 1, limit: 5 }),
        aiApi.getInsights(),
      ]);

      if (overviewRes.success) setOverview(overviewRes.data);
      if (trendsRes.success) setTrends(trendsRes.data.trend);
      if (categoriesRes.success) setCategories(categoriesRes.data.categories);
      if (txRes.success) setRecentTx(txRes.data.transactions);
      if (insightsRes.success && insightsRes.data.insights.length > 0) {
        setInsight(insightsRes.data.insights[0]);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <LoadingSkeleton type="stats" count={4} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <LoadingSkeleton type="chart" />
          </div>
          <div>
            <LoadingSkeleton type="card" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState onRetry={fetchDashboardData} />;
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
      {/* Welcome Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Financial Workspace</h2>
          <p className="text-xs text-slate-450 mt-1">Real-time overview of assets, cashflow, and security risk indicators.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            to="/transactions" 
            className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg text-sm font-semibold shadow-lg shadow-cyan-500/10 active:scale-[0.98] transition-all"
          >
            <Plus className="h-4 w-4" />
            Add Transaction
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard 
          title="Available Balance"
          value={formatINR(overview?.totalBalance || 0)}
          icon={<Wallet className="h-4 w-4 text-cyan-400" />}
          subtext="Net liquidity across portfolios"
        />
        <StatCard 
          title="Monthly Income"
          value={formatINR(overview?.totalIncome || 0)}
          icon={<TrendingUp className="h-4 w-4 text-emerald-400" />}
          subtext="Accumulated salary & freelance"
        />
        <StatCard 
          title="Monthly Expenses"
          value={formatINR(overview?.totalExpense || 0)}
          icon={<TrendingDown className="h-4 w-4 text-red-400" />}
          subtext={`${overview?.budgets?.exceeded || 0} limits exceeded`}
        />
        <StatCard 
          title="Net Savings"
          value={formatINR(overview?.monthlySavings || 0)}
          trend={{
            value: `${overview?.totalIncome > 0 ? Math.round((overview.monthlySavings / overview.totalIncome) * 100) : 0}%`,
            type: overview?.monthlySavings >= 0 ? 'positive' : 'negative'
          }}
          subtext="Savings ratio this cycle"
        />
      </div>

      {/* AI Insight banner widget */}
      {insight && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-start gap-4">
          <span className={`p-2.5 rounded-lg shrink-0 ${
            insight.severity === 'CRITICAL' ? 'bg-red-950/40 text-red-400' :
            insight.severity === 'WARNING' ? 'bg-amber-950/40 text-amber-400' :
            'bg-cyan-950/40 text-cyan-400'
          }`}>
            <BrainCircuit className="h-5 w-5" />
          </span>
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">AI Financial Co-Pilot</span>
              <Badge variant={
                insight.severity === 'CRITICAL' ? 'danger' :
                insight.severity === 'WARNING' ? 'warning' : 'info'
              }>
                {insight.severity}
              </Badge>
            </div>
            <h4 className="text-sm font-semibold text-white mt-1">{insight.title}</h4>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{insight.content}</p>
          </div>
          <Link to="/insights" className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 self-center shrink-0">
            Audit
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Income vs Expenses Trend */}
        <div className="md:col-span-2">
          <ChartCard 
            title="Cashflow Trend"
            subtitle="Income vs expenditure ratio over the past 6 months"
          >
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2.5} activeDot={{ r: 6 }} dot={false} />
                <Line type="monotone" dataKey="expense" name="Expenses" stroke="#ef4444" strokeWidth={2.5} activeDot={{ r: 6 }} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Expenses Category breakdown */}
        <div>
          <ChartCard 
            title="Spending Categories"
            subtitle="Current cycle spending distribution"
          >
            {categories.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-xs">
                No expense data found
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={categories}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={80}
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
        </div>
      </div>

      {/* Recent Transactions Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-800/40">
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Recent Transactions</h3>
            <p className="text-[11px] text-slate-500 mt-1">Audit trail of the 5 most recent activities</p>
          </div>
          <Link to="/transactions" className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1">
            View All
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {recentTx.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-sm">
            No transactions found. <Link to="/transactions" className="text-cyan-400 underline">Add one now</Link>.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm text-slate-300 border-collapse">
              <thead>
                <tr className="text-slate-400 font-medium border-b border-slate-800/60 pb-3">
                  <th className="py-3 pr-4">Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 pl-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {recentTx.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-850/20 transition-colors">
                    <td className="py-4 pr-4">
                      <p className="font-semibold text-white">{tx.description}</p>
                      <span className="text-[10px] text-slate-505 block mt-0.5">
                        {new Date(tx.transactionDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-400">{tx.category}</td>
                    <td className="py-4 px-4 text-slate-500 font-semibold">{tx.paymentMethod}</td>
                    <td className="py-4 px-4">
                      <Badge variant={
                        tx.status === 'SUCCESS' ? 'success' :
                        tx.status === 'PENDING' ? 'warning' :
                        tx.status === 'FAILED' ? 'danger' : 'warning'
                      }>
                        {tx.status}
                      </Badge>
                    </td>
                    <td className={`py-4 pl-4 text-right font-bold text-sm ${
                      tx.type === 'INCOME' ? 'text-emerald-400' : 'text-slate-200'
                    }`}>
                      {tx.type === 'INCOME' ? '+' : '-'}&nbsp;{formatINR(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default Dashboard;
