import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import {
  Users,
  FolderLock,
  HardDrive,
  AlertCircle,
  Activity,
  History,
  Shield,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminStats();
  }, []);

  const loadAdminStats = async () => {
    setLoading(true);
    try {
      const res = await adminService.getDashboardStats();
      if (res.success) setStats(res.data);
    } catch (e) {
      console.error('Failed to load admin stats:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Connecting to System Admin Oversight..." />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-semibold">
              Root Administration Console
            </span>
            <span className="text-xs text-slate-400">System Architecture &amp; Compliance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            System Administration Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time platform monitoring, vault encryption integrity, user accounts, and emergency arbitrations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/emergency"
            className="px-4 py-2.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all flex items-center gap-1.5"
          >
            <AlertCircle className="w-4 h-4" /> Review Emergencies
          </Link>
          <Link
            to="/admin/users"
            className="px-4 py-2.5 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all flex items-center gap-1.5"
          >
            <Users className="w-4 h-4" /> Manage Users
          </Link>
        </div>
      </div>

      {/* Admin Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Registered Users"
            value={stats.totalUsers}
            subtitle={`${stats.activeUsers} Active Accounts`}
            icon={Users}
            color="purple"
          />

          <StatCard
            title="Encrypted Documents"
            value={stats.totalDocuments}
            subtitle="AES-256 Encrypted on Disk"
            icon={FolderLock}
            color="emerald"
          />

          <StatCard
            title="Total Storage Utilized"
            value={stats.formattedStorage || `${stats.totalStorageBytes} B`}
            subtitle="Local Zero-Knowledge Vault"
            icon={HardDrive}
            color="blue"
          />

          <StatCard
            title="Emergency Requests"
            value={stats.totalEmergencyRequests}
            subtitle={`${stats.pendingEmergencyRequests} Awaiting Action`}
            icon={AlertCircle}
            color={stats.pendingEmergencyRequests > 0 ? 'amber' : 'emerald'}
          />
        </div>
      )}

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/users"
          className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-purple-500/40 transition-all group"
        >
          <Users className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="text-base font-bold text-white mb-1">User Account Management</h3>
          <p className="text-xs text-slate-400">
            View all vault accounts, toggle active/suspended statuses, and inspect account creation dates.
          </p>
        </Link>

        <Link
          to="/admin/emergency"
          className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all group"
        >
          <AlertCircle className="w-8 h-8 text-amber-400 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="text-base font-bold text-white mb-1">Emergency Arbitration</h3>
          <p className="text-xs text-slate-400">
            Oversee legacy access claims across all users and perform administrative override approvals if required.
          </p>
        </Link>

        <Link
          to="/admin/logs"
          className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-cyan-500/40 transition-all group"
        >
          <History className="w-8 h-8 text-cyan-400 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="text-base font-bold text-white mb-1">Global Audit Trails</h3>
          <p className="text-xs text-slate-400">
            Access system-wide tamper-evident logs including user logins, document uploads, and security events.
          </p>
        </Link>
      </div>
    </div>
  );
};
