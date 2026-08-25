import React, { useState, useEffect } from 'react';
import { emergencyService } from '../../services/emergencyService';
import { EmergencyRequestCard } from '../../components/emergency/EmergencyRequestCard';
import { ReviewEmergencyModal } from '../../components/emergency/ReviewEmergencyModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { AlertCircle, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';

export const EmergencyPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await emergencyService.getRequestsForOwner();
      if (res.success) setRequests(res.data);
    } catch (e) {
      console.error('Failed to load emergency requests:', e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const filteredRequests = requests.filter((r) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'PENDING') return r.status === 'PENDING' || r.status === 'UNDER_REVIEW';
    if (statusFilter === 'APPROVED') return r.status === 'APPROVED';
    if (statusFilter === 'CLOSED') return r.status === 'REJECTED' || r.status === 'EXPIRED' || r.status === 'CANCELLED';
    return true;
  });

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
            <AlertCircle className="w-7 h-7 text-amber-400" /> Emergency Access Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review nominee claims, verify evidence proofs, and authorize temporary legacy access windows.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-xs">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
            statusFilter === 'ALL'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          All Requests ({requests.length})
        </button>
        <button
          onClick={() => setStatusFilter('PENDING')}
          className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
            statusFilter === 'PENDING'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          Pending Review ({requests.filter((r) => r.status === 'PENDING').length})
        </button>
        <button
          onClick={() => setStatusFilter('APPROVED')}
          className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
            statusFilter === 'APPROVED'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          Active Access ({requests.filter((r) => r.status === 'APPROVED' && r.accessActive).length})
        </button>
        <button
          onClick={() => setStatusFilter('CLOSED')}
          className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
            statusFilter === 'CLOSED'
              ? 'bg-slate-800 text-slate-200 border border-slate-700'
              : 'text-slate-400 hover:text-white bg-slate-900/60'
          }`}
        >
          Historical / Concluded
        </button>
      </div>

      {/* Requests Listing */}
      {loading ? (
        <LoadingSpinner text="Retrieving emergency access claims..." />
      ) : filteredRequests.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No Emergency Requests Found"
          description="When your designated nominees submit emergency claims, they will appear here with evidence and countdown timers."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map((req) => (
            <EmergencyRequestCard
              key={req.id}
              request={req}
              onReview={(r) => setSelectedReview(r)}
              isOwner={true}
            />
          ))}
        </div>
      )}

      {/* Review Modal */}
      <ReviewEmergencyModal
        isOpen={!!selectedReview}
        onClose={() => setSelectedReview(null)}
        request={selectedReview}
        onSuccess={() => {
          showToast('Review decision recorded and nominee notified.');
          loadRequests();
        }}
      />
    </div>
  );
};
