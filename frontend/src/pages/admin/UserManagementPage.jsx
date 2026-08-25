import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Badge } from '../../components/common/Badge';
import { Users, Search, UserCheck, UserX, Shield, CheckCircle2, Lock } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

export const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllUsers();
      if (res.success) setUsers(res.data);
    } catch (e) {
      console.error('Failed to load users:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      const res = await adminService.toggleUserStatus(userId, newStatus);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, active: newStatus } : u))
        );
        showToast(newStatus ? 'User account activated.' : 'User account suspended.');
      }
    } catch (e) {
      console.error('Error toggling user status:', e);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-2xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-purple-400" /> User Account Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Oversee all registered vault owners, nominees, and system administrative accounts.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 flex items-center">
        <Search className="w-4 h-4 text-slate-500 mr-2.5 ml-1" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter accounts by name, email, or role..."
          className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
        />
      </div>

      {/* Users Table */}
      {loading ? (
        <LoadingSpinner text="Retrieving registered user directories..." />
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 uppercase tracking-wider text-[11px] text-slate-400 border-b border-slate-800 font-bold">
                <tr>
                  <th className="px-4 py-3.5">User</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Registered</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsers.map((u) => {
                  const isAdminUser = u.role === 'ROLE_ADMIN';
                  const isNomineeUser = u.role === 'ROLE_NOMINEE';

                  return (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white">{u.fullName}</div>
                        <div className="text-slate-400 font-mono text-[11px]">{u.email}</div>
                      </td>

                      <td className="px-4 py-3">
                        <Badge
                          variant={isAdminUser ? 'purple' : isNomineeUser ? 'blue' : 'emerald'}
                          size="xs"
                        >
                          {u.role?.replace('ROLE_', '')}
                        </Badge>
                      </td>

                      <td className="px-4 py-3">
                        <Badge variant={u.active ? 'emerald' : 'rose'} size="xs">
                          {u.active ? 'Active' : 'Suspended'}
                        </Badge>
                      </td>

                      <td className="px-4 py-3 text-slate-400">
                        {formatDateTime(u.createdAt)}
                      </td>

                      <td className="px-4 py-3 text-right">
                        {!isAdminUser && (
                          <button
                            onClick={() => handleToggleStatus(u.id, u.active)}
                            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                              u.active
                                ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                            }`}
                          >
                            {u.active ? 'Suspend' : 'Activate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
