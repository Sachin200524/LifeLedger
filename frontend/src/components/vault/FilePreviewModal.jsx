import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { documentService } from '../../services/documentService';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Download, AlertCircle, FileText, Lock, ShieldCheck } from 'lucide-react';

export const FilePreviewModal = ({ isOpen, onClose, document: doc }) => {
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && doc) {
      loadPreview();
    } else {
      setPreviewData(null);
      setError('');
    }
  }, [isOpen, doc]);

  const loadPreview = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await documentService.previewDocumentBlob(doc.id);
      setPreviewData(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to decrypt document preview.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (doc) {
      documentService.downloadDocument(doc.id, doc.originalFilename);
    }
  };

  if (!isOpen || !doc) return null;

  const isPdf = doc.mimeType === 'application/pdf' || doc.originalFilename?.toLowerCase().endsWith('.pdf');
  const isImage = doc.mimeType?.startsWith('image/') ||
    doc.originalFilename?.toLowerCase().endsWith('.jpg') ||
    doc.originalFilename?.toLowerCase().endsWith('.jpeg') ||
    doc.originalFilename?.toLowerCase().endsWith('.png');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Preview: ${doc.title}`} maxWidth="max-w-4xl">
      <div className="space-y-4">
        {/* Banner with encryption verification & download */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Decrypted on-the-fly via AES-256-GCM authenticated session</span>
          </div>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg emerald-gradient text-slate-950 hover:opacity-95 transition-all shadow"
          >
            <Download className="w-3.5 h-3.5" /> Download Decrypted
          </button>
        </div>

        {/* Main preview window */}
        <div className="h-[60vh] rounded-xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center relative">
          {loading && <LoadingSpinner text="Decrypting document in memory..." />}

          {error && (
            <div className="text-center p-6 space-y-2">
              <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
              <p className="text-sm font-semibold text-rose-300">{error}</p>
              <p className="text-xs text-slate-400">Check that you have authorization to access this file.</p>
            </div>
          )}

          {!loading && !error && previewData && (
            <>
              {isPdf ? (
                <iframe
                  src={previewData.blobUrl}
                  title="PDF Preview"
                  className="w-full h-full border-none rounded-xl"
                />
              ) : isImage ? (
                <img
                  src={previewData.blobUrl}
                  alt={doc.title}
                  className="max-h-full max-w-full object-contain p-2 rounded-xl"
                />
              ) : (
                <div className="text-center p-8 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
                    <FileText className="w-8 h-8 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">{doc.originalFilename}</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Direct inline viewer is optimized for PDF and images. Click below to download the decrypted file.
                    </p>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="px-4 py-2 text-sm font-semibold rounded-xl emerald-gradient text-slate-950 inline-flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" /> Download File
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};
