import React from 'react';
import {
  FileCheck,
  Clock,
  Shield,
  Trash2,
  ToggleLeft,
  ToggleRight,
  FileText,
  UserCheck,
  Calendar,
  Lock
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { formatDate } from '../../utils/formatters';

export const PolicyCard = ({ policy, onToggleActive, onDelete }) => {
  const approvalLabels = {
    OWNER_OR_ADMIN: 'Owner or Admin',
    OWNER_ONLY: 'Owner Only',
    ADMIN_ONLY: 'Admin Only',
    AUTO_AFTER_TIMEOUT: 'Auto After Timeout',
  };

  return (
    <div className={`glass-panel p-5 rounded-2xl border transition-all flex flex-col justify-between ${
      policy.active ? 'border-slate-800 hover:border-slate-700/80' : 'border-slate-800/40 opacity-70 bg-slate-950/40'
    }`}>
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-700/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base leading-tight">{policy.name}</h4>
              <span className="text-xs text-slate-400">
                Nominee: <strong className="text-slate-200">{policy.nomineeName}</strong>
              </span>
            </div>
          </div>

          <Badge variant={policy.active ? 'emerald' : 'default'} size="xs">
            {policy.active ? 'Active Policy' : 'Disabled'}
          </Badge>
        </div>

        {policy.description && (
          <p className="mt-3 text-xs text-slate-400 italic">
            "{policy.description}"
          </p>
        )}

        {/* Policy Rule Badges */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Waiting Period</span>
            <span className="font-bold text-white font-mono">{policy.waitingPeriodHours}h</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Approval Rule</span>
            <span className="font-semibold text-emerald-400 truncate block text-[11px]">
              {approvalLabels[policy.approvalType] || policy.approvalType}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Access Limit</span>
            <span className="font-bold text-white font-mono">{policy.accessDurationHours}h</span>
          </div>
        </div>

        {/* Bound Documents */}
        <div className="mt-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Permitted Documents ({policy.documents?.length || 0})
          </span>
          <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
            {policy.documents?.map((doc) => (
              <div
                key={doc.documentId}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-900/40 border border-slate-800/60 text-xs"
              >
                <span className="text-slate-300 font-medium truncate flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  {doc.title}
                </span>
                <span className="text-[10px] text-slate-500 uppercase">{doc.categoryName}</span>
              </div>
            ))}
          </div>
        </div>

        {policy.policyExpiryDate && (
          <div className="mt-3 text-[11px] text-slate-500 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Expires on {formatDate(policy.policyExpiryDate)}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
        <button
          onClick={() => onToggleActive(policy.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            policy.active
              ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
              : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
          }`}
        >
          {policy.active ? 'Disable Policy' : 'Enable Policy'}
        </button>

        <button
          onClick={() => onDelete(policy.id)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          title="Delete Policy"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
