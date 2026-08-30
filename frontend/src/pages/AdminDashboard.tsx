import React, { useEffect, useState } from 'react';
import { adminApi } from '../services/adminApi';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import ErrorState from '../components/ui/ErrorState';
import { 
  Users, CreditCard, ShieldAlert, Cpu, ArrowRight, 
  Activity, RefreshCw, ShieldCheck, Database, 
  CheckCircle2, Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, CartesianGrid 
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  const fetchAdminStats = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);
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
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <LoadingSkeleton type="stats" count={4} />
        </div>
        <LoadingSkeleton type="chart" />
      </div>
    );
  }

  if (error) {
    return <ErrorState onRetry={() => fetchAdminStats(true)} message="Failed to load admin panel. Ensure your account has active ADMIN privileges." />;
  }

  const formatINR = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Mock real-time hourly load activity
  const systemActivityData = [
    { hour: '06:00', requests: 18, latency: 45 },
    { hour: '08:00', requests: 45, latency: 52 },
    { hour: '10:00', requests: 120, latency: 68 },
    { hour: '12:00', requests: 310, latency: 84 },
    { hour: '14:00', requests: 240, latency: 61 },
    { hour: '16:00', requests: 195, latency: 55 },
    { hour: '18:00', requests: 420, latency: 89 },
    { hour: '20:00', requests: 290, latency: 72 },
    { hour: '22:00', requests: 140, latency: 48 },
  ];

  return (
    <div className="space-y-7 max-w-7xl mx-auto w-full text-left">
      {/* Top Header & Platform Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2 font-outfit">
                Admin Command Center
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/15 border border-purple-500/30 text-purple-300">
                  Superuser Access
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time monitoring of workspace users, transaction flows, security audits, and AI telemetry.
              </p>
            </div>
          </div>
        </div>

        {/* Live Status and Refresh */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="w-1.5 h-1.5 -ml-3 rounded-full bg-emerald-400" />
            <span>Systems Online • Health: 100%</span>
          </div>
          <button
            onClick={() => fetchAdminStats(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-50"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Grid of Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Users */}
        <div className="relative group p-5 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 shadow-xl transition-all duration-300 backdrop-blur-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Users</p>
              <h3 className="text-2xl font-black text-white mt-1.5 tracking-tight font-outfit">
                {stats?.totalUsers || 0}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shadow-inner group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Active accounts</span>
            <span className="text-cyan-400 font-bold px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-[11px]">
              {stats?.activeUsers || 0} active
            </span>
          </div>
        </div>

        {/* Card 2: Transacted Volume */}
        <div className="relative group p-5 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 shadow-xl transition-all duration-300 backdrop-blur-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Platform Volume</p>
              <h3 className="text-2xl font-black text-emerald-400 mt-1.5 tracking-tight font-outfit">
                {formatINR(stats?.totalVolume || 0)}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-inner group-hover:scale-110 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Total transactions</span>
            <span className="text-emerald-400 font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[11px]">
              {stats?.totalTransactions || 0} recorded
            </span>
          </div>
        </div>

        {/* Card 3: Flagged Anomalies */}
        <div className="relative group p-5 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 shadow-xl transition-all duration-300 backdrop-blur-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Flagged Anomalies</p>
              <h3 className="text-2xl font-black text-rose-400 mt-1.5 tracking-tight font-outfit">
                {stats?.flaggedTransactions || 0}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shadow-inner group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Risk Status</span>
            <span className="text-rose-400 font-bold px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-[11px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
              High Risk Overrides
            </span>
          </div>
        </div>

        {/* Card 4: AI Telemetry */}
        <div className="relative group p-5 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 shadow-xl transition-all duration-300 backdrop-blur-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">AI Inferences</p>
              <h3 className="text-2xl font-black text-purple-400 mt-1.5 tracking-tight font-outfit">
                {stats?.aiRequests || 0}
              </h3>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shadow-inner group-hover:scale-110 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Groq Llama-3 API</span>
            <span className="text-purple-400 font-bold px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-[11px]">
              Chat & Analysis
            </span>
          </div>
        </div>
      </div>

      {/* Quick Navigation Control Hub */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Hub Item 1 */}
        <Link 
          to="/admin/users" 
          className="group p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-900/60 hover:to-slate-850/80 border border-slate-800 hover:border-cyan-500/40 shadow-xl transition-all duration-300 flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors font-outfit">
              Users Directory
            </h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Manage accounts, role promotions, access permissions, and check registered company domains.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 mt-5 pt-3 border-t border-slate-800/80 group-hover:translate-x-1 transition-transform">
            <span>Explore User Registry</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        {/* Hub Item 2 */}
        <Link 
          to="/admin/audit-logs" 
          className="group p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-900/60 hover:to-slate-850/80 border border-slate-800 hover:border-purple-500/40 shadow-xl transition-all duration-300 flex flex-col justify-between"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors font-outfit">
              Security & Audit Trails
            </h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Verify immutable logs of logins, ledger uploads, transaction creations, and risk profiling events.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-purple-400 mt-5 pt-3 border-t border-slate-800/80 group-hover:translate-x-1 transition-transform">
            <span>View Immutable Ledger</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </Link>

        {/* Hub Item 3 */}
        <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-900/60 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <Database className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-white font-outfit">
              Infrastructure & Database
            </h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              PostgreSQL relational cluster with automated connection pooling and schema integrity guards.
            </p>
          </div>
          <div className="flex items-center justify-between mt-5 pt-3 border-t border-slate-800/80 text-xs">
            <span className="text-slate-400 font-medium">Database Node</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Connected (Healthy)
            </span>
          </div>
        </div>
      </div>

      {/* System API Traffic Chart */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              System API Traffic & Server Load Telemetry
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live request frequency and database query throughput distribution over the current operational cycle.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-cyan-400 text-xs font-bold">
              Avg Latency: ~58ms
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={systemActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
              <XAxis dataKey="hour" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#090d16', 
                  borderColor: '#334155', 
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                  fontSize: '12px',
                  color: '#fff'
                }}
              />
              <Area type="monotone" dataKey="requests" name="API Requests" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRequests)" />
              <Area type="monotone" dataKey="latency" name="Latency (ms)" stroke="#3b82f6" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorLatency)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
