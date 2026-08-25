import React from 'react';
import { Modal } from '../common/Modal';
import { ShieldCheck, Calendar, HardDrive, Tag, Layers, FileCode, CheckCircle } from 'lucide-react';
import { formatDateTime, formatDate } from '../../utils/formatters';

export const DocumentDetailsModal = ({ isOpen, onClose, document: doc }) => {
  if (!isOpen || !doc) return null;

  let parsedMetadata = {};
  try {
    if (doc.extractedMetadataJson) {
      parsedMetadata = JSON.parse(doc.extractedMetadataJson);
    }
  } catch (e) {
    // Ignore JSON parse errors
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Document Intelligence: ${doc.title}`} maxWidth="max-w-xl">
      <div className="space-y-5 text-sm">
        {/* Security Certificate Banner */}
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-emerald-300 text-xs uppercase tracking-wider">
              AES-256-GCM Vault Protected
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Ciphertext integrity validated. File payload is isolated in non-public storage.
            </p>
          </div>
        </div>

        {/* Basic Properties Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-semibold uppercase block">Original Filename</span>
            <span className="text-xs text-white font-mono truncate block mt-0.5">{doc.originalFilename}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-semibold uppercase block">Category</span>
            <span className="text-xs text-emerald-400 font-medium block mt-0.5">{doc.categoryName || 'General'}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-semibold uppercase block">MIME Type</span>
            <span className="text-xs text-slate-300 font-mono block mt-0.5">{doc.mimeType}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-semibold uppercase block">Encrypted Payload Size</span>
            <span className="text-xs text-slate-300 font-mono block mt-0.5">{doc.formattedFileSize || `${doc.fileSize} B`}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-semibold uppercase block">Expiry Date</span>
            <span className="text-xs text-slate-300 block mt-0.5">{doc.expiryDate ? formatDate(doc.expiryDate) : 'No expiration set'}</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-semibold uppercase block">Created Timestamp</span>
            <span className="text-xs text-slate-300 block mt-0.5">{formatDateTime(doc.createdAt)}</span>
          </div>
        </div>

        {/* SHA-256 Checksum */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[11px] text-slate-400 font-semibold uppercase block flex items-center gap-1">
            <FileCode className="w-3.5 h-3.5 text-cyan-400" /> SHA-256 Cryptographic Checksum
          </span>
          <p className="text-xs text-slate-300 font-mono break-all mt-1 bg-slate-950/80 p-2 rounded-lg border border-slate-800">
            {doc.checksumSha256 || 'Calculated on upload'}
          </p>
        </div>

        {/* Apache Tika Extracted Properties */}
        {Object.keys(parsedMetadata).length > 0 && (
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-semibold uppercase block mb-2">
              Apache Tika Extracted Metadata
            </span>
            <div className="space-y-1 text-xs font-mono max-h-36 overflow-y-auto pr-2">
              {Object.entries(parsedMetadata).map(([key, val]) => (
                <div key={key} className="flex items-start justify-between gap-2 py-0.5 border-b border-slate-800/40">
                  <span className="text-slate-400 shrink-0">{key}:</span>
                  <span className="text-slate-200 truncate">{String(val)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Personal Notes */}
        {doc.notes && (
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 font-semibold uppercase block mb-1">Confidential Notes</span>
            <p className="text-xs text-slate-300 italic">{doc.notes}</p>
          </div>
        )}
      </div>
    </Modal>
  );
};
