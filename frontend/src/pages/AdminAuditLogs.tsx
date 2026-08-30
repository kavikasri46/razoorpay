import React, { useEffect, useState } from 'react';
import { adminApi } from '../services/adminApi';

import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import ErrorState from '../components/ui/ErrorState';
import Badge from '../components/ui/Badge';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
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
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  if (loading) {
    return <LoadingSkeleton type="table" />;
  }

  if (error) {
    return <ErrorState onRetry={fetchAuditLogs} />;
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center gap-3">
        <Link to="/admin" className="p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-white">System Audit Trails</h2>
          <p className="text-xs text-slate-450 mt-1">Immutable ledger log of user logins, transaction creations, and administrative updates.</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800/80 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm text-slate-350 border-collapse">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-4 px-6">Timestamp</th>
                <th className="py-4 px-6">User</th>
                <th className="py-4 px-6">Action</th>
                <th className="py-4 px-6">Entity</th>
                <th className="py-4 px-6">Entity ID / Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-850/20 transition-colors">
                  <td className="py-4 px-6 text-slate-500 font-mono">
                    {new Date(log.createdAt).toLocaleString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="py-4 px-6">
                    {log.user ? (
                      <div>
                        <p className="font-semibold text-white">{log.user.name}</p>
                        <span className="text-[10px] text-slate-500 block">{log.user.email}</span>
                      </div>
                    ) : (
                      <span className="text-slate-600 font-semibold italic">System</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-semibold text-cyan-400 font-mono bg-slate-950 px-2 py-1 rounded text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <Badge variant="neutral">{log.entity}</Badge>
                  </td>
                  <td className="py-4 px-6">
                    {log.entityId && (
                      <div className="text-[10px] text-slate-500">
                        <span className="font-bold text-slate-400">ID:</span> {log.entityId}
                      </div>
                    )}
                    {log.metadata && (
                      <pre className="text-[9px] text-slate-450 mt-1 max-w-sm whitespace-pre-wrap overflow-hidden font-mono bg-slate-950/40 p-2 rounded border border-slate-800">
                        {JSON.stringify(log.metadata)}
                      </pre>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default AdminAuditLogs;
