import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Shield,
  Lock,
  KeyRound,
  FileCheck,
  AlertTriangle,
  Activity,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Users,
  Cpu,
  Database,
  Layers,
  FileText
} from 'lucide-react';

export const LandingPage = () => {
  const { isAuthenticated, isUser, isNominee, isAdmin } = useAuth();

  const getDashboardLink = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isNominee) return '/nominee/dashboard';
    return '/dashboard';
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl emerald-gradient flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Shield className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white">
            LIFELEDGER<span className="text-emerald-400">+</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              to={getDashboardLink()}
              className="px-5 py-2 text-sm font-semibold rounded-xl emerald-gradient text-slate-950 hover:opacity-95 transition-all shadow-md shadow-emerald-500/20 flex items-center gap-2"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-5 py-2 text-sm font-semibold rounded-xl emerald-gradient text-slate-950 hover:opacity-95 transition-all shadow-md shadow-emerald-500/20"
              >
                Create Vault
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-6 max-w-7xl mx-auto text-center overflow-hidden">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-8">
          <Lock className="w-3.5 h-3.5" /> Policy-Driven Digital Legacy &amp; Document Vault
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] max-w-5xl mx-auto">
          Secure Your Vital Documents. <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Automate Legacy Access in Emergencies.
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
          LifeLedger+ combines authenticated <strong>AES-256-GCM encryption</strong>, granular access policies, and a timed emergency approval workflow so your trusted nominees receive only the documents they need when it matters most.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to={isAuthenticated ? getDashboardLink() : '/register'}
            className="px-8 py-3.5 rounded-xl font-bold text-slate-950 emerald-gradient hover:opacity-95 transition-all shadow-xl shadow-emerald-500/25 flex items-center gap-2 text-base"
          >
            <span>{isAuthenticated ? 'Open My Vault' : 'Initialize Personal Vault'}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/login"
            className="px-8 py-3.5 rounded-xl font-semibold text-slate-200 glass-panel hover:bg-slate-800/80 transition-all border border-slate-700/80 text-base"
          >
            Try Demo Accounts
          </Link>
        </div>

        {/* Hero Feature Highlights */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto text-left">
          <div className="glass-panel p-4 rounded-2xl border border-slate-800">
            <span className="text-xs font-bold text-emerald-400 block mb-1">AES-256-GCM</span>
            <p className="text-xs text-slate-300">Authenticated zero-knowledge file encryption on local storage.</p>
          </div>
          <div className="glass-panel p-4 rounded-2xl border border-slate-800">
            <span className="text-xs font-bold text-cyan-400 block mb-1">Policy Engine</span>
            <p className="text-xs text-slate-300">Waiting periods, owner approval gates, and time limits.</p>
          </div>
          <div className="glass-panel p-4 rounded-2xl border border-slate-800">
            <span className="text-xs font-bold text-indigo-400 block mb-1">Readiness 0-100</span>
            <p className="text-xs text-slate-300">Rule-based digital estate completeness and risk scoring.</p>
          </div>
          <div className="glass-panel p-4 rounded-2xl border border-slate-800">
            <span className="text-xs font-bold text-purple-400 block mb-1">Immutable Audits</span>
            <p className="text-xs text-slate-300">Tamper-evident activity logs for all vault operations.</p>
          </div>
        </div>
      </section>

      {/* Emergency Access Workflow Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-2">
            The Core Innovation
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How Emergency Digital Legacy Access Works
          </h2>
          <p className="mt-3 text-slate-400 text-sm sm:text-base">
            Nominees do NOT get unconditional access. Everything is guarded by waiting periods, policies, and auto-expiring temporary keys.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center mb-4">
              1
            </div>
            <h3 className="font-bold text-white text-base mb-2">Designate &amp; Policy</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Designate trusted nominees and configure access policies selecting specific documents, waiting hours, and review rules.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 relative">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center mb-4">
              2
            </div>
            <h3 className="font-bold text-white text-base mb-2">Emergency Request</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Nominee submits an access claim with reason and encrypted evidence. System initiates the waiting period timer.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 relative">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center mb-4">
              3
            </div>
            <h3 className="font-bold text-white text-base mb-2">Owner / Admin Review</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Vault owner or administrator inspects proof documents and grants temporary access or rejects illegitimate claims.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 relative">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center mb-4">
              4
            </div>
            <h3 className="font-bold text-white text-base mb-2">Auto-Expiring Window</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Nominee decrypts authorized documents within the temporary window. Access automatically revokes upon expiration.
            </p>
          </div>
        </div>
      </section>

      {/* Demo Credentials Quick Switch Section */}
      <section className="py-16 px-6 max-w-7xl mx-auto border-t border-slate-900 bg-slate-950/40 rounded-3xl mb-16">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h3 className="text-2xl font-bold text-white">Pre-Loaded Demo Accounts</h3>
          <p className="text-xs text-slate-400 mt-1">
            Test the entire multi-role workflow instantly using the pre-seeded accounts:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto text-sm">
          {/* User Demo */}
          <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">Vault Owner</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">ROLE_USER</span>
            </div>
            <div className="text-xs font-mono bg-slate-900 p-2.5 rounded-lg text-slate-300 space-y-1">
              <div>Email: user@lifeledger.com</div>
              <div>Pass: User@123456</div>
            </div>
            <p className="text-[11px] text-slate-400">
              Uploads documents, manages nominees, defines policies, reviews emergency requests.
            </p>
          </div>

          {/* Nominee Demo */}
          <div className="glass-panel p-5 rounded-2xl border border-blue-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">Trusted Nominee</span>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">ROLE_NOMINEE</span>
            </div>
            <div className="text-xs font-mono bg-slate-900 p-2.5 rounded-lg text-slate-300 space-y-1">
              <div>Email: nominee@lifeledger.com</div>
              <div>Pass: Nominee@123456</div>
            </div>
            <p className="text-[11px] text-slate-400">
              Verifies invitations, requests emergency access with proof, views approved docs.
            </p>
          </div>

          {/* Admin Demo */}
          <div className="glass-panel p-5 rounded-2xl border border-purple-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">Administrator</span>
              <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">ROLE_ADMIN</span>
            </div>
            <div className="text-xs font-mono bg-slate-900 p-2.5 rounded-lg text-slate-300 space-y-1">
              <div>Email: admin@lifeledger.com</div>
              <div>Pass: Admin@123456</div>
            </div>
            <p className="text-[11px] text-slate-400">
              System health oversight, user account moderation, global audit logs &amp; emergency review.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
