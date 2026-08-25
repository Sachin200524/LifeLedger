import React from 'react';
import {
  FileText,
  Star,
  Download,
  Eye,
  Trash2,
  RotateCcw,
  History,
  Info,
  ShieldCheck,
  AlertTriangle,
  Calendar
} from 'lucide-react';
import { Badge } from '../common/Badge';

export const DocumentGrid = ({
  documents = [],
  onPreview,
  onDownload,
  onToggleFavorite,
  onDelete,
  onRestore,
  onPermanentDelete,
  onViewVersions,
  onViewDetails,
  isTrash = false,
}) => {
  if (documents.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {documents.map((doc) => {
        const isExp = doc.expired;
        const isExpSoon = !isExp && doc.daysUntilExpiry > 0 && doc.daysUntilExpiry <= 30;

        return (
          <div
            key={doc.id}
            className="glass-panel p-4 rounded-2xl border border-slate-800 hover:border-slate-700/80 transition-all duration-200 flex flex-col justify-between group"
          >
            {/* Header: Category & Favorite */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <Badge variant="emerald" size="xs">
                  {doc.categoryName || 'General'}
                </Badge>

                {!isTrash && (
                  <button
                    onClick={() => onToggleFavorite(doc.id)}
                    className={`p-1 rounded transition-colors ${
                      doc.favorite ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${doc.favorite ? 'fill-amber-400' : ''}`} />
                  </button>
                )}
              </div>

              {/* Title & Preview Icon */}
              <div className="flex items-start gap-3 my-2">
                <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-sm text-white truncate leading-snug" title={doc.title}>
                    {doc.title}
                  </h4>
                  <p className="text-xs text-slate-400 truncate mt-0.5" title={doc.originalFilename}>
                    {doc.originalFilename}
                  </p>
                </div>
              </div>

              {/* Metadata tags */}
              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono">{doc.formattedFileSize || `${doc.fileSize} B`}</span>
                <button
                  onClick={() => onViewVersions(doc)}
                  className="px-1.5 py-0.5 rounded bg-slate-800 text-[11px] font-mono text-slate-300 hover:text-white"
                >
                  v{doc.version || 1}
                </button>
              </div>

              {/* Expiry Badge */}
              <div className="mt-2">
                {isExp ? (
                  <Badge variant="rose" size="xs">
                    <AlertTriangle className="w-3 h-3" /> Expired
                  </Badge>
                ) : isExpSoon ? (
                  <Badge variant="amber" size="xs">
                    <Calendar className="w-3 h-3" /> Expiring in {doc.daysUntilExpiry}d
                  </Badge>
                ) : doc.expiryDate ? (
                  <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3 text-slate-500" /> {doc.expiryDate}
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-500/70" /> AES-256 Vault
                  </span>
                )}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-1">
              {!isTrash ? (
                <>
                  <button
                    onClick={() => onPreview(doc)}
                    className="p-1.5 text-xs font-semibold rounded-lg bg-slate-800/60 hover:bg-slate-700/80 text-slate-300 hover:text-white flex items-center gap-1 px-2.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-400" /> Preview
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onDownload(doc)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                      title="Download Decrypted"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onViewDetails(doc)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                      title="Details"
                    >
                      <Info className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(doc.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Move to Trash"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-full flex items-center justify-between">
                  <button
                    onClick={() => onRestore(doc.id)}
                    className="p-1.5 text-xs rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 flex items-center gap-1 px-2.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Restore
                  </button>
                  <button
                    onClick={() => onPermanentDelete(doc.id)}
                    className="p-1.5 text-xs rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 flex items-center gap-1 px-2.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Purge
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
