import React from 'react';
import { ShieldAlert, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Badge } from '../common/Badge';

export const RiskRadar = ({ score = 0, riskLevel = 'LOW', factors = [], suggestions = [], disclaimer }) => {
  const getRiskConfig = () => {
    if (score <= 30) return { color: 'emerald', label: 'LOW RISK', text: 'text-emerald-400', stroke: '#10B981' };
    if (score <= 60) return { color: 'blue', label: 'MEDIUM RISK', text: 'text-blue-400', stroke: '#3B82F6' };
    if (score <= 80) return { color: 'amber', label: 'HIGH RISK', text: 'text-amber-400', stroke: '#F59E0B' };
    return { color: 'rose', label: 'CRITICAL RISK', text: 'text-rose-400', stroke: '#EF4444' };
  };

  const config = getRiskConfig();

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
      {/* Header with Risk Level */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-amber-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white tracking-tight">Digital Legacy Risk Assessment</h4>
            <p className="text-xs text-slate-400">Application-level vulnerability &amp; continuity evaluation</p>
          </div>
        </div>

        <Badge variant={config.color} size="md">
          {config.label} ({score}/100)
        </Badge>
      </div>

      {/* Risk Factors List */}
      <div>
        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Identified Risk Vectors ({factors.length})
        </h5>
        <div className="space-y-2">
          {factors.map((f, i) => {
            const isCrit = f.severity === 'CRITICAL';
            const isHigh = f.severity === 'HIGH';
            return (
              <div
                key={i}
                className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 text-xs ${
                  isCrit
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                    : isHigh
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300'
                }`}
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="font-bold flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{f.factor}</span>
                  </div>
                  <p className="text-[11px] text-slate-400">{f.description}</p>
                </div>
                <span className="font-mono font-bold shrink-0">+{f.impactScore} pts</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Actionable Suggestions */}
      {suggestions.length > 0 && (
        <div className="pt-3 border-t border-slate-800/80">
          <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Mitigation Checklist
          </h5>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {suggestions.map((s, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Disclaimer */}
      {disclaimer && (
        <div className="pt-2 border-t border-slate-800/60 text-[10px] text-slate-500 italic">
          {disclaimer}
        </div>
      )}
    </div>
  );
};
