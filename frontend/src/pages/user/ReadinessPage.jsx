import React, { useState, useEffect } from 'react';
import { scoreService } from '../../services/scoreService';
import { ReadinessGauge } from '../../components/scores/ReadinessGauge';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Activity, ShieldCheck, CheckCircle2, ArrowRight, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ReadinessPage = () => {
  const [readiness, setReadiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReadiness();
  }, []);

  const loadReadiness = async () => {
    setLoading(true);
    try {
      const res = await scoreService.getReadinessScore();
      if (res.success) setReadiness(res.data);
    } catch (e) {
      console.error('Failed to load readiness:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Computing Digital Readiness index..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Activity className="w-7 h-7 text-emerald-400" /> Digital Readiness Intelligence
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Quantitative index (0–100) scoring your digital estate readiness across 5 structural dimensions.
        </p>
      </div>

      {readiness && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Gauge */}
          <div className="lg:col-span-1">
            <ReadinessGauge
              score={readiness.overallScore}
              level={readiness.level}
              breakdown={readiness.breakdown}
            />
          </div>

          {/* Detailed Dimension Insights & Recommendations */}
          <div className="lg:col-span-2 space-y-6">
            {/* Action Recommendations */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" /> Priority Estate Action Plan
              </h3>
              <div className="space-y-3">
                {readiness.recommendations?.map((rec, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3 text-xs"
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <p className="text-slate-300 leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Dimension Breakdown Deep Dive */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                Structural Dimension Scoring Matrix
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {readiness.breakdown?.map((b) => (
                  <div key={b.category} className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{b.category}</span>
                      <span className="font-mono text-emerald-400 font-bold">
                        {b.currentScore} / {b.maxScore} pts
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs">{b.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
