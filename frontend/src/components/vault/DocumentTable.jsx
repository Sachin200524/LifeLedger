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
  MoreVertical,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { Badge } from '../common/Badge';

export const DocumentTable = ({
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
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-slate-300">
        <thead className="bg-slate-900/60 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
          <tr>
            <th scope="col" className="px-4 py-3.5 w-10"></th>
            <th scope="col" className="px-4 py-3.5 font-bold">Document Title</th>
            <th scope="col" className="px-4 py-3.5 font-bold">Category</th>
            <th scope="col" className="px-4 py-3.5 font-bold">Size</th>
            <th scope="col" className="px-4 py-3.5 font-bold">Version</th>
            <th scope="col" className="px-4 py-3.5 font-bold">Status / Expiry</th>
            <th scope="col" className="px-4 py-3.5 text-right font-bold">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800/60">
          {documents.map((doc) => {
            const isExp = doc.expired;
            const isExpSoon = !isExp && doc.daysUntilExpiry > 0 && doc.daysUntilExpiry <= 30;

            return (
              <tr
                key={doc.id}
                className="hover:bg-slate-800/30 transition-colors group"
              >
                {/* Favorite Star */}
                <td className="px-4 py-3 text-center">
                  {!isTrash && (
                    <button
                      onClick={() => onToggleFavorite(doc.id)}
                      className={`p-1 rounded transition-colors ${
                        doc.favorite ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'
                      }`}
                      title={doc.favorite ? 'Remove Favorite' : 'Mark Favorite'}
                    >
                      <Star className={`w-4 h-4 ${doc.favorite ? 'fill-amber-400' : ''}`} />
                    </button>
                  )}
                </td>

                {/* Title and Original Filename */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-emerald-400 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-white truncate max-w-xs sm:max-w-md">
                        {doc.title}
                      </div>
                      <div className="text-xs text-slate-500 truncate flex items-center gap-1.5">
                        <span>{doc.originalFilename}</span>
                        {doc.folderName && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                            {doc.folderName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Category */}
                <td className="px-4 py-3">
                  <Badge variant="emerald" size="xs">
                    {doc.categoryName || 'General'}
                  </Badge>
                </td>

                {/* File Size */}
                <td className="px-4 py-3 text-xs text-slate-400 font-mono">
                  {doc.formattedFileSize || `${doc.fileSize} B`}
                </td>

                {/* Version */}
                <td className="px-4 py-3">
                  <button
                    onClick={() => onViewVersions(doc)}
                    className="px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700/50 transition-colors"
                  >
                    v{doc.version || 1}
                  </button>
                </td>

                {/* Expiry & Encryption status */}
                <td className="px-4 py-3">
                  {isExp ? (
                    <Badge variant="rose" size="xs">
                      <AlertTriangle className="w-3 h-3" /> Expired
                    </Badge>
                  ) : isExpSoon ? (
                    <Badge variant="amber" size="xs">
                      {doc.daysUntilExpiry}d left
                    </Badge>
                  ) : doc.expiryDate ? (
                    <span className="text-xs text-slate-400 font-mono">{doc.expiryDate}</span>
                  ) : (
                    <Badge variant="emerald" size="xs">
                      <ShieldCheck className="w-3 h-3" /> Encrypted
                    </Badge>
                  )}
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {!isTrash ? (
                      <>
                        <button
                          onClick={() => onPreview(doc)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800/80 transition-colors"
                          title="Safe Decrypted Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDownload(doc)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 transition-colors"
                          title="Decrypt & Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onViewDetails(doc)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800/80 transition-colors"
                          title="Metadata & Security Details"
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
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => onRestore(doc.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                          title="Restore Document"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onPermanentDelete(doc.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Purge Permanently"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
