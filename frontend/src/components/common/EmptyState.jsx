import React from 'react';
import { FolderOpen } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = FolderOpen,
  title = 'No items found',
  description = 'Get started by creating or adding your first item.',
  actionText,
  onAction,
}) => {
  return (
    <div className="glass-panel p-8 sm:p-12 rounded-2xl border border-slate-800 text-center flex flex-col items-center justify-center my-4">
      <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 mb-4 shadow-inner">
        <Icon className="w-7 h-7" />
      </div>
      <h4 className="text-base font-bold text-white tracking-tight">{title}</h4>
      <p className="mt-1 text-sm text-slate-400 max-w-sm">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-5 px-4 py-2 text-sm font-semibold rounded-xl emerald-gradient text-slate-950 hover:opacity-95 transition-all shadow-md shadow-emerald-500/10"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
