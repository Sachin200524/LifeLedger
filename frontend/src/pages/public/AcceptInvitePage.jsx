import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { nomineeService } from '../../services/nomineeService';
import { useAuth } from '../../context/AuthContext';
import { UserCheck, ShieldCheck, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export const AcceptInvitePage = () => {
  const { token } = useParams();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [nomineeData, setNomineeData] = useState(null);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleAccept = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await nomineeService.acceptInvite(token);
      if (res.success) {
        setSuccess(true);
        setNomineeData(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept invitation. Token may be expired or invalid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-700/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-inner">
          <UserCheck className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Nominee Verification</h2>
          <p className="text-xs text-slate-400">
            You have been designated as a trusted contact in LifeLedger+
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5 text-left">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="font-bold text-white text-base">Verification Complete!</h4>
            <p className="text-xs text-slate-300">
              Your identity has been verified as a trusted nominee. You may now access designated emergency portals.
            </p>
            <div className="pt-2">
              <Link
                to="/nominee/dashboard"
                className="w-full py-2.5 rounded-xl font-bold text-slate-950 emerald-gradient hover:opacity-95 text-xs inline-flex items-center justify-center gap-2"
              >
                <span>Go to Nominee Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 text-left space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Verification Scope</span>
              </div>
              <p>
                By accepting this invitation, your email will be formally verified as an authorized contact for policy-governed emergency access workflows.
              </p>
            </div>

            <button
              onClick={handleAccept}
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-slate-950 emerald-gradient hover:opacity-95 transition-all shadow-lg shadow-emerald-500/20 text-sm flex items-center justify-center gap-2"
            >
              {loading ? 'Verifying Identity...' : 'Accept & Verify Nominee Role'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
