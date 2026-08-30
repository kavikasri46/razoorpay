import React, { useEffect, useState } from 'react';
import { adminApi } from '../services/adminApi';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import ErrorState from '../components/ui/ErrorState';
import { 
  ArrowLeft, Users, Search, Shield, UserCheck, 
  Copy, Check, Calendar, CreditCard, PieChart, 
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from '../components/ui/Toast';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'USER'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchUsers = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);
      setError(false);
      const res = await adminApi.getUsers();
      if (res.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success('User UUID copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.id.toLowerCase().includes(search.toLowerCase());
    
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <LoadingSkeleton type="table" />
      </div>
    );
  }

  if (error) {
    return <ErrorState onRetry={() => fetchUsers(true)} message="Failed to load user directory. Please ensure your backend is accessible." />;
  }

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto w-full">
      {/* Header with back navigation and count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <Link 
            to="/admin" 
            className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl transition-all shadow-sm group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-white tracking-tight font-outfit">
                Registered Users Directory
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                {users.length} accounts
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive registry of workspace users, system roles, transaction activity, and budgets.
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchUsers(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-semibold transition-all shadow-sm self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
          <span>Refresh Users</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by user name, corporate email, or UUID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-xl text-xs text-white placeholder-slate-500 font-medium transition-all"
          />
        </div>

        {/* Role Pills Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl">
          <button
            onClick={() => setRoleFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              roleFilter === 'ALL' 
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({users.length})
          </button>
          <button
            onClick={() => setRoleFilter('ADMIN')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              roleFilter === 'ADMIN' 
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3 h-3" />
            Admins
          </button>
          <button
            onClick={() => setRoleFilter('USER')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              roleFilter === 'USER' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3 h-3" />
            Users
          </button>
        </div>
      </div>

      {/* Users Table Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm text-slate-300 border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-4 px-6">User / Account</th>
                <th className="py-4 px-6">Email Address</th>
                <th className="py-4 px-6">Workspace Role</th>
                <th className="py-4 px-6 text-center">Transactions</th>
                <th className="py-4 px-6 text-center">Budgets</th>
                <th className="py-4 px-6">Created On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-50" />
                    <p className="font-semibold text-sm text-slate-400">No users found matching your search</p>
                    <p className="text-xs text-slate-600 mt-0.5">Try clearing your filters or search terms.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const initials = u.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
                  const isAdmin = u.role === 'ADMIN';

                  return (
                    <tr key={u.id} className="hover:bg-slate-850/40 transition-colors group">
                      {/* Name and UUID */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-xs shadow-md border ${
                            isAdmin 
                              ? 'bg-gradient-to-br from-purple-600 to-indigo-600 border-purple-400/30 text-white shadow-purple-500/20' 
                              : 'bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600/40 text-cyan-300 shadow-slate-900/40'
                          }`}>
                            {initials}
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm group-hover:text-cyan-300 transition-colors">
                              {u.name}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-slate-500 font-mono">
                                {u.id.slice(0, 8)}...{u.id.slice(-4)}
                              </span>
                              <button
                                onClick={() => handleCopyId(u.id)}
                                className="text-slate-600 hover:text-slate-300 transition-colors p-0.5"
                                title="Copy full user UUID"
                              >
                                {copiedId === u.id ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-4 px-6 text-slate-300 font-medium">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-950/70 border border-slate-800/80 text-slate-300 font-mono text-xs">
                          {u.email}
                        </span>
                      </td>

                      {/* Role */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider border shadow-sm ${
                          isAdmin 
                            ? 'bg-purple-500/15 border-purple-500/30 text-purple-300 shadow-purple-500/10' 
                            : 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300 shadow-cyan-500/10'
                        }`}>
                          {isAdmin ? <Shield className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                          {u.role}
                        </span>
                      </td>

                      {/* Transaction Count */}
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-bold text-slate-200">
                          <CreditCard className="w-3 h-3 text-cyan-400" />
                          {u._count.transactions}
                        </span>
                      </td>

                      {/* Budget Count */}
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-bold text-slate-200">
                          <PieChart className="w-3 h-3 text-emerald-400" />
                          {u._count.budgets}
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="py-4 px-6 text-slate-400 text-xs font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
