import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Mic, 
  IndianRupee, 
  AlertCircle, 
  Calendar, 
  CheckCircle2, 
  Users, 
  ArrowRight, 
  Clock, 
  TrendingUp, 
  MapPin, 
  ShieldCheck, 
  Activity,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { VisitCard } from '../components/visits/VisitCard';

export const WorkerDashboard: React.FC = () => {
  const { currentUser, visits, alerts, earnings, households } = useApp();
  const navigate = useNavigate();

  // Filter for this worker's data
  const workerVisits = visits.filter((v) => v.workerId === currentUser.uid);
  const workerAlerts = alerts.filter((a) => a.workerId === currentUser.uid && a.status !== 'RESOLVED');
  const workerEarnings = earnings.filter((e) => e.workerId === currentUser.uid);

  // Calculate statistics
  const todayStr = new Date().toISOString().split('T')[0];
  const todayVisits = workerVisits.filter((v) => v.timestamp.startsWith(todayStr));
  const pendingFollowups = workerVisits.filter((v) => v.followUpRequired && v.followUpStatus === 'pending');

  const monthlyTotal = workerEarnings.reduce((acc, curr) => acc + curr.amount + curr.bonus, 0);

  const villageHouseholds = households.filter((h) => h.village.toLowerCase() === currentUser.village.toLowerCase());
  const coveredCount = new Set(workerVisits.map((v) => v.householdId)).size;
  const coveragePercent = villageHouseholds.length > 0 
    ? Math.min(100, Math.round((coveredCount / villageHouseholds.length) * 100))
    : 78;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 sm:pb-12">
      
      {/* Top Welcome Header */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-700/15 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-emerald-100 border border-white/20">
                ASHA Health Activist
              </span>
              <span className="text-xs text-emerald-100 flex items-center gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5" />
                Village {currentUser.village}, {currentUser.district}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Namaste, {currentUser.name}
            </h1>
            <p className="text-sm text-emerald-50 max-w-xl">
              Ready to record field visits. Voice recordings are automatically structured, GPS-verified, and triaged in real time.
            </p>
          </div>

          {/* Big Voice Log CTA Button */}
          <Link
            to="/log-visit"
            className="group shrink-0 inline-flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-white text-emerald-800 font-extrabold text-base shadow-lg shadow-black/10 hover:bg-emerald-50 hover:scale-105 active:scale-95 transition-all"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center group-hover:rotate-12 transition-transform">
              <Mic className="w-5 h-5" />
            </div>
            <span>Log New Visit (Voice)</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Today's Visits */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Today's Visits</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {todayVisits.length}
          </div>
          <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{workerVisits.length} Total Field Visits</span>
          </div>
        </div>

        {/* Pending Follow-ups */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Follow-ups</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {pendingFollowups.length}
          </div>
          <div className="text-xs text-amber-700 font-semibold mt-1">
            <span>High-risk cases to revisit</span>
          </div>
        </div>

        {/* Monthly Earnings */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Incentive Total</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            ₹{monthlyTotal.toLocaleString('en-IN')}
          </div>
          <div className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{workerEarnings.length} Verified Claims</span>
          </div>
        </div>

        {/* Village Coverage */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-sky-300 transition-all">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Village Coverage</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            {coveragePercent}%
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
            <div
              className="bg-sky-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${coveragePercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Urgent Clinical Alerts Banner (if any) */}
      {workerAlerts.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 animate-pulse" />
              <span>{workerAlerts.length} Active High-Risk Alert{workerAlerts.length > 1 ? 's' : ''} in {currentUser.village}</span>
            </div>
            <Link
              to="/alerts"
              className="text-xs font-bold text-rose-700 hover:text-rose-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {workerAlerts.slice(0, 2).map((alert) => (
              <div key={alert.id} className="bg-white p-3 rounded-xl border border-rose-200 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900">{alert.householdName}</span>
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
                    {alert.severity}
                  </span>
                </div>
                <p className="text-slate-600 line-clamp-2">{alert.title}</p>
                <div className="text-[11px] text-amber-800 font-medium mt-1">
                  Action: {alert.recommendedAction}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link
          to="/log-visit"
          className="flex flex-col items-center justify-center p-4 rounded-2xl bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 transition-all text-center group"
        >
          <Mic className="w-6 h-6 mb-1.5 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold">Log New Visit</span>
          <span className="text-[10px] text-emerald-100">Voice to Structured Data</span>
        </Link>

        <Link
          to="/visits"
          className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-slate-200 text-slate-800 shadow-xs hover:border-slate-300 hover:bg-slate-50 transition-all text-center group"
        >
          <Calendar className="w-6 h-6 mb-1.5 text-slate-600 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold">My Field Visits</span>
          <span className="text-[10px] text-slate-500">History & GPS Records</span>
        </Link>

        <Link
          to="/earnings"
          className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-slate-200 text-slate-800 shadow-xs hover:border-slate-300 hover:bg-slate-50 transition-all text-center group"
        >
          <IndianRupee className="w-6 h-6 mb-1.5 text-teal-600 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold">My Earnings</span>
          <span className="text-[10px] text-slate-500">Incentives & Claims</span>
        </Link>

        <Link
          to="/alerts"
          className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-slate-200 text-slate-800 shadow-xs hover:border-slate-300 hover:bg-slate-50 transition-all text-center group"
        >
          <AlertCircle className="w-6 h-6 mb-1.5 text-amber-600 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold">Health Alerts</span>
          <span className="text-[10px] text-slate-500">Follow-up Triage</span>
        </Link>
      </div>

      {/* Recent Visits Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Household Visits</h2>
            <p className="text-xs text-slate-500">Field logs automatically verified with GPS & AI clinical extraction</p>
          </div>
          <Link
            to="/visits"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>View All ({workerVisits.length})</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {workerVisits.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No Visits Logged Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Tap the microphone to speak your first household visit. Our AI will automatically categorize symptoms, vitals, and incentives.
            </p>
            <Link
              to="/log-visit"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-emerald-700"
            >
              <Mic className="w-4 h-4" />
              <span>Start Voice Log</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {workerVisits.slice(0, 4).map((visit) => (
              <VisitCard key={visit.id} visit={visit} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
