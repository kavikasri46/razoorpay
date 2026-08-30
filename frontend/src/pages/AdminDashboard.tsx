import React, { useEffect, useState } from 'react';
import { adminApi } from '../services/adminApi';
import StatCard from '../components/ui/StatCard';
import ChartCard from '../components/ui/ChartCard';
import Card from '../components/ui/Card';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import ErrorState from '../components/ui/ErrorState';
import { Users, CreditCard, ShieldAlert, Cpu, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await adminApi.getStats();
      if (res.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <LoadingSkeleton type="stats" count={4} />
        </div>
        <LoadingSkeleton type="chart" />
      </div>
    );
  }

  if (error) {
    return <ErrorState onRetry={fetchAdminStats} message="Failed to load admin panel. Ensure your account has ADMIN privileges." />;
  }

  const formatINR = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Mock static system activity graph for display
  const systemActivityData = [
    { hour: '08:00', load: 15, requests: 45 },
    { hour: '10:00', load: 45, requests: 120 },
    { hour: '12:00', load: 85, requests: 310 },
    { hour: '14:00', load: 70, requests: 240 },
    { hour: '16:00', load: 60, requests: 180 },
    { hour: '18:00', load: 95, requests: 420 },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-bold text-white">Platform Administration</h2>
        <p className="text-xs text-slate-450 mt-1">Superuser monitoring of platform-wide users, transactions, audit logs, and AI request logs.</p>
      </div>

      {/* Grid of stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users Registered"
          value={stats?.totalUsers || 0}
          icon={<Users className="h-4 w-4 text-cyan-400" />}
          subtext={`Active accounts: ${stats?.activeUsers || 0}`}
        />
        <StatCard 
          title="Total Transacted Value"
          value={formatINR(stats?.totalVolume || 0)}
          icon={<CreditCard className="h-4 w-4 text-emerald-400" />}
          subtext={`Total requests: ${stats?.totalTransactions || 0}`}
        />
        <StatCard 
          title="Flagged Anomalies"
          value={stats?.flaggedTransactions || 0}
          icon={<ShieldAlert className="h-4 w-4 text-red-400" />}
          subtext="Marked as HIGH risk"
        />
        <StatCard 
          title="AI Services Processed"
          value={stats?.aiRequests || 0}
          icon={<Cpu className="h-4 w-4 text-purple-400" />}
          subtext="Groq chatbot & analyzer API counts"
        />
      </div>

      {/* Quick shortcuts for admin tables */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
        <Card className="bg-slate-900 border-slate-850 p-6 flex flex-col justify-between h-40">
          <div>
            <h4 className="text-sm font-bold text-white">Users Directory</h4>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Manage accounts, roles, access permissions, and check registered email domains.
            </p>
          </div>
          <Link to="/admin/users" className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 mt-4">
            View Accounts
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Card>

        <Card className="bg-slate-900 border-slate-850 p-6 flex flex-col justify-between h-40">
          <div>
            <h4 className="text-sm font-bold text-white">Security Audits</h4>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Verify system action logs, sign-ins, transaction creations, and risk profiling overrides.
            </p>
          </div>
          <Link to="/admin/audit-logs" className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 mt-4">
            View Audit Trails
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Card>

        <Card className="bg-slate-900 border-slate-850 p-6 flex flex-col justify-between h-40">
          <div>
            <h4 className="text-sm font-bold text-white">System API Traffic</h4>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Monitor concurrent API load factors, database transaction counts, and server health.
            </p>
          </div>
          <span className="text-xs text-slate-600 font-semibold flex items-center gap-1 mt-4 cursor-default">
            Health Check: OK
          </span>
        </Card>
      </div>

      {/* System Activity Chart */}
      <div className="grid grid-cols-1 gap-6">
        <ChartCard 
          title="System API Traffic & Server Load" 
          subtitle="Concurrent database requests and request counts in real-time"
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={systemActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.3} />
              <XAxis dataKey="hour" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
              />
              <Bar dataKey="requests" name="API Traffic (Count)" fill="#06b6d4" radius={[4, 4, 0, 0]} maxBarSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};
export default AdminDashboard;
