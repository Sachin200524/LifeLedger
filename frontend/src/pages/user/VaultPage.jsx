import React, { useState, useEffect } from 'react';
import { documentService } from '../../services/documentService';
import { DocumentTable } from '../../components/vault/DocumentTable';
import { DocumentGrid } from '../../components/vault/DocumentGrid';
import { UploadModal } from '../../components/vault/UploadModal';
import { FilePreviewModal } from '../../components/vault/FilePreviewModal';
import { VersionHistoryModal } from '../../components/vault/VersionHistoryModal';
import { DocumentDetailsModal } from '../../components/vault/DocumentDetailsModal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import {
  FolderLock,
  Search,
  LayoutGrid,
  List,
  UploadCloud,
  Star,
  Trash2,
  Filter,
  Plus,
  RotateCcw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const VaultPage = () => {
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [filterFavorite, setFilterFavorite] = useState(false);
  const [filterTrash, setFilterTrash] = useState(false);

  // Modals state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [versionDoc, setVersionDoc] = useState(null);
  const [detailsDoc, setDetailsDoc] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [permanentDeleteId, setPermanentDeleteId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadVaultData();
  }, [selectedCategory, filterFavorite, filterTrash]);

  const loadVaultData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory !== 'ALL') params.categoryId = selectedCategory;
      if (filterFavorite) params.favorite = true;
      if (filterTrash) params.deleted = true;
      if (search.trim()) params.search = search.trim();

      const [docsRes, catsRes, foldersRes] = await Promise.all([
        documentService.getDocuments(params),
        documentService.getCategories(),
        documentService.getFolders(),
      ]);

      if (docsRes.success) setDocuments(docsRes.data);
      if (catsRes.success) setCategories(catsRes.data);
      if (foldersRes.success) setFolders(foldersRes.data);
    } catch (err) {
      console.error('Failed to load vault documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadVaultData();
  };

  const handleToggleFavorite = async (id) => {
    try {
      await documentService.toggleFavorite(id);
      setDocuments((prev) =>
        prev.map((d) => (d.id === id ? { ...d, favorite: !d.favorite } : d))
      );
    } catch (e) {
      console.error('Failed to toggle favorite:', e);
    }
  };

  const handleSoftDelete = async () => {
    if (!deleteId) return;
    try {
      await documentService.softDelete(deleteId);
      setDeleteId(null);
      showToast('Document moved to trash.');
      loadVaultData();
    } catch (e) {
      console.error('Delete error:', e);
    }
  };

  const handleRestore = async (id) => {
    try {
      await documentService.restore(id);
      showToast('Document restored to vault.');
      loadVaultData();
    } catch (e) {
      console.error('Restore error:', e);
    }
  };

  const handlePermanentDelete = async () => {
    if (!permanentDeleteId) return;
    try {
      await documentService.permanentDelete(permanentDeleteId);
      setPermanentDeleteId(null);
      showToast('Document permanently purged from encrypted storage.');
      loadVaultData();
    } catch (e) {
      console.error('Purge error:', e);
    }
  };

  const handleDownload = (doc) => {
    documentService.downloadDocument(doc.id, doc.originalFilename);
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Upload Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <FolderLock className="w-7 h-7 text-emerald-400" /> Secure Document Vault
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Browse, manage, and encrypt personal records with authenticated AES-256-GCM.
          </p>
        </div>

        <button
          onClick={() => setUploadOpen(true)}
          className="px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl emerald-gradient text-slate-950 hover:opacity-95 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 shrink-0"
        >
          <UploadCloud className="w-4 h-4 stroke-[2.5]" /> Encrypt &amp; Upload
        </button>
      </div>

      {/* Control Bar: Search & Category Chips */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, filename, or notes..."
              className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs"
            />
          </form>

          {/* Quick Filters & View Mode */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setFilterFavorite(!filterFavorite);
                setFilterTrash(false);
              }}
              className={`px-3 py-2 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-colors ${
                filterFavorite
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${filterFavorite ? 'fill-amber-400' : ''}`} />
              Favorites
            </button>

            <button
              onClick={() => {
                setFilterTrash(!filterTrash);
                setFilterFavorite(false);
              }}
              className={`px-3 py-2 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-colors ${
                filterTrash
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Trash
            </button>

            {/* Grid/Table Switcher */}
            <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Chips */}
        {!filterTrash && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-1 text-xs">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1 rounded-full font-semibold shrink-0 transition-colors ${
                selectedCategory === 'ALL'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-full font-semibold shrink-0 transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat.name} ({cat.documentCount || 0})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Document Listing */}
      {loading ? (
        <LoadingSpinner text="Retrieving vault records..." />
      ) : documents.length === 0 ? (
        <EmptyState
          icon={FolderLock}
          title={filterTrash ? 'Trash is Empty' : 'No documents in vault'}
          description={
            filterTrash
              ? 'Deleted documents will appear here before permanent purging.'
              : 'Upload your first personal document to encrypt and secure it.'
          }
          actionText={!filterTrash ? 'Encrypt & Upload Document' : null}
          onAction={() => setUploadOpen(true)}
        />
      ) : viewMode === 'table' ? (
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
          <DocumentTable
            documents={documents}
            onPreview={(doc) => setPreviewDoc(doc)}
            onDownload={handleDownload}
            onToggleFavorite={handleToggleFavorite}
            onDelete={(id) => setDeleteId(id)}
            onRestore={handleRestore}
            onPermanentDelete={(id) => setPermanentDeleteId(id)}
            onViewVersions={(doc) => setVersionDoc(doc)}
            onViewDetails={(doc) => setDetailsDoc(doc)}
            isTrash={filterTrash}
          />
        </div>
      ) : (
        <DocumentGrid
          documents={documents}
          onPreview={(doc) => setPreviewDoc(doc)}
          onDownload={handleDownload}
          onToggleFavorite={handleToggleFavorite}
          onDelete={(id) => setDeleteId(id)}
          onRestore={handleRestore}
          onPermanentDelete={(id) => setPermanentDeleteId(id)}
          onViewVersions={(doc) => setVersionDoc(doc)}
          onViewDetails={(doc) => setDetailsDoc(doc)}
          isTrash={filterTrash}
        />
      )}

      {/* Upload Modal */}
      <UploadModal
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={() => {
          showToast('Document securely encrypted & saved to vault.');
          loadVaultData();
        }}
        categories={categories}
        folders={folders}
      />

      {/* Preview Modal */}
      <FilePreviewModal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        document={previewDoc}
      />

      {/* Version History Modal */}
      <VersionHistoryModal
        isOpen={!!versionDoc}
        onClose={() => setVersionDoc(null)}
        document={versionDoc}
        onSuccess={() => {
          showToast('New version committed to encrypted vault.');
          loadVaultData();
        }}
      />

      {/* Document Details Modal */}
      <DocumentDetailsModal
        isOpen={!!detailsDoc}
        onClose={() => setDetailsDoc(null)}
        document={detailsDoc}
      />

      {/* Soft Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleSoftDelete}
        title="Move Document to Trash?"
        message="This document will be archived in the trash bin. You can restore it anytime or permanently purge it."
        confirmText="Move to Trash"
        danger={true}
      />

      {/* Permanent Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!permanentDeleteId}
        onClose={() => setPermanentDeleteId(null)}
        onConfirm={handlePermanentDelete}
        title="Permanently Purge Document?"
        message="WARNING: This action is irreversible. The AES-256 encrypted payload and all revision versions will be wiped from storage."
        confirmText="Permanently Purge"
        danger={true}
      />
    </div>
  );
};
