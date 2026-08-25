import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Shield, Lock, ShieldCheck, KeyRound } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background cyber grid accents */}
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.04] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Header */}
      <header className="p-6 flex items-center justify-between z-10">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl emerald-gradient flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Shield className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            LIFELEDGER<span className="text-emerald-400">+</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-full border border-slate-800">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>AES-256-GCM Military Grade Protocol</span>
        </div>
      </header>

      {/* Main Form Center */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10 my-4">
        <Outlet />
      </div>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-slate-500 z-10 border-t border-slate-900/60">
        <p>LifeLedger+ &copy; 2026 — Secure Digital Legacy &amp; Personal Document Management Platform.</p>
      </footer>
    </div>
  );
};
