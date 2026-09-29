import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LiveMapView } from '../components/maps/LiveMapView';
import { AlertItemCard } from '../components/alerts/AlertItemCard';
import { VisitCard } from '../components/visits/VisitCard';
import { 
  Activity, 
  Users, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  TrendingUp, 
  Radio, 
  Filter, 
  Calendar, 
  ChevronRight, 
  AlertCircle,
  Building2
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DHODashboard: React.FC = () => {
  const { visits, alerts, households, users, outbreakClusters, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'map' | 'alerts' | 'feed' | 'workers'>('map');

  const ashaWorkers = users.filter((u) => u.role === 'asha_worker');
  const todayStr = new Date().toISOString().split('T')[0];
  const todayVisits = visits.filter((v) => v.timestamp.startsWith(todayStr));
  const openAlerts = alerts.filter((a) => a.status !== 'RESOLVED');
  const highRiskVisits = visits.filter((v) => v.severity === 'high' || v.severity === 'critical');
  const suspiciousVisits = visits.filter((v) => v.verificationStatus === 'suspicious' || v.verificationStatus === 'warning');

  // Compute coverage
  const uniqueHouseholdsCovered = new Set(visits.map((v) => v.householdId)).size;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold border border-sky-500/30">
                <Radio className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                <span>District Health Officer Command Center</span>
              </span>
              <span className="text-xs text-slate-400">Bhopal District HQ</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Supervisor Real-time Field Surveillance
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Live automated triage, GPS anomaly detection, and outbreak monitoring across {ashaWorkers.length} ASHA workers and 5 village sectors.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/analytics"
              className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/30 transition-all flex items-center gap-1.5"
            >
              <Activity className="w-4 h-4" />
              <span>Outbreak Analytics</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Workers</span>
          <span className="text-2xl font-black text-slate-900">{ashaWorkers.length}</span>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">Active in Field</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Today's Visits</span>
          <span className="text-2xl font-black text-slate-900">{todayVisits.length}</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">{visits.length} Total Field Logs</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Households</span>
          <span className="text-2xl font-black text-slate-900">{uniqueHouseholdsCovered}</span>
          <span className="text-[10px] text-sky-600 font-semibold block mt-0.5">Covered this month</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-rose-600 uppercase tracking-wider block">Pending Alerts</span>
          <span className="text-2xl font-black text-rose-600">{openAlerts.length}</span>
          <span className="text-[10px] text-rose-700 font-semibold block mt-0.5">Needs Doctor Review</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider block">High Risk Cases</span>
          <span className="text-2xl font-black text-orange-600">{highRiskVisits.length}</span>
          <span className="text-[10px] text-orange-700 font-semibold block mt-0.5">SAM & Pre-eclampsia</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">GPS Warnings</span>
          <span className="text-2xl font-black text-amber-600">{suspiciousVisits.length}</span>
          <span className="text-[10px] text-amber-700 font-semibold block mt-0.5">Verification Flags</span>
        </div>
      </div>

      {/* Outbreak / Epidemic Alert Banner (if any) */}
      {outbreakClusters.length > 0 && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-600 text-white rounded-xl shadow-md">
              <AlertCircle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-rose-900 uppercase tracking-wider">
                  Epidemiological Alert: Potential Cluster Detected
                </span>
                <span className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-bold rounded-full">
                  {outbreakClusters[0].riskLevel} RISK
                </span>
              </div>
              <p className="text-xs text-rose-800 font-medium mt-0.5">
                <strong>{outbreakClusters[0].village}</strong>: {outbreakClusters[0].symptomCategory} — {outbreakClusters[0].currentCases} cases reported (baseline {outbreakClusters[0].historicalBaseline}).
              </p>
              <p className="text-[11px] text-rose-700 mt-1">
                Action: {outbreakClusters[0].recommendedAction}
              </p>
            </div>
          </div>

          <Link
            to="/analytics"
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shrink-0 text-center transition-colors"
          >
            Investigate Cluster
          </Link>
        </div>
      )}

      {/* Interactive Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-2">
        <button
          onClick={() => setActiveTab('map')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'map'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Live Interactive Map</span>
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'alerts'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Health Triage Queue ({openAlerts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('feed')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'feed'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>Live Field Stream</span>
        </button>

        <button
          onClick={() => setActiveTab('workers')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'workers'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Worker Performance</span>
        </button>
      </div>

      {/* TAB 1: LIVE MAP */}
      {activeTab === 'map' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Geographic Distribution of Visits & High-Risk Cases</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                    Real-time GPS Pins
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  Click any pin to inspect household symptoms, severity, and verification audit score.
                </p>
              </div>
            </div>

            <LiveMapView 
              visits={visits} 
              outbreakClusters={outbreakClusters} 
              height="480px" 
            />
          </div>
        </div>
      )}

      {/* TAB 2: HEALTH TRIAGE QUEUE */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Active Clinical Triage & Referrals ({openAlerts.length})
            </h3>
            <Link to="/alerts" className="text-xs font-bold text-sky-600 hover:underline">
              Full Triage Center &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {openAlerts.map((alert) => (
              <AlertItemCard key={alert.id} alert={alert} isSupervisor={true} />
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: LIVE FIELD STREAM */}
      {activeTab === 'feed' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-time Field Visits Ingestion Stream</span>
            </h3>
          </div>

          <div className="space-y-3">
            {visits.slice(0, 8).map((visit) => (
              <VisitCard key={visit.id} visit={visit} />
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: WORKER PERFORMANCE & VERIFICATION */}
      {activeTab === 'workers' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">ASHA Worker Performance & Verification Audit</h3>
            <p className="text-xs text-slate-500">Monthly visit velocity, GPS compliance, and incentive totals</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px]">
                  <th className="p-4 font-bold">ASHA Worker</th>
                  <th className="p-4 font-bold">Assigned Village</th>
                  <th className="p-4 font-bold">Visits Logged</th>
                  <th className="p-4 font-bold">High Risk Cases</th>
                  <th className="p-4 font-bold">GPS Accuracy Compliance</th>
                  <th className="p-4 font-bold">Verification Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ashaWorkers.map((w) => {
                  const wVisits = visits.filter((v) => v.workerId === w.uid);
                  const wHighRisk = wVisits.filter((v) => v.severity === 'high' || v.severity === 'critical').length;
                  const avgScore = wVisits.length > 0 
                    ? Math.round(wVisits.reduce((acc, curr) => acc + curr.verificationScore, 0) / wVisits.length) 
                    : 95;

                  return (
                    <tr key={w.uid} className="hover:bg-slate-50/60">
                      <td className="p-4 font-bold text-slate-900 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-extrabold">
                          {w.name[0]}
                        </div>
                        <div>
                          <div>{w.name}</div>
                          <span className="text-[10px] text-slate-400 font-normal">{w.phone}</span>
                        </div>
                      </td>

                      <td className="p-4 text-slate-700">{w.village}</td>

                      <td className="p-4 font-bold text-slate-900">{wVisits.length} visits</td>

                      <td className="p-4 text-rose-600 font-bold">{wHighRisk} escalated</td>

                      <td className="p-4 text-slate-700">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-emerald-700">96.4%</span>
                          <span className="text-[10px] text-slate-400">within 15m radius</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
                          {avgScore}% Score
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
