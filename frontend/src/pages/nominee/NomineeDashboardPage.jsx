import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { emergencyService } from '../../services/emergencyService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatCard } from '../../components/common/StatCard';
import { EmergencyRequestCard } from '../../components/emergency/EmergencyRequestCard';
import {
  LayoutDashboard,
  FolderLock,
  AlertTriangle,
  Clock,
  ShieldCheck,
  FileText,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const NomineeDashboardPage = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [accessibleDocs, setAccessibleDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNomineeData();
  }, []);

  const loadNomineeData = async () => {
    setLoading(true);
    try {
      const [reqRes, docsRes] = await Promise.all([
        emergencyService.getRequestsForNominee(),
        emergencyService.getAccessibleDocuments(),
      ]);
      if (reqRes.success) setRequests(reqRes.data);
      if (docsRes.success) setAccessibleDocs(docsRes.data);
    } catch (e) {
      console.error('Nominee dashboard load error:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Connecting to Nominee Emergency Portal..." />;
  }

  const activeApproved = requests.filter((r) => r.status === 'APPROVED' && r.accessActive);
  const pendingRequests = requests.filter((r) => r.status === 'PENDING' || r.status === 'UNDER_REVIEW');

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold">
              Nominee Portal
            </span>
            <span className="text-xs text-slate-400">Verified Trusted Contact</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome, {user?.fullName || user?.email}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            You are designated as a trusted nominee. Access to documents is governed by policy rules and emergency approvals.
          </p>
        </div>

        <Link
          to="/nominee/submit"
          className="px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 shrink-0"
        >
          <AlertTriangle className="w-4 h-4" /> Request Emergency Access
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Accessible Documents"
          value={accessibleDocs.length}
          subtitle={accessibleDocs.length > 0 ? 'Decryption window open' : 'No active access windows'}
          icon={FolderLock}
          color={accessibleDocs.length > 0 ? 'emerald' : 'blue'}
        />

        <StatCard
          title="Pending Requests"
          value={pendingRequests.length}
          subtitle="Awaiting owner / admin review"
          icon={Clock}
          color="amber"
        />

        <StatCard
          title="Total Claims Submitted"
          value={requests.length}
          subtitle="Historical emergency records"
          icon={FileText}
          color="purple"
        />
      </div>

      {/* Active Unlocked Documents Banner if any */}
      {accessibleDocs.length > 0 && (
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm">
              <ShieldCheck className="w-5 h-5" />
              <span>Decryption Access Active for {accessibleDocs.length} Document(s)</span>
            </div>
            <Link
              to="/nominee/documents"
              className="text-xs font-semibold text-emerald-300 hover:text-emerald-200 underline flex items-center gap-1"
            >
              <span>View Unlocked Files</span> <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Requests Timeline */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Your Emergency Access Requests
        </h3>

        {requests.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl border border-slate-800 text-center text-xs text-slate-400">
            No emergency requests submitted yet. In a crisis or contingency, click "Request Emergency Access".
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((r) => (
              <EmergencyRequestCard
                key={r.id}
                request={r}
                isOwner={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
