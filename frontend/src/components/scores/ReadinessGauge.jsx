import React from 'react';
import { Activity, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '../common/Badge';

export const ReadinessGauge = ({ score = 0, level = 'POOR', breakdown = [] }) => {
  const getLevelConfig = () => {
    if (score >= 80) return { color: 'emerald', label: 'Excellent', text: 'text-emerald-400', stroke: '#10B981' };
    if (score >= 60) return { color: 'blue', label: 'Good', text: 'text-blue-400', stroke: '#3B82F6' };
    if (score >= 40) return { color: 'amber', label: 'Needs Improvement', text: 'text-amber-400', stroke: '#F59E0B' };
    return { color: 'rose', label: 'Poor', text: 'text-rose-400', stroke: '#EF4444' };
  };

  const config = getLevelConfig();
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col items-center">
      <div className="w-full flex items-center justify-between mb-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" /> Digital Readiness Score
        </h4>
        <Badge variant={config.color} size="sm">
          {config.label}
        </Badge>
      </div>

      {/* Circular Meter */}
      <div className="relative my-2 flex items-center justify-center">
        <svg className="w-40 h-40 transform -rotate-90">
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="currentColor"
            strokeWidth="10"
            className="text-slate-800"
            fill="transparent"
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={config.stroke}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute text-center">
          <span className="text-4xl font-extrabold text-white tracking-tight">{score}</span>
          <span className="text-xs text-slate-400 block font-semibold">/ 100</span>
        </div>
      </div>

      {/* Breakdown Progress Bars */}
      {breakdown.length > 0 && (
        <div className="w-full mt-6 space-y-3 pt-4 border-t border-slate-800/80">
          {breakdown.map((item) => {
            const pct = Math.round((item.currentScore / item.maxScore) * 100);
            return (
              <div key={item.category} className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-300">{item.category}</span>
                  <span className="font-mono text-slate-400 font-medium">
                    {item.currentScore} / {item.maxScore} pts
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full emerald-gradient transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500">{item.description}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
