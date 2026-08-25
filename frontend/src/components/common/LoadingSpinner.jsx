import React from 'react';
import { Shield } from 'lucide-react';

export const LoadingSpinner = ({ text = 'Loading vault...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-emerald-500/20 border-t-emerald-400 animate-spin" />
        <Shield className="w-5 h-5 text-emerald-400 absolute" />
      </div>
      {text && <p className="text-xs font-medium text-slate-400 tracking-wide">{text}</p>}
    </div>
  );
};
