import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { documentService } from '../../services/documentService';
import { scoreService } from '../../services/scoreService';
import { nomineeService } from '../../services/nomineeService';
import { policyService } from '../../services/policyService';
import { emergencyService } from '../../services/emergencyService';
import { StatCard } from '../../components/common/StatCard';
import { ReadinessGauge } from '../../components/scores/ReadinessGauge';
import { RiskRadar } from '../../components/scores/RiskRadar';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Badge } from '../../components/common/Badge';
import {
  FolderLock,
  HardDrive,
  Users,
  FileCheck,
  AlertCircle,
  Activity,
  ShieldAlert,
  ArrowRight,
  Plus,
  FileText,
  Clock,
  ShieldCheck,
  UploadCloud,
  ChevronRight
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { formatDateTime } from '../../utils/formatters';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [nominees, setNominees] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [emergencyRequests, setEmergencyRequests] = useState([]);
  const [readiness, setReadiness] = useState(null);
  const [risk, setRisk] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [docsRes, catsRes, nomsRes, polsRes, emergRes, readyRes, riskRes, logsRes] =
        await Promise.all([
          documentService.getDocuments(),
          documentService.getCategories(),
          nomineeService.getNominees(),
          policyService.getPolicies(),
          emergencyService.getRequestsForOwner(),
          scoreService.getReadinessScore(),
          scoreService.getRiskScore(),
          scoreService.getRecentLogs(),
        ]);

      if (docsRes.success) setDocuments(docsRes.data);
      if (catsRes.success) setCategories(catsRes.data);
      if (nomsRes.success) setNominees(nomsRes.data);
      if (polsRes.success) setPolicies(polsRes.data);
      if (emergRes.success) setEmergencyRequests(emergRes.data);
      if (readyRes.success) setReadiness(readyRes.data);
      if (riskRes.success) setRisk(riskRes.data);
      if (logsRes.success) setRecentLogs(logsRes.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Decrypting and aggregating vault intelligence..." />;
  }

  // Calculate storage consumed
  const totalStorageBytes = documents.reduce((acc, d) => acc + (d.fileSize || 0), 0);
  const formattedStorage = (totalStorageBytes / (1024 * 1024)).toFixed(2) + ' MB';

  // Category distribution for donut chart
  const COLORS = ['#10B981', '#06B6D4', '#6366F1', '#EC4899', '#F59E0B', '#8B5CF6', '#3B82F6', '#14B8A6'];
  const categoryChartData = categories
    .filter((c) => c.documentCount > 0)
    .map((c) => ({
      name: c.name,
      value: c.documentCount,
    }));

  const pendingRequests = emergencyRequests.filter((r) => r.status === 'PENDING');

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Welcome back, {user?.fullName || 'Vault Owner'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Personal digital estate is encrypted with <strong className="text-emerald-400">AES-256-GCM</strong>. Legacy policies are actively monitored.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/vault"
            className="px-4 py-2.5 text-xs font-semibold rounded-xl emerald-gradient text-slate-950 hover:opacity-95 transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
          >
            <UploadCloud className="w-4 h-4 stroke-[2.5]" /> Upload Document
          </Link>
          <Link
            to="/policies"
            className="px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-colors flex items-center gap-1.5"
          >
            <FileCheck className="w-4 h-4 text-cyan-400" /> New Policy
          </Link>
        </div>
      </div>

      {/* Emergency Request Alert Banner if any pending */}
      {pendingRequests.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300">
              <AlertCircle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="font-bold text-amber-200 text-sm">
                {pendingRequests.length} Pending Emergency Access Request(s)
              </h4>
              <p className="text-xs text-amber-300/80">
                A nominee has requested emergency document retrieval. Review circumstances before waiting period elapses.
              </p>
            </div>
          </div>

          <Link
            to="/emergency-requests"
            className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors shrink-0"
          >
            Review Now
          </Link>
        </div>
      )}

      {/* Core Metrics 4-Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Secured Documents"
          value={documents.length}
          subtitle="AES-256 Encrypted in Vault"
          icon={FolderLock}
          color="emerald"
        />

        <StatCard
          title="Encrypted Storage"
          value={formattedStorage}
          subtitle="50 MB Local Quota"
          icon={HardDrive}
          color="blue"
        />

        <StatCard
          title="Designated Nominees"
          value={nominees.length}
          subtitle={`${nominees.filter((n) => n.verificationStatus === 'VERIFIED').length} Verified Contacts`}
          icon={Users}
          color="purple"
        />

        <StatCard
          title="Active Policies"
          value={policies.filter((p) => p.active).length}
          subtitle={`${policies.length} Total Configured`}
          icon={FileCheck}
          color="amber"
        />
      </div>

      {/* Readiness Gauge & Risk Radar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {readiness && (
          <ReadinessGauge
            score={readiness.overallScore}
            level={readiness.level}
            breakdown={readiness.breakdown}
          />
        )}

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

      {/* Documents by Category & Recent Vault Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown Donut */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Documents by Category
              </h4>
              <Link to="/vault" className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold">
                View All
              </Link>
            </div>

            {categoryChartData.length > 0 ? (
              <div className="h-56 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        border: '1px solid #334155',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-12 text-xs text-slate-500">
                No categorized documents yet
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-4 border-t border-slate-800">
            {categories.slice(0, 4).map((c, i) => (
              <div key={c.id} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900/40">
                <span className="text-slate-300 truncate">{c.name}</span>
                <span className="font-bold text-emerald-400 font-mono">{c.documentCount}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Secured Documents */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Recently Encrypted Documents
              </h4>
              <Link to="/vault" className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1">
                <span>Vault</span> <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {documents.slice(0, 4).map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-emerald-400 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{doc.title}</p>
                      <p className="text-[11px] text-slate-500 truncate flex items-center gap-2">
                        <span>{doc.originalFilename}</span>
                        <span>•</span>
                        <span className="text-emerald-400/90 font-medium">{doc.categoryName}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right text-xs shrink-0">
                    <span className="font-mono text-slate-400 block">{doc.formattedFileSize}</span>
                    <span className="text-[10px] text-slate-500">{formatDateTime(doc.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <ShieldCheck className="w-4 h-4" /> Zero-knowledge storage active
            </span>
            <Link to="/reports" className="hover:text-white font-semibold">
              Generate PDF Audit &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
