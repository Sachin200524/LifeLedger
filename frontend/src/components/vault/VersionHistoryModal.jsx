import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { documentService } from '../../services/documentService';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { History, UploadCloud, CheckCircle2, FileText, AlertCircle } from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

export const VersionHistoryModal = ({ isOpen, onClose, document: doc, onSuccess }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newFile, setNewFile] = useState(null);
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && doc) {
      loadVersions();
    }
  }, [isOpen, doc]);

  const loadVersions = async () => {
    setLoading(true);
    try {
      const res = await documentService.getVersions(doc.id);
      if (res.success) setVersions(res.data);
    } catch (err) {
      setError('Could not retrieve version history.');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadNewVersion = async (e) => {
    e.preventDefault();
    if (!newFile) {
      setError('Please select a file to upload as the new version.');
      return;
    }

    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', newFile);
      if (summary) formData.append('changeSummary', summary);

      await documentService.uploadVersion(doc.id, formData);
      setNewFile(null);
      setSummary('');
      await loadVersions();
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload new version.');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen || !doc) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Version History: ${doc.title}`} maxWidth="max-w-xl">
      <div className="space-y-6">
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Upload New Version Section */}
        <form onSubmit={handleUploadNewVersion} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <UploadCloud className="w-4 h-4 text-emerald-400" /> Upload New Version
          </h4>

          <div>
            <input
              type="file"
              onChange={(e) => setNewFile(e.target.files[0])}
              className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-500/20 file:text-emerald-300 hover:file:bg-emerald-500/30"
            />
          </div>

          <div>
            <input
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Summary of changes (e.g. Annual renewal update)"
              className="w-full px-3 py-1.5 rounded-lg glass-input text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={uploading || !newFile}
            className="w-full py-2 text-xs font-semibold rounded-xl emerald-gradient text-slate-950 hover:opacity-95 disabled:opacity-50 transition-all"
          >
            {uploading ? 'Encrypting & Saving New Version...' : 'Commit Version to Encrypted Vault'}
          </button>
        </form>

        {/* Versions Timeline */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <History className="w-4 h-4 text-indigo-400" /> Historical Revisions
          </h4>

          {loading ? (
            <LoadingSpinner text="Fetching version records..." />
          ) : (
            <div className="space-y-2.5">
              {versions.map((v, idx) => (
                <div
                  key={v.id}
                  className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="px-2 py-1 rounded bg-slate-800 text-xs font-bold font-mono text-emerald-400">
                      v{v.versionNumber}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">
                        {v.changeSummary || 'Revision update'}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        SHA-256: {v.checksumSha256 ? `${v.checksumSha256.substring(0, 16)}...` : '-'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right text-[11px] text-slate-400 shrink-0">
                    <p>{formatDateTime(v.createdAt)}</p>
                    <p className="font-mono text-slate-500">{v.fileSize} bytes</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
