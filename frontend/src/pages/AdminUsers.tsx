import React, { useEffect, useState } from 'react';
import { adminApi } from '../services/adminApi';

import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import ErrorState from '../components/ui/ErrorState';
import Badge from '../components/ui/Badge';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
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
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return <LoadingSkeleton type="table" />;
  }

  if (error) {
    return <ErrorState onRetry={fetchUsers} />;
  }

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center gap-3">
        <Link to="/admin" className="p-2 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h2 className="text-xl font-bold text-white">Registered Users Directory</h2>
          <p className="text-xs text-slate-450 mt-1">Registry of all user accounts on this workspace database instance.</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800/80 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm text-slate-350 border-collapse">
            <thead>
              <tr className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Workspace Role</th>
                <th className="py-4 px-6 text-center">Transactions count</th>
                <th className="py-4 px-6 text-center">Budgets active</th>
                <th className="py-4 px-6">Created On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-850/20 transition-colors">
                  <td className="py-4 px-6">
                    <p className="font-semibold text-white">{u.name}</p>
                    <span className="text-[9px] text-slate-650 font-mono block mt-0.5">{u.id}</span>
                  </td>
                  <td className="py-4 px-6 text-slate-400">{u.email}</td>
                  <td className="py-4 px-6">
                    <Badge variant={u.role === 'ADMIN' ? 'danger' : 'info'}>
                      {u.role}
                    </Badge>
                  </td>
                  <td className="py-4 px-6 text-center text-slate-300 font-bold">{u._count.transactions}</td>
                  <td className="py-4 px-6 text-center text-slate-300 font-bold">{u._count.budgets}</td>
                  <td className="py-4 px-6 text-slate-500">
                    {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
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
export default AdminUsers;
