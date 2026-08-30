import React, { useEffect, useState } from 'react';
import { adminApi } from '../services/adminApi';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import ErrorState from '../components/ui/ErrorState';
import { 
  ArrowLeft, Shield, Search, Lock, User, 
  Clock, Copy, Check, 
  RefreshCw, Bot, Key, CreditCard, Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from '../components/ui/Toast';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchAuditLogs = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);
      setError(false);
      const res = await adminApi.getAuditLogs();
      if (res.success) {
        setLogs(res.data.auditLogs);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Log details copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'USER_REGISTER':
        return {
          bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
          icon: <User className="w-3 h-3 text-emerald-400" />
        };
      case 'USER_LOGIN':
        return {
          bg: 'bg-blue-500/15 border-blue-500/30 text-blue-300',
          icon: <Key className="w-3 h-3 text-blue-400" />
        };
      case 'AI_CHAT_REQUEST':
      case 'AI_SPENDING_ANALYZE':
        return {
          bg: 'bg-purple-500/15 border-purple-500/30 text-purple-300',
          icon: <Bot className="w-3 h-3 text-purple-400" />
        };
      case 'TRANSACTION_CREATE':
      case 'TRANSACTION_UPDATE':
        return {
          bg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
          icon: <CreditCard className="w-3 h-3 text-amber-400" />
        };
      case 'ADMIN_ACCESS':
        return {
          bg: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
          icon: <Shield className="w-3 h-3 text-rose-400" />
        };
      default:
        return {
          bg: 'bg-slate-800 border-slate-700 text-slate-300',
          icon: <Sparkles className="w-3 h-3 text-slate-400" />
        };
    }
  };

  const filteredLogs = logs.filter((log) => {
    const searchLower = search.toLowerCase();
    const matchesSearch = 
      log.action?.toLowerCase().includes(searchLower) ||
      log.entity?.toLowerCase().includes(searchLower) ||
      log.user?.name?.toLowerCase().includes(searchLower) ||
      log.user?.email?.toLowerCase().includes(searchLower) ||
      JSON.stringify(log.metadata || {}).toLowerCase().includes(searchLower);

    if (actionFilter === 'ALL') return matchesSearch;
    if (actionFilter === 'AUTH') return matchesSearch && (log.action === 'USER_LOGIN' || log.action === 'USER_REGISTER');
    if (actionFilter === 'AI') return matchesSearch && log.action?.startsWith('AI_');
    if (actionFilter === 'TRANSACTIONS') return matchesSearch && log.action?.startsWith('TRANSACTION_');
    if (actionFilter === 'ADMIN') return matchesSearch && log.action === 'ADMIN_ACCESS';

    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <LoadingSkeleton type="table" />
      </div>
    );
  }

  if (error) {
    return <ErrorState onRetry={() => fetchAuditLogs(true)} message="Failed to load audit trails. Please ensure your backend is accessible." />;
  }

  return (
    <div className="space-y-6 text-left max-w-7xl mx-auto w-full">
      {/* Header with back navigation */}
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
                System Audit Trails
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/15 border border-purple-500/30 text-purple-300">
                {logs.length} events logged
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Cryptographically verified, immutable ledger tracking all user logins, AI telemetry, and ledger actions.
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchAuditLogs(true)}
          disabled={refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-semibold transition-all shadow-sm self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-purple-400' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by action, actor email, entity, or payload..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 rounded-xl text-xs text-white placeholder-slate-500 font-medium transition-all"
          />
        </div>

        {/* Action Category Filter */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-xl flex-wrap sm:flex-nowrap">
          {[
            { id: 'ALL', label: `All (${logs.length})` },
            { id: 'AUTH', label: 'Auth & Logins' },
            { id: 'AI', label: 'AI Telemetry' },
            { id: 'TRANSACTIONS', label: 'Transactions' },
            { id: 'ADMIN', label: 'Admin Ops' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActionFilter(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                actionFilter === cat.id 
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm text-slate-300 border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-4 px-6">Timestamp</th>
                <th className="py-4 px-6">Actor / User</th>
                <th className="py-4 px-6">Action Performed</th>
                <th className="py-4 px-6">Entity Target</th>
                <th className="py-4 px-6">Metadata Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850/70">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <Lock className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-50" />
                    <p className="font-semibold text-sm text-slate-400">No audit records found</p>
                    <p className="text-xs text-slate-600 mt-0.5">Try selecting another filter category or search keyword.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const badge = getActionBadge(log.action);
                  const dateObj = new Date(log.createdAt);

                  return (
                    <tr key={log.id} className="hover:bg-slate-850/40 transition-colors group">
                      {/* Timestamp */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-start gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-semibold text-white text-xs">
                              {dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </p>
                            <span className="text-[10px] text-slate-500 block">
                              {dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* User */}
                      <td className="py-4 px-6">
                        {log.user ? (
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 text-cyan-300 text-[10px] font-extrabold flex items-center justify-center shrink-0">
                              {log.user.name.slice(0, 1).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-white text-xs leading-none">{log.user.name}</p>
                              <span className="text-[10px] text-slate-400 font-mono block mt-1">
                                {log.user.email}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700 text-[10px] font-bold text-slate-400">
                            SYSTEM_CORE
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm ${badge.bg}`}>
                          {badge.icon}
                          <span>{log.action}</span>
                        </span>
                      </td>

                      {/* Entity */}
                      <td className="py-4 px-6">
                        <span className="px-2 py-1 rounded-md bg-slate-950 border border-slate-800 text-[11px] font-bold text-slate-300 uppercase tracking-wide">
                          {log.entity}
                        </span>
                      </td>

                      {/* Metadata */}
                      <td className="py-4 px-6 max-w-xs">
                        <div className="space-y-1">
                          {log.entityId && (
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                              <span className="font-bold text-slate-500">ID:</span>
                              <code className="bg-slate-950 px-1 py-0.5 rounded border border-slate-800/80 font-mono text-[9px] text-cyan-300">
                                {log.entityId.length > 20 ? `${log.entityId.slice(0, 18)}...` : log.entityId}
                              </code>
                            </div>
                          )}
                          {log.metadata && Object.keys(log.metadata).length > 0 && (
                            <div className="relative group/meta mt-1">
                              <pre className="text-[10px] text-slate-300 font-mono bg-slate-950/80 p-2 rounded-xl border border-slate-800 overflow-x-auto max-h-24 no-scrollbar">
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                              <button
                                onClick={() => handleCopy(log.id, JSON.stringify(log.metadata))}
                                className="absolute right-1.5 top-1.5 p-1 rounded-md bg-slate-800 text-slate-400 hover:text-white opacity-0 group-hover/meta:opacity-100 transition-opacity"
                                title="Copy JSON payload"
                              >
                                {copiedId === log.id ? (
                                  <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          )}
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

export default AdminAuditLogs;
