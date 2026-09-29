import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AlertItemCard } from '../components/alerts/AlertItemCard';
import { AlertTriangle, AlertCircle, CheckCircle2, Filter, ShieldAlert } from 'lucide-react';
import { AlertSeverity, AlertStatus } from '../types';

export const Alerts: React.FC = () => {
  const { alerts, currentUser } = useApp();
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const filteredAlerts = alerts.filter((a) => {
    if (selectedSeverity !== 'ALL' && a.severity !== selectedSeverity) return false;
    if (selectedStatus !== 'ALL' && a.status !== selectedStatus) return false;
    return true;
  });

  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL' && a.status !== 'RESOLVED').length;
  const highCount = alerts.filter((a) => a.severity === 'HIGH' && a.status !== 'RESOLVED').length;
  const openCount = alerts.filter((a) => a.status === 'OPEN').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>AI Clinical Decision Support & Escalation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Health Triage & Critical Alerts
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            High-risk maternal, pediatric SAM, and acute syndromic symptoms flagged for medical officer intervention.
          </p>
        </div>
      </div>

      {/* Safety Notice Banner */}
      <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200/90 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block text-amber-400">Medical Assistance & Triage Disclaimer</span>
          <span>
            Vaani's AI Alert Agent acts solely as a prioritization and decision-support aid. All clinical diagnostic decisions, prescriptions, and referral emergency actions require human Medical Officer verification.
          </span>
        </div>
      </div>

      {/* Triage Summary Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-4">
          <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block">Critical Unresolved</span>
          <span className="text-2xl sm:text-3xl font-black text-rose-300">{criticalCount}</span>
        </div>

        <div className="bg-orange-950/20 border border-orange-500/30 rounded-2xl p-4">
          <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider block">High Priority</span>
          <span className="text-2xl sm:text-3xl font-black text-orange-300">{highCount}</span>
        </div>

        <div className="bg-sky-950/20 border border-sky-500/30 rounded-2xl p-4">
          <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider block">Open Action Items</span>
          <span className="text-2xl sm:text-3xl font-black text-sky-300">{openCount}</span>
        </div>

        <div className="bg-teal-950/20 border border-teal-500/30 rounded-2xl p-4">
          <span className="text-[11px] font-bold text-[#00D6C7] uppercase tracking-wider block">Total Alerts</span>
          <span className="text-2xl sm:text-3xl font-black text-[#43E0B0]">{alerts.length}</span>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-[#08131B]/90 backdrop-blur-md p-4 rounded-2xl border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-400">Severity:</span>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="p-1.5 bg-[#050B10] border border-white/10 rounded-lg font-semibold text-slate-200 outline-none focus:border-teal-500"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-400">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="p-1.5 bg-[#050B10] border border-white/10 rounded-lg font-semibold text-slate-200 outline-none focus:border-teal-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open (Pending Review)</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>

        <span className="text-slate-400 font-medium">
          Showing {filteredAlerts.length} triage records
        </span>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="bg-[#08131B]/90 rounded-2xl p-12 text-center border border-white/5">
            <CheckCircle2 className="w-8 h-8 text-[#43E0B0] mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-300">No active alerts match filters</h3>
            <p className="text-xs text-slate-500 mt-1">All critical symptoms in this view have been resolved or filtered out.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <AlertItemCard 
              key={alert.id} 
              alert={alert} 
              isSupervisor={currentUser.role === 'supervisor' || currentUser.role === 'admin'} 
            />
          ))
        )}
      </div>

    </div>
  );
};
