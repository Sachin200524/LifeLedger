import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Shield,
  FolderLock,
  FolderTree,
  Users,
  FileCheck,
  AlertCircle,
  Activity,
  ShieldAlert,
  History,
  BarChart3,
  UserCheck,
  AlertTriangle,
  FileText,
  Lock,
  ChevronRight
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, isUser, isNominee, isAdmin } = useAuth();

  const userNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Document Vault', path: '/vault', icon: FolderLock },
    { name: 'Folders', path: '/folders', icon: FolderTree },
    { name: 'Trusted Nominees', path: '/nominees', icon: Users },
    { name: 'Policy Engine', path: '/policies', icon: FileCheck },
    { name: 'Emergency Access', path: '/emergency-requests', icon: AlertCircle },
    { name: 'Digital Readiness', path: '/readiness', icon: Activity },
    { name: 'Risk Assessment', path: '/risk', icon: ShieldAlert },
    { name: 'Activity Audit Logs', path: '/activity-logs', icon: History },
    { name: 'Reports & Export', path: '/reports', icon: BarChart3 },
  ];

  const nomineeNavItems = [
    { name: 'Nominee Dashboard', path: '/nominee/dashboard', icon: LayoutDashboard },
    { name: 'Assigned Documents', path: '/nominee/documents', icon: FolderLock },
    { name: 'Request Emergency Access', path: '/nominee/submit', icon: AlertTriangle },
    { name: 'Access History', path: '/nominee/history', icon: History },
  ];

  const adminNavItems = [
    { name: 'Admin Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Emergency Requests', path: '/admin/emergency', icon: AlertCircle },
    { name: 'Global Audit Logs', path: '/admin/logs', icon: FileText },
  ];

  let currentNav = userNavItems;
  if (isAdmin) currentNav = adminNavItems;
  else if (isNominee) currentNav = nomineeNavItems;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 glass-panel border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800/80">
          <div className="w-8 h-8 rounded-lg emerald-gradient flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Shield className="w-4 h-4 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-base font-bold text-white tracking-tight">
              LIFELEDGER<span className="text-emerald-400">+</span>
            </span>
            <span className="block text-[10px] uppercase font-semibold tracking-wider text-slate-400">
              AES-256 Vault
            </span>
          </div>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Navigation Menu
          </div>

          {currentNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-40" />
              </NavLink>
            );
          })}
        </div>

        {/* Security badge at bottom */}
        <div className="p-4 border-t border-slate-800/80">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-emerald-500/20 flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">AES-256-GCM Active</p>
              <p className="text-[10px] text-slate-400 truncate">Zero-Knowledge Storage</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
