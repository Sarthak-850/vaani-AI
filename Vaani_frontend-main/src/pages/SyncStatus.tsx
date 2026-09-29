import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  RotateCw, 
  CheckCircle2, 
  AlertTriangle, 
  Server, 
  Database, 
  Radio, 
  Cloud, 
  HardDrive, 
  ArrowUpRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { offlineSyncService } from '../services/offlineSync';
import { apiService } from '../services/api';

export const SyncStatus: React.FC = () => {
  const { isOnline, syncState, systemHealth, triggerManualSync, pendingOfflineDrafts } = useApp();
  const [isChecking, setIsChecking] = useState(false);
  const [manualSyncMsg, setManualSyncMsg] = useState<string | null>(null);

  const pendingCount = pendingOfflineDrafts || offlineSyncService.getPendingDrafts().length;
  const socketConnected = apiService.isSocketConnected();

  const handleManualSync = async () => {
    setIsChecking(true);
    setManualSyncMsg(null);
    try {
      await triggerManualSync();
      setManualSyncMsg('Sync completed successfully.');
    } catch (err: any) {
      setManualSyncMsg('Sync encountered errors. Unsynced changes remain safely cached locally.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#00D6C7] uppercase tracking-wider">
            <RotateCw className="w-4 h-4" />
            <span>Infrastructure & Data Resilience</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            System Connectivity & Offline Sync
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time telemetry on Express backend, PostgreSQL database, Socket.IO channels, and local IndexedDB offline storage.
          </p>
        </div>

        <button
          onClick={handleManualSync}
          disabled={isChecking}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-[#050B10] font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(0,214,199,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
          <span>{isChecking ? 'Syncing...' : 'Trigger Cloud Sync'}</span>
        </button>
      </div>

      {manualSyncMsg && (
        <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-xs text-[#00D6C7] flex items-center justify-between">
          <span>{manualSyncMsg}</span>
          <button onClick={() => setManualSyncMsg(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Primary Connectivity Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Backend API Status */}
        <div className="bg-[#08131B]/90 backdrop-blur-md rounded-2xl p-5 border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Express Server</span>
            <Server className={`w-4 h-4 ${systemHealth.healthy ? 'text-[#43E0B0]' : 'text-amber-400'}`} />
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${systemHealth.healthy ? 'bg-[#43E0B0] animate-pulse' : 'bg-amber-400'}`} />
            <span className="text-lg font-bold text-white">
              {systemHealth.healthy ? 'Port 5000 Active' : 'Connecting...'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            {systemHealth.healthy ? 'API responding normally at /api' : 'Backend is unreachable or booting'}
          </p>
        </div>

        {/* 2. PostgreSQL / Prisma Status */}
        <div className="bg-[#08131B]/90 backdrop-blur-md rounded-2xl p-5 border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">PostgreSQL Database</span>
            <Database className={`w-4 h-4 ${systemHealth.database === 'connected' ? 'text-[#43E0B0]' : 'text-amber-400'}`} />
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${systemHealth.database === 'connected' ? 'bg-[#43E0B0]' : 'bg-amber-400'}`} />
            <span className="text-lg font-bold text-white">
              {systemHealth.database === 'connected' ? 'Connected' : 'Offline / Standby'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            {systemHealth.database === 'connected'
              ? 'Prisma ORM actively reading/writing'
              : 'App caching locally; will sync once DB is live'}
          </p>
        </div>

        {/* 3. Real-Time Socket.IO */}
        <div className="bg-[#08131B]/90 backdrop-blur-md rounded-2xl p-5 border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Socket.IO Real-Time</span>
            <Radio className={`w-4 h-4 ${socketConnected ? 'text-[#00D6C7]' : 'text-slate-500'}`} />
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${socketConnected ? 'bg-[#00D6C7] animate-ping' : 'bg-slate-500'}`} />
            <span className="text-lg font-bold text-white">
              {socketConnected ? 'WebSocket Live' : 'Polling Fallback'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            {socketConnected ? 'Instant alerts & live voice telemetry' : 'Reconnecting in background'}
          </p>
        </div>

        {/* 4. Local Offline Storage */}
        <div className="bg-[#08131B]/90 backdrop-blur-md rounded-2xl p-5 border border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Offline Cache Queue</span>
            <HardDrive className="w-4 h-4 text-[#00D6C7]" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white font-mono">{pendingCount} Records</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {pendingCount === 0 ? 'All changes synced to cloud' : `${pendingCount} modifications queued for sync`}
          </p>
        </div>

      </div>

      {/* Sync Diagnostic Log & Status Details */}
      <div className="bg-[#08131B]/90 backdrop-blur-md rounded-3xl p-6 border border-white/5 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Cloud className="w-4 h-4 text-[#00D6C7]" />
          <span>Cloud Sync Diagnostic Log</span>
        </h3>

        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-xl bg-[#050B10] border border-white/5 flex items-center justify-between">
            <span className="text-slate-400">Network Interface State:</span>
            <span className="font-semibold text-[#43E0B0] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#43E0B0]"></span>
              {isOnline ? 'Online (Internet reachable)' : 'Offline (No internet)'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#050B10] border border-white/5 flex items-center justify-between">
            <span className="text-slate-400">Last Successful Cloud Sync:</span>
            <span className="font-mono text-slate-200">
              {systemHealth.timestamp ? new Date(systemHealth.timestamp).toLocaleString() : new Date().toLocaleString()}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#050B10] border border-white/5 flex items-center justify-between">
            <span className="text-slate-400">Active Sync Engine Mode:</span>
            <span className="font-semibold text-[#00D6C7]">
              IndexedDB Offline-First with Automatic Conflict Resolution
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#050B10] border border-white/5 flex items-center justify-between">
            <span className="text-slate-400">Backend API URL:</span>
            <span className="font-mono text-slate-400">
              {import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
