import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { emergencyService } from '../../services/emergencyService';
import { AlertTriangle, UploadCloud, ShieldAlert, AlertCircle, FileText } from 'lucide-react';

export const SubmitEmergencyModal = ({ isOpen, onClose, onSuccess, availablePolicies = [] }) => {
  const [policyId, setPolicyId] = useState(availablePolicies[0]?.id || '');
  const [reason, setReason] = useState('');
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!policyId) {
      setError('Please select an active legacy policy.');
      return;
    }
    if (!reason.trim()) {
      setError('Please explain the circumstances for this emergency access request.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('policyId', policyId);
      formData.append('reason', reason);
      if (evidenceFile) {
        formData.append('evidence', evidenceFile);
      }

      await emergencyService.submitRequest(formData);
      setReason('');
      setEvidenceFile(null);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit emergency request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request Emergency Legacy Access" maxWidth="max-w-xl">
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Important Security Notice</span>
            <span>
              All emergency requests trigger immediate notifications to the vault owner and system administrators.
              Access is granted strictly according to policy waiting periods and review requirements.
            </span>
          </div>
        </div>

        {/* Policy Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Emergency Policy
          </label>
          <select
            value={policyId}
            onChange={(e) => setPolicyId(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
          >
            <option value="" disabled className="bg-slate-900 text-slate-500">
              Select an authorized policy...
            </option>
            {availablePolicies.map((p) => (
              <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                {p.name} (Waiting Period: {p.waitingPeriodHours}h, Access Limit: {p.accessDurationHours}h)
              </option>
            ))}
          </select>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Emergency Reason &amp; Circumstances
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows="3"
            placeholder="Explain why immediate document access is required (e.g. medical hospitalization, insurance processing, executor duties)..."
            required
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm resize-none"
          />
        </div>

        {/* Proof / Evidence File Upload */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Supporting Evidence / Proof Document (Optional)
          </label>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>{evidenceFile ? evidenceFile.name : 'Upload hospitalization note, death certificate, or affidavit'}</span>
            </div>
            <label className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer">
              Choose File
              <input
                type="file"
                onChange={(e) => setEvidenceFile(e.target.files[0])}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
            </label>
          </div>
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
            className="px-5 py-2 text-sm font-semibold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20"
          >
            {loading ? 'Submitting Request...' : 'Submit Emergency Access Request'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
