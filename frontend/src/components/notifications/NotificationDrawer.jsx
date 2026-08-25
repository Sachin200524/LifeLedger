import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import {
  Bell,
  X,
  Check,
  Trash2,
  Calendar,
  AlertTriangle,
  ShieldCheck,
  FileCheck,
  Info
} from 'lucide-react';
import { formatDateTime } from '../../utils/formatters';

export const NotificationDrawer = () => {
  const { notifications, isOpen, setIsOpen, markAsRead, markAllAsRead, clearAll } = useNotifications();

  if (!isOpen) return null;

  const getTypeIcon = (type) => {
    switch (type) {
      case 'EXPIRY':
        return <Calendar className="w-4 h-4 text-amber-400" />;
      case 'EMERGENCY':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case 'POLICY':
        return <FileCheck className="w-4 h-4 text-cyan-400" />;
      case 'SECURITY':
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      default:
        return <Info className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-sm sm:max-w-md glass-panel border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Notifications &amp; Alerts</h3>
                <span className="text-xs text-slate-400">{notifications.length} total events</span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Bar */}
          {notifications.length > 0 && (
            <div className="px-5 py-2.5 bg-slate-900/60 border-b border-slate-800/80 flex items-center justify-between text-xs">
              <button
                onClick={markAllAsRead}
                className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" /> Mark all read
              </button>
              <button
                onClick={clearAll}
                className="text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear all
              </button>
            </div>
          )}

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {notifications.length === 0 ? (
              <div className="text-center py-16 text-slate-500 space-y-2">
                <Bell className="w-8 h-8 mx-auto opacity-40" />
                <p className="text-sm">No new notifications</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => !notif.read && markAsRead(notif.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    notif.read
                      ? 'bg-slate-900/40 border-slate-800/60 opacity-75'
                      : 'bg-slate-900/90 border-slate-700/80 shadow-md ring-1 ring-emerald-500/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-800 shrink-0 mt-0.5">
                      {getTypeIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h5 className="font-bold text-xs text-white truncate">{notif.title}</h5>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{notif.message}</p>
                      <span className="text-[10px] text-slate-500 font-mono block mt-2">
                        {formatDateTime(notif.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
