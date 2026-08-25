import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { emergencyService } from '../../services/emergencyService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  AlertTriangle,
  FileText,
  UploadCloud,
  ShieldAlert,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const SubmitEmergencyPage = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [policyId, setPolicyId] = useState('');
  const [reason, setReason] = useState('');
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    setLoading(true);
    try {
      const res = await emergencyService.getAvailablePoliciesForNominee();
      if (res.success) {
        setPolicies(res.data);
        if (res.data.length > 0) {
          setPolicyId(res.data[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to load nominee policies:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!policyId) {
      setError('Please select an active policy.');
      return;
    }
    if (!reason.trim()) {
      setError('Please explain the circumstances requiring emergency document access.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('policyId', policyId);
      formData.append('reason', reason);
      if (evidenceFile) {
        formData.append('evidence', evidenceFile);
      }

      const res = await emergencyService.submitRequest(formData);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => navigate('/nominee/dashboard'), 2500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit emergency request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving authorized emergency policies..." />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <AlertTriangle className="w-7 h-7 text-amber-400" /> Request Emergency Access
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Initiate a legacy emergency claim for critical identity, healthcare, or financial documents.
        </p>
      </div>

      {success ? (
        <div className="glass-panel p-8 rounded-3xl border border-emerald-500/30 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-xl font-bold text-white">Emergency Request Submitted</h3>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            The vault owner and system administrators have been alerted. The policy waiting period timer has been engaged.
          </p>
          <p className="text-xs text-emerald-400 font-semibold">Redirecting to nominee console...</p>
        </div>
      ) : policies.length === 0 ? (
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No Configured Policies Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            The vault owner has not yet bound active policies to your nominee profile. Please ask them to assign a policy in the Policy Engine.
          </p>
        </div>
      ) : (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Security Callout */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block mb-0.5">Automated Policy Enforcement Notice</span>
              <span>
                Submitting this request triggers immediate notifications. Depending on policy rules, access will be granted following owner approval or upon expiration of the mandatory waiting period.
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Policy Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Target Policy
              </label>
              <select
                value={policyId}
                onChange={(e) => setPolicyId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
              >
                {policies.map((p) => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                    {p.name} (Waiting: {p.waitingPeriodHours}h, Window: {p.accessDurationHours}h, Documents: {p.documents?.length || 0})
                  </option>
                ))}
              </select>
            </div>

            {/* Emergency Circumstances */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Detailed Circumstances / Reason
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows="4"
                placeholder="Explain the circumstances requiring emergency access (e.g., owner hospitalization, legal estate handling, insurance emergency claim)..."
                required
                className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm resize-none"
              />
            </div>

            {/* Proof Attachment */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Proof Document / Evidence File (Optional)
              </label>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-300 min-w-0">
                  <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="truncate">{evidenceFile ? evidenceFile.name : 'Upload medical certificate, power of attorney, or affidavit'}</span>
                </div>
                <label className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer shrink-0 ml-3">
                  Browse File
                  <input
                    type="file"
                    onChange={(e) => setEvidenceFile(e.target.files[0])}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20 text-sm flex items-center justify-center gap-2"
            >
              {submitting ? 'Transmitting Claim...' : 'Submit Emergency Claim to Vault'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
