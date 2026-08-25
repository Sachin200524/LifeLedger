import React, { useState, useEffect } from 'react';
import { scoreService } from '../../services/scoreService';
import { RiskRadar } from '../../components/scores/RiskRadar';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ShieldAlert, AlertTriangle, ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';

export const RiskPage = () => {
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRisk();
  }, []);

  const loadRisk = async () => {
    setLoading(true);
    try {
      const res = await scoreService.getRiskScore();
      if (res.success) setRisk(res.data);
    } catch (e) {
      console.error('Failed to load risk score:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Analyzing estate vulnerability factors..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="w-7 h-7 text-rose-400" /> Digital Vulnerability Radar
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Proactive risk detection scanning unverified nominees, unlinked policies, and expiring documentation.
          </p>
        </div>

        <button
          onClick={loadRisk}
          className="p-2.5 rounded-xl glass-panel hover:bg-slate-800 text-slate-300 transition-colors"
          title="Recalculate Risk Radar"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {risk && (
        <RiskRadar
          score={risk.overallScore}
          riskLevel={risk.riskLevel}
          factors={risk.factors}
          suggestions={risk.suggestions}
          disclaimer={risk.disclaimer}
        />
      )}
    </div>
  );
};
