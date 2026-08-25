import React, { useState, useEffect } from 'react';
import { documentService } from '../../services/documentService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { FolderTree, Plus, Folder, Trash2, FileText, CheckCircle2, ChevronRight } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const FoldersPage = () => {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [folderColor, setFolderColor] = useState('#3B82F6');
  const [deleteFolderId, setDeleteFolderId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#06B6D4', '#64748B'];

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    setLoading(true);
    try {
      const res = await documentService.getFolders();
      if (res.success) setFolders(res.data);
    } catch (e) {
      console.error('Failed to load folders:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!folderName.trim()) return;

    try {
      await documentService.createFolder({
        name: folderName.trim(),
        color: folderColor,
      });
      setFolderName('');
      setCreateModalOpen(false);
      showToast('Folder created successfully.');
      loadFolders();
    } catch (e) {
      console.error('Error creating folder:', e);
    }
  };

  const handleDeleteFolder = async () => {
    if (!deleteFolderId) return;
    try {
      await documentService.deleteFolder(deleteFolderId);
      setDeleteFolderId(null);
      showToast('Folder deleted.');
      loadFolders();
    } catch (e) {
      console.error('Error deleting folder:', e);
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
            <FolderTree className="w-7 h-7 text-emerald-400" /> Custom Vault Folders
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Organize personal documents into structured hierarchies and custom archives.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl emerald-gradient text-slate-950 hover:opacity-95 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Create New Folder
        </button>
      </div>

      {/* Folders Grid */}
      {loading ? (
        <LoadingSpinner text="Loading folder structures..." />
      ) : folders.length === 0 ? (
        <EmptyState
          icon={Folder}
          title="No Custom Folders Yet"
          description="Create folders to group related identity, legal, or financial records."
          actionText="Create First Folder"
          onAction={() => setCreateModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {folders.map((f) => (
            <div
              key={f.id}
              className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-inner"
                    style={{ backgroundColor: `${f.color}25`, color: f.color }}
                  >
                    <Folder className="w-5 h-5 fill-current opacity-80" />
                  </div>

                  <button
                    onClick={() => setDeleteFolderId(f.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete Folder"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h4 className="font-bold text-white text-base truncate">{f.name}</h4>
                <span className="text-xs text-slate-400 mt-1 block font-mono">
                  {f.documentCount} {f.documentCount === 1 ? 'document' : 'documents'}
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Created {formatDate(f.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Folder Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create New Vault Folder" maxWidth="max-w-md">
        <form onSubmit={handleCreateFolder} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Folder Name
            </label>
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="e.g. Tax Filings 2026"
              required
              className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Folder Color Accent
            </label>
            <div className="flex items-center gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFolderColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    folderColor === c ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold rounded-xl emerald-gradient text-slate-950 hover:opacity-95"
            >
              Create Folder
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Folder Confirm */}
      <ConfirmDialog
        isOpen={!!deleteFolderId}
        onClose={() => setDeleteFolderId(null)}
        onConfirm={handleDeleteFolder}
        title="Delete Folder?"
        message="Deleting this folder will not delete its documents. All files will remain safely accessible in the root vault."
        confirmText="Delete Folder"
        danger={true}
      />
    </div>
  );
};
