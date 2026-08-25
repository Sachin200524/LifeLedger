import React from 'react';
import {
  AlertCircle,
  Clock,
  ShieldCheck,
  ShieldX,
  FileText,
  User,
  CheckCircle2,
  Calendar,
  Lock,
  ChevronRight
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { formatDateTime } from '../../utils/formatters';

export const EmergencyRequestCard = ({
  request,
  onReview,
  onCancel,
  onViewDocuments,
  isOwner = true,
}) => {
  const statusBadges = {
    PENDING: { variant: 'amber', label: 'Pending Review', icon: Clock },
    UNDER_REVIEW: { variant: 'blue', label: 'Under Review', icon: Clock },
    APPROVED: { variant: 'emerald', label: 'Access Approved', icon: ShieldCheck },
    REJECTED: { variant: 'rose', label: 'Rejected', icon: ShieldX },
    EXPIRED: { variant: 'default', label: 'Access Expired', icon: Lock },
    CANCELLED: { variant: 'default', label: 'Cancelled', icon: AlertCircle },
  };

  const statusConfig = statusBadges[request.status] || statusBadges.PENDING;
  const StatusIcon = statusConfig.icon;

  return (
    <div className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-500">REQ-#{request.id}</span>
              <h4 className="font-bold text-white text-base leading-snug">{request.policyName}</h4>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isOwner ? (
                <>Nominee: <strong className="text-emerald-400">{request.nomineeName}</strong> ({request.nomineeEmail})</>
              ) : (
                <>Vault Owner: <strong className="text-emerald-400">{request.ownerName}</strong></>
              )}
            </p>
          </div>

          <Badge variant={statusConfig.variant} size="sm">
            <StatusIcon className="w-3 h-3" /> {statusConfig.label}
          </Badge>
        </div>

        {/* Reason */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Circumstances
          </span>
          <p className="text-slate-200 italic line-clamp-3">"{request.reason}"</p>
        </div>

        {/* Status progress bar & timeline */}
        <div className="mt-3 space-y-1.5 text-xs text-slate-400">
          <div className="flex items-center justify-between">
            <span>Requested:</span>
            <span className="font-mono text-slate-300">{formatDateTime(request.requestedAt)}</span>
          </div>

          {request.status === 'APPROVED' && request.accessExpiresAt && (
            <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
              <span className="flex items-center gap-1 font-semibold">
                <Clock className="w-3.5 h-3.5" /> Temporary Access Window:
              </span>
              <span className="font-mono font-bold">
                {request.accessActive ? `${Math.round(request.remainingAccessMinutes / 60)}h remaining` : 'Concluded'}
              </span>
            </div>
          )}

          {request.status === 'PENDING' && request.waitingPeriodEndsAt && (
            <div className="flex items-center justify-between text-[11px] text-amber-400/90">
              <span>Waiting Period Ends:</span>
              <span className="font-mono">{formatDateTime(request.waitingPeriodEndsAt)}</span>
            </div>
          )}

          {request.reviewNotes && (
            <div className="pt-2 border-t border-slate-800/60 text-[11px]">
              <span className="text-slate-500">Review Notes: </span>
              <span className="text-slate-300 italic">{request.reviewNotes}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
        {isOwner && request.status === 'PENDING' ? (
          <button
            onClick={() => onReview(request)}
            className="w-full py-2 text-xs font-semibold rounded-xl emerald-gradient text-slate-950 hover:opacity-95 transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" /> Review &amp; Decide
          </button>
        ) : request.status === 'APPROVED' && request.accessActive ? (
          <button
            onClick={() => onViewDocuments(request)}
            className="w-full py-2 text-xs font-semibold rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30 transition-all flex items-center justify-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" /> Access Permitted Documents ({request.accessibleDocuments?.length || 0})
          </button>
        ) : (
          <div className="w-full flex items-center justify-between text-xs text-slate-500">
            <span>Documents: {request.accessibleDocuments?.length || 0}</span>
            {request.status === 'PENDING' && onCancel && (
              <button
                onClick={() => onCancel(request.id)}
                className="text-rose-400 hover:text-rose-300"
              >
                Cancel Request
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
