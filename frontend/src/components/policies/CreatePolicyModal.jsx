import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { policyService } from '../../services/policyService';
import {
  FileCheck,
  Users,
  Clock,
  ShieldAlert,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Lock
} from 'lucide-react';

export const CreatePolicyModal = ({
  isOpen,
  onClose,
  onSuccess,
  nominees = [],
  documents = [],
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [nomineeId, setNomineeId] = useState(nominees[0]?.id || '');
  const [selectedDocIds, setSelectedDocIds] = useState([]);
  const [waitingPeriodHours, setWaitingPeriodHours] = useState(24);
  const [approvalType, setApprovalType] = useState('OWNER_OR_ADMIN');
  const [accessDurationHours, setAccessDurationHours] = useState(48);
  const [policyExpiryDate, setPolicyExpiryDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleDocument = (id) => {
    if (selectedDocIds.includes(id)) {
      setSelectedDocIds(selectedDocIds.filter((d) => d !== id));
    } else {
      setSelectedDocIds([...selectedDocIds, id]);
    }
  };

  const selectAllDocs = () => {
    if (selectedDocIds.length === documents.length) {
      setSelectedDocIds([]);
    } else {
      setSelectedDocIds(documents.map((d) => d.id));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!nomineeId) {
      setError('Please select a designated nominee for this policy.');
      return;
    }
    if (selectedDocIds.length === 0) {
      setError('Please select at least one document to grant access to.');
      return;
    }

    setLoading(true);
    try {
      await policyService.createPolicy({
        name,
        description,
        nomineeId,
        documentIds: selectedDocIds,
        waitingPeriodHours: Number(waitingPeriodHours),
        approvalType,
        accessDurationHours: Number(accessDurationHours),
        policyExpiryDate: policyExpiryDate || null,
      });

      setName('');
      setDescription('');
      setSelectedDocIds([]);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create emergency policy.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configure Emergency Digital Legacy Policy" maxWidth="max-w-2xl">
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name & Nominee */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Policy Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Critical Medical Emergency Policy"
              required
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Designated Nominee
            </label>
            <select
              value={nomineeId}
              onChange={(e) => setNomineeId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
            >
              <option value="" disabled className="bg-slate-900 text-slate-500">
                Select a Nominee...
              </option>
              {nominees.map((n) => (
                <option key={n.id} value={n.id} className="bg-slate-900 text-white">
                  {n.name} ({n.email}) - {n.verificationStatus}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Access Scope &amp; Conditions
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Emergency medical & insurance documents retrieval upon hospital admission."
            className="w-full px-3.5 py-2 rounded-xl glass-input text-sm"
          />
        </div>

        {/* Document Selection Grid */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Select Authorized Documents ({selectedDocIds.length} chosen)
            </label>
            <button
              type="button"
              onClick={selectAllDocs}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              {selectedDocIds.length === documents.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="max-h-48 overflow-y-auto rounded-xl bg-slate-900/60 border border-slate-800 p-2 space-y-1.5 divide-y divide-slate-800/40">
            {documents.length === 0 ? (
              <p className="text-xs text-slate-500 p-3 text-center">
                No documents found in vault. Upload documents first.
              </p>
            ) : (
              documents.map((doc) => {
                const isSelected = selectedDocIds.includes(doc.id);
                return (
                  <div
                    key={doc.id}
                    onClick={() => toggleDocument(doc.id)}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-500/15 border border-emerald-500/30 text-white'
                        : 'hover:bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                            : 'border-slate-600 bg-slate-800'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-xs font-medium truncate">{doc.title}</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-emerald-400 shrink-0">
                      {doc.categoryName}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Waiting Period & Approval Rules */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Waiting Period
            </label>
            <select
              value={waitingPeriodHours}
              onChange={(e) => setWaitingPeriodHours(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs"
            >
              <option value="0" className="bg-slate-900 text-white">0 Hours (Immediate)</option>
              <option value="12" className="bg-slate-900 text-white">12 Hours</option>
              <option value="24" className="bg-slate-900 text-white">24 Hours</option>
              <option value="48" className="bg-slate-900 text-white">48 Hours</option>
              <option value="72" className="bg-slate-900 text-white">72 Hours</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Approval Rule
            </label>
            <select
              value={approvalType}
              onChange={(e) => setApprovalType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs"
            >
              <option value="OWNER_OR_ADMIN" className="bg-slate-900 text-white">Owner or Admin</option>
              <option value="OWNER_ONLY" className="bg-slate-900 text-white">Owner Only</option>
              <option value="ADMIN_ONLY" className="bg-slate-900 text-white">Admin Only</option>
              <option value="AUTO_AFTER_TIMEOUT" className="bg-slate-900 text-white">Auto After Waiting Period</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Access Duration
            </label>
            <select
              value={accessDurationHours}
              onChange={(e) => setAccessDurationHours(e.target.value)}
              className="w-full px-3 py-2 rounded-xl glass-input text-xs"
            >
              <option value="24" className="bg-slate-900 text-white">24 Hours</option>
              <option value="48" className="bg-slate-900 text-white">48 Hours</option>
              <option value="72" className="bg-slate-900 text-white">72 Hours</option>
              <option value="168" className="bg-slate-900 text-white">7 Days (168 Hours)</option>
            </select>
          </div>
        </div>

        {/* Policy Expiry */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Policy Expiration Date (Optional)
          </label>
          <input
            type="date"
            value={policyExpiryDate}
            onChange={(e) => setPolicyExpiryDate(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl glass-input text-sm"
          />
        </div>

        {/* Security Summary Callout */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 flex items-center gap-3">
          <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Nominees only gain temporary decryption permissions to the explicitly chosen documents once approved.
          </span>
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
            className="px-5 py-2 text-sm font-semibold rounded-xl emerald-gradient text-slate-950 hover:opacity-95 shadow-md shadow-emerald-500/20"
          >
            {loading ? 'Creating Policy...' : 'Save & Enforce Policy'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
