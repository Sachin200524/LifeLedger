import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { emergencyService } from '../../services/emergencyService';
import { ShieldCheck, ShieldX, AlertTriangle, FileText, Download, Clock, User } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

export const ReviewEmergencyModal = ({ isOpen, onClose, request, onSuccess }) => {
  const [approve, setApprove] = useState(true);
  const [reviewNotes, setReviewNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !request) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await emergencyService.reviewRequest(request.id, {
        approve,
        reviewNotes,
      });
      setReviewNotes('');
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to review emergency request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Review Emergency Request #${request.id}`} maxWidth="max-w-xl">
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Request Overview */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Policy:</span>
            <span className="font-bold text-white">{request.policyName}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Requesting Nominee:</span>
            <span className="font-semibold text-emerald-400">{request.nomineeName} ({request.nomineeEmail})</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Submitted Timestamp:</span>
            <span className="text-slate-300 font-mono">{formatDateTime(request.requestedAt)}</span>
          </div>

          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Stated Emergency Reason
            </span>
            <p className="text-xs text-slate-200 bg-slate-950/80 p-3 rounded-lg border border-slate-800 italic">
              "{request.reason}"
            </p>
          </div>

          {/* Evidence Attachments */}
          {request.evidences?.length > 0 && (
            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Attached Proof Documents ({request.evidences.length})
              </span>
              <div className="space-y-1">
                {request.evidences.map((e) => (
                  <div key={e.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-950 text-xs">
                    <span className="text-slate-300 flex items-center gap-1.5 truncate">
                      <FileText className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      {e.originalFilename}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{e.fileSize} B</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Form: Decision and Notes */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Review Decision
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setApprove(true)}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-sm font-semibold transition-all ${
                  approve
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10'
                    : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Approve Access
              </button>

              <button
                type="button"
                onClick={() => setApprove(false)}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-sm font-semibold transition-all ${
                  !approve
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-md shadow-rose-500/10'
                    : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldX className="w-4 h-4 text-rose-400" /> Reject Access
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Review Notes / Decision Rationale
            </label>
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              rows="2"
              placeholder={approve ? 'e.g. Identity and circumstances verified by hospital liaison.' : 'e.g. Incomplete evidence provided.'}
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm resize-none"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2 text-sm font-semibold rounded-xl text-white transition-all shadow-md ${
                approve
                  ? 'emerald-gradient text-slate-950 font-bold shadow-emerald-500/20'
                  : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
              }`}
            >
              {loading ? 'Submitting Review...' : approve ? 'Grant Temporary Access' : 'Reject Request'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
