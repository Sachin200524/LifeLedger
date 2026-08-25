import React, { useState, useEffect } from 'react';
import { emergencyService } from '../../services/emergencyService';
import { EmergencyRequestCard } from '../../components/emergency/EmergencyRequestCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { History, ShieldCheck, Clock } from 'lucide-react';

export const NomineeHistoryPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await emergencyService.getRequestsForNominee();
      if (res.success) setRequests(res.data);
    } catch (e) {
      console.error('Failed to load nominee history:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <History className="w-7 h-7 text-emerald-400" /> Emergency Claim History
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Historical record of all submitted emergency access requests and approval timelines.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Retrieving claim logs..." />
      ) : requests.length === 0 ? (
        <EmptyState
          icon={History}
          title="No Past Emergency Claims"
          description="Your submitted emergency access claims and historical logs will be preserved here."
        />
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
  );
};
