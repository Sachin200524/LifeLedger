import React, { useState, useEffect } from 'react';
import { policyService } from '../../services/policyService';
import { nomineeService } from '../../services/nomineeService';
import { documentService } from '../../services/documentService';
import { PolicyCard } from '../../components/policies/PolicyCard';
import { CreatePolicyModal } from '../../components/policies/CreatePolicyModal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { FileCheck, Plus, CheckCircle2, ShieldAlert } from 'lucide-react';

export const PoliciesPage = () => {
  const [policies, setPolicies] = useState([]);
  const [nominees, setNominees] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadPoliciesAndData();
  }, []);

  const loadPoliciesAndData = async () => {
    setLoading(true);
    try {
      const [polsRes, nomsRes, docsRes] = await Promise.all([
        policyService.getPolicies(),
        nomineeService.getNominees(),
        documentService.getDocuments(),
      ]);

      if (polsRes.success) setPolicies(polsRes.data);
      if (nomsRes.success) setNominees(nomsRes.data);
      if (docsRes.success) setDocuments(docsRes.data);
    } catch (e) {
      console.error('Failed to load policies:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id) => {
    try {
      const res = await policyService.toggleActive(id);
      if (res.success) {
        setPolicies((prev) =>
          prev.map((p) => (p.id === id ? { ...p, active: res.data.active } : p))
        );
        showToast(res.data.active ? 'Policy enabled.' : 'Policy disabled.');
      }
    } catch (e) {
      console.error('Toggle active error:', e);
    }
  };

  const handleDeletePolicy = async () => {
    if (!deleteId) return;
    try {
      await policyService.deletePolicy(deleteId);
      setDeleteId(null);
      showToast('Policy deleted.');
      loadPoliciesAndData();
    } catch (e) {
      console.error('Delete policy error:', e);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
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
            <FileCheck className="w-7 h-7 text-emerald-400" /> Policy Engine Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Establish automated emergency rules, waiting periods, approval gates, and document bindings.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl emerald-gradient text-slate-950 hover:opacity-95 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Create Policy Rule
        </button>
      </div>

      {/* Policies Grid */}
      {loading ? (
        <LoadingSpinner text="Compiling policy engine rules..." />
      ) : policies.length === 0 ? (
        <EmptyState
          icon={FileCheck}
          title="No Emergency Policies Configured"
          description="Create your first policy to grant selective document permissions to a designated nominee in emergencies."
          actionText="Create Emergency Policy"
          onAction={() => setCreateModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {policies.map((p) => (
            <PolicyCard
              key={p.id}
              policy={p}
              onToggleActive={handleToggleActive}
              onDelete={(id) => setDeleteId(id)}
            />
          ))}
        </div>
      )}

      {/* Create Policy Wizard Modal */}
      <CreatePolicyModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          showToast('Policy created and armed.');
          loadPoliciesAndData();
        }}
        nominees={nominees}
        documents={documents}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeletePolicy}
        title="Delete Emergency Policy?"
        message="Deleting this policy will prevent the designated nominee from requesting emergency access to its bound documents."
        confirmText="Delete Policy"
        danger={true}
      />
    </div>
  );
};
