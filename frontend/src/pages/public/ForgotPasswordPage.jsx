import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { Mail, KeyRound, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successToken, setSuccessToken] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authService.forgotPassword(email);
      if (res.success) {
        setSuccessToken(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate password recovery.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Recover Password</h2>
          <p className="text-xs text-slate-400">
            Enter your vault email to generate a secure reset token
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successToken ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Password Reset Token Generated</span>
              </div>
              <p className="text-slate-300">
                In local/standalone environment, your token is displayed below. Use it on the reset page:
              </p>
              <div className="p-2.5 rounded-lg bg-slate-950 text-emerald-300 font-mono break-all select-all">
                {successToken}
              </div>
            </div>

            <Link
              to={`/reset-password?token=${successToken}`}
              className="w-full py-3 rounded-xl font-bold text-slate-950 emerald-gradient hover:opacity-95 transition-all text-sm flex items-center justify-center gap-2"
            >
              <span>Proceed to Reset Password</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@lifeledger.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-slate-950 emerald-gradient hover:opacity-95 transition-all shadow-lg shadow-emerald-500/20 text-sm flex items-center justify-center gap-2"
            >
              {loading ? 'Generating Token...' : 'Send Reset Instructions'}
            </button>
          </form>
        )}

        <p className="text-center text-xs text-slate-400">
          Remember your password?{' '}
          <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
