import React, { useState, useEffect } from 'react';
import { nomineeService } from '../../services/nomineeService';
import { NomineeCard } from '../../components/nominees/NomineeCard';
import { AddNomineeModal } from '../../components/nominees/AddNomineeModal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Users, UserPlus, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export const NomineesPage = () => {
  const [nominees, setNominees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadNominees();
  }, []);

  const loadNominees = async () => {
    setLoading(true);
    try {
      const res = await nomineeService.getNominees();
      if (res.success) setNominees(res.data);
    } catch (err) {
      console.error('Error loading nominees:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendInvite = async (id) => {
    try {
      await nomineeService.resendInvite(id);
      showToast('Invitation re-sent with new verification token.');
      loadNominees();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to resend invitation.');
    }
  };

  const handleDeleteNominee = async () => {
    if (!deleteId) return;
    try {
      await nomineeService.deleteNominee(deleteId);
      setDeleteId(null);
      showToast('Nominee designation removed.');
      loadNominees();
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Cannot delete nominee with active policies.');
      setDeleteId(null);
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
            <Users className="w-7 h-7 text-emerald-400" /> Trusted Nominees
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Designate trusted contacts who can request legacy emergency document access.
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl emerald-gradient text-slate-950 hover:opacity-95 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 shrink-0"
        >
          <UserPlus className="w-4 h-4 stroke-[3]" /> Designate Nominee
        </button>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="text-xs underline hover:text-white">
            Dismiss
          </button>
        </div>
      )}

      {/* Nominees Grid */}
      {loading ? (
        <LoadingSpinner text="Fetching designated nominees..." />
      ) : nominees.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Nominees Designated"
          description="Designate a trusted family member or legal executor to ensure continuity in emergencies."
          actionText="Designate First Nominee"
          onAction={() => setAddModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nominees.map((nom) => (
            <NomineeCard
              key={nom.id}
              nominee={nom}
              onResendInvite={handleResendInvite}
              onDelete={(id) => setDeleteId(id)}
            />
          ))}
        </div>
      )}

      {/* Add Nominee Modal */}
      <AddNomineeModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={() => {
          showToast('Nominee added and invitation issued.');
          loadNominees();
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteNominee}
        title="Remove Nominee Designation?"
        message="This will revoke all pending invitations and access roles for this contact. Nominees with active policies must have policies removed first."
        confirmText="Remove Nominee"
        danger={true}
      />
    </div>
  );
};
