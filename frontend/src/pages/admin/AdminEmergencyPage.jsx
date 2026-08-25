import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { EmergencyRequestCard } from '../../components/emergency/EmergencyRequestCard';
import { ReviewEmergencyModal } from '../../components/emergency/ReviewEmergencyModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const AdminEmergencyPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReview, setSelectedReview] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllEmergencyRequests();
      if (res.success) setRequests(res.data);
    } catch (e) {
      console.error('Failed to load admin emergency requests:', e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

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
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <AlertCircle className="w-7 h-7 text-amber-400" /> Global Emergency Request Arbitration
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          System-wide review of all legacy access requests, verification documents, and administrative approvals.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Retrieving global emergency requests..." />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={ShieldAlert}
          title="No Emergency Requests Recorded"
          description="System-wide emergency requests from all nominees across all vault owners will be tracked here."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((req) => (
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
          showToast('Administrative review submitted.');
          loadRequests();
        }}
      />
    </div>
  );
};
