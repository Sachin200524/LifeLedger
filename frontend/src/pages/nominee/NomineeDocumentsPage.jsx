import React, { useState, useEffect } from 'react';
import { emergencyService } from '../../services/emergencyService';
import { documentService } from '../../services/documentService';
import { FilePreviewModal } from '../../components/vault/FilePreviewModal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/common/Badge';
import { FolderLock, Eye, Download, ShieldCheck, Clock, FileText, AlertCircle } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

export const NomineeDocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewDoc, setPreviewDoc] = useState(null);

  useEffect(() => {
    loadAccessibleDocuments();
  }, []);

  const loadAccessibleDocuments = async () => {
    setLoading(true);
    try {
      const res = await emergencyService.getAccessibleDocuments();
      if (res.success) setDocuments(res.data);
    } catch (e) {
      console.error('Failed to load accessible documents:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (doc) => {
    documentService.downloadDocument(doc.id, doc.originalFilename);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <FolderLock className="w-7 h-7 text-emerald-400" /> Accessible Emergency Documents
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Authorized legacy documents available for decryption under active emergency policies.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Querying authorized document permissions..." />
      ) : documents.length === 0 ? (
        <EmptyState
          icon={FolderLock}
          title="No Documents Unlocked"
          description="Documents are only accessible once an emergency access request has been approved by the vault owner or admin and the waiting period has completed."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="glass-panel p-5 rounded-2xl border border-emerald-500/30 shadow-lg shadow-emerald-500/5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="emerald" size="xs">
                    {doc.categoryName || 'General'}
                  </Badge>
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 font-mono">
                    <ShieldCheck className="w-3 h-3" /> Decryption Allowed
                  </span>
                </div>

                <div className="flex items-start gap-3 my-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-white truncate">{doc.title}</h4>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{doc.originalFilename}</p>
                  </div>
                </div>

                <div className="mt-3 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>File Size:</span>
                    <span className="font-mono text-slate-200">{doc.formattedFileSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vault Owner:</span>
                    <span className="text-slate-200 font-medium">{doc.ownerName}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => setPreviewDoc(doc)}
                  className="flex-1 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-emerald-400" /> Preview
                </button>

                <button
                  onClick={() => handleDownload(doc)}
                  className="flex-1 py-2 text-xs font-semibold rounded-xl emerald-gradient text-slate-950 hover:opacity-95 flex items-center justify-center gap-1.5 transition-all shadow"
                >
                  <Download className="w-3.5 h-3.5" /> Decrypt &amp; Save
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Decrypted Preview Modal */}
      <FilePreviewModal
        isOpen={!!previewDoc}
        onClose={() => setPreviewDoc(null)}
        document={previewDoc}
      />
    </div>
  );
};
