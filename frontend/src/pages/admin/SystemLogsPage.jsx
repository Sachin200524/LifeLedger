import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
import { History, Search, ShieldCheck } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

export const SystemLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadLogs();
  }, [page]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllAuditLogs(page, 30);
      if (res.success) {
        setLogs(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (e) {
      console.error('Failed to load system logs:', e);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action) => {
    if (action.includes('LOGIN') || action.includes('AUTH')) return { variant: 'blue', label: action };
    if (action.includes('UPLOAD') || action.includes('CREATE')) return { variant: 'emerald', label: action };
    if (action.includes('DELETE') || action.includes('PURGE')) return { variant: 'rose', label: action };
    if (action.includes('EMERGENCY')) return { variant: 'amber', label: action };
    return { variant: 'purple', label: action };
  };

  const filteredLogs = logs.filter(
    (l) =>
      l.action?.toLowerCase().includes(search.toLowerCase()) ||
      l.targetResource?.toLowerCase().includes(search.toLowerCase()) ||
      l.details?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <History className="w-7 h-7 text-purple-400" /> Global System Audit Logs
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Cryptographically immutable audit records across all user interactions, API endpoints, and system daemons.
        </p>
      </div>

      {/* Search Filter */}
      <div className="glass-panel p-3.5 rounded-2xl border border-slate-800 flex items-center">
        <Search className="w-4 h-4 text-slate-500 mr-2.5 ml-1" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter system logs by action, target resource, or details..."
          className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
        />
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner text="Querying global activity logs..." />
      ) : filteredLogs.length === 0 ? (
        <EmptyState
          icon={History}
          title="No Logs Available"
          description="System events will appear here with cryptographic details."
        />
      ) : (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 uppercase tracking-wider text-[11px] text-slate-400 border-b border-slate-800 font-bold">
                <tr>
                  <th className="px-4 py-3.5">Timestamp</th>
                  <th className="px-4 py-3.5">Action</th>
                  <th className="px-4 py-3.5">Target Resource</th>
                  <th className="px-4 py-3.5">Details</th>
                  <th className="px-4 py-3.5">Client IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredLogs.map((log) => {
                  const badge = getActionBadge(log.action);
                  return (
                    <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                        {formatDateTime(log.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={badge.variant} size="xs">
                          {badge.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-semibold text-white">
                        {log.targetResource || '-'}
                      </td>
                      <td className="px-4 py-3 text-slate-300 font-sans max-w-sm truncate" title={log.details}>
                        {log.details || '-'}
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {log.ipAddress || '127.0.0.1'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Page {page + 1} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
