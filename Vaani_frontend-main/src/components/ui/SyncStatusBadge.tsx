import React from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SyncStatusBadge: React.FC = () => {
  const { isOnline, pendingOfflineDrafts, syncState, triggerManualSync } = useApp();

  if (!isOnline) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700 shadow-sm animate-pulse">
        <WifiOff className="w-3.5 h-3.5 text-amber-400" />
        <span>Offline Mode</span>
        {pendingOfflineDrafts > 0 && (
          <span className="bg-amber-500/30 text-amber-300 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
            {pendingOfflineDrafts} Draft{pendingOfflineDrafts > 1 ? 's' : ''}
          </span>
        )}
      </div>
    );
  }

  if (syncState === 'syncing') {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-medium border border-teal-200">
        <RefreshCw className="w-3.5 h-3.5 text-teal-600 animate-spin" />
        <span>Syncing...</span>
      </div>
    );
  }

  if (pendingOfflineDrafts > 0) {
    return (
      <button
        onClick={triggerManualSync}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-medium border border-amber-300 hover:bg-amber-100 transition-colors shadow-sm"
      >
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
        <span>Sync {pendingOfflineDrafts} Saved</span>
      </button>
    );
  }

  return (
    <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
      <span>Cloud Synced</span>
    </div>
  );
};
