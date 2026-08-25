import React, { useState, useEffect } from 'react';
import { scoreService } from '../../services/scoreService';
import { documentService } from '../../services/documentService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatCard } from '../../components/common/StatCard';
import { BarChart3, Download, FileText, CheckCircle2, ShieldCheck, PieChart as PieIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const ReportsPage = () => {
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    setLoading(true);
    try {
      const [statsRes, catsRes] = await Promise.all([
        scoreService.getReportStats(),
        documentService.getCategories(),
      ]);
      if (statsRes.success) setStats(statsRes.data);
      if (catsRes.success) setCategories(catsRes.data);
    } catch (e) {
      console.error('Failed to load report data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      await scoreService.downloadPdfReport();
    } catch (e) {
      console.error('Failed to download PDF report:', e);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Generating vault analytics and charts..." />;
  }

  const chartData = categories.map((c) => ({
    category: c.name,
    count: c.documentCount || 0,
  }));

  const COLORS = ['#10B981', '#06B6D4', '#6366F1', '#EC4899', '#F59E0B', '#8B5CF6', '#3B82F6', '#14B8A6'];

  return (
    <div className="space-y-6">
      {/* Header & PDF Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-emerald-400" /> Vault Intelligence &amp; Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Generate formal digital legacy documentation and export certified PDF audit certificates.
          </p>
        </div>

        <button
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl emerald-gradient text-slate-950 hover:opacity-95 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 shrink-0"
        >
          <Download className="w-4 h-4" />
          {downloading ? 'Generating PDF...' : 'Download Official PDF Report'}
        </button>
      </div>

      {/* Overview Stat Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Vault Documents"
            value={stats.totalDocuments}
            subtitle="Encrypted Records"
            color="emerald"
          />
          <StatCard
            title="Verified Nominees"
            value={stats.verifiedNominees}
            subtitle={`${stats.totalNominees} Total Designated`}
            color="blue"
          />
          <StatCard
            title="Active Legacy Policies"
            value={stats.activePolicies}
            subtitle={`${stats.totalPolicies} Total Configured`}
            color="purple"
          />
          <StatCard
            title="Readiness Rating"
            value={`${stats.readinessScore}/100`}
            subtitle={stats.readinessLevel}
            color="amber"
          />
        </div>
      )}

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document Categories Bar Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Document Distribution by Category
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="category" tick={{ fill: '#94A3B8', fontSize: 10 }} interval={0} angle={-25} textAnchor="end" />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    border: '1px solid #334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Security & Audit Summary */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Official Estate Certificate Details
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Cryptographic Standard:</span>
                <span className="font-mono text-emerald-400 font-bold">AES-256-GCM (Zero-Knowledge)</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Document Integrity Engine:</span>
                <span className="font-mono text-cyan-400 font-bold">SHA-256 Checksums</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Metadata Extraction:</span>
                <span className="font-mono text-purple-400 font-bold">Apache Tika 2.x</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">PDF Generator:</span>
                <span className="font-mono text-slate-300">OpenPDF Embedded Engine</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Generated reports comply with digital asset succession guidelines.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
