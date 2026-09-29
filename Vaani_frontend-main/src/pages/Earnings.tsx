import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  IndianRupee, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  ArrowUpRight 
} from 'lucide-react';

export const Earnings: React.FC = () => {
  const { earnings, incentiveRules, currentUser } = useApp();

  // Filter earnings for current worker
  const workerEarnings = currentUser.role === 'asha_worker'
    ? earnings.filter((e) => e.workerId === currentUser.uid)
    : earnings;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayEarnings = workerEarnings.filter((e) => e.date === todayStr);

  const todayTotal = todayEarnings.reduce((sum, e) => sum + e.amount + e.bonus, 0);
  const monthTotal = workerEarnings.reduce((sum, e) => sum + e.amount + e.bonus, 0);
  const disbursedTotal = workerEarnings.filter((e) => e.status === 'DISBURSED').reduce((sum, e) => sum + e.amount + e.bonus, 0);
  const pendingTotal = monthTotal - disbursedTotal;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wider">
            <IndianRupee className="w-4 h-4" />
            <span>National Health Mission (NHM) Incentives</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            My Earnings & Incentives
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time incentive calculations credited automatically upon AI clinical and GPS verification.
          </p>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-5 text-white shadow-lg shadow-emerald-700/15">
          <div className="text-xs text-emerald-100 font-bold uppercase tracking-wider mb-1">
            Today's Earned
          </div>
          <div className="text-2xl sm:text-3xl font-black">
            ₹{todayTotal.toLocaleString('en-IN')}.00
          </div>
          <div className="text-[11px] text-emerald-100 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{todayEarnings.length} Visits Logged Today</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
            This Month Total
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            ₹{monthTotal.toLocaleString('en-IN')}.00
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{workerEarnings.length} Verified Claims</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
            Disbursed to Bank
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">
            ₹{disbursedTotal.toLocaleString('en-IN')}.00
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            <span>Direct Benefit Transfer (DBT)</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
            Pending Disbursal
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600">
            ₹{pendingTotal.toLocaleString('en-IN')}.00
          </div>
          <div className="text-[11px] text-amber-700 font-semibold mt-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Scheduled end-of-month cycle</span>
          </div>
        </div>
      </div>

      {/* Active Incentive Rules Cards */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Configured Incentive Rate Card (NHM Scheme)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {incentiveRules.map((rule) => (
            <div key={rule.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-xs font-bold text-slate-900">{rule.title}</h4>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-extrabold text-xs">
                  ₹{rule.baseAmount} + ₹{rule.bonusAmount}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">{rule.description}</p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span>Task: {rule.taskType}</span>
                <span className="text-emerald-600">GPS Bonus Included</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Earnings Breakdown Table / Ledger */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Incentive Transaction History</h2>
            <p className="text-xs text-slate-500">Itemized ledger of verified field visits and bonuses</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px]">
                <th className="p-4 font-bold">Date & ID</th>
                <th className="p-4 font-bold">Description</th>
                <th className="p-4 font-bold">Task Category</th>
                <th className="p-4 font-bold">Base</th>
                <th className="p-4 font-bold">GPS Bonus</th>
                <th className="p-4 font-bold">Total</th>
                <th className="p-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {workerEarnings.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4 font-medium text-slate-900 whitespace-nowrap">
                    <div>{e.date}</div>
                    <span className="text-[10px] text-slate-400 font-mono">{e.id.slice(0, 12)}</span>
                  </td>

                  <td className="p-4 text-slate-700 max-w-xs">
                    <span className="font-medium">{e.description}</span>
                  </td>

                  <td className="p-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                      {e.taskType}
                    </span>
                  </td>

                  <td className="p-4 text-slate-700 font-mono">₹{e.amount}.00</td>

                  <td className="p-4 text-emerald-600 font-mono font-bold">
                    +₹{e.bonus}.00
                  </td>

                  <td className="p-4 font-black text-slate-900 font-mono">
                    ₹{e.amount + e.bonus}.00
                  </td>

                  <td className="p-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      e.status === 'DISBURSED' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {e.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
