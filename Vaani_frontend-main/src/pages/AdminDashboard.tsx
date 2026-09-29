import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  Users, 
  IndianRupee, 
  Database, 
  RotateCcw, 
  Settings, 
  FileText, 
  CheckCircle2, 
  Plus, 
  Edit3, 
  Trash2, 
  Clock, 
  Sparkles,
  Building
} from 'lucide-react';
import { IncentiveRule } from '../types';

export const AdminDashboard: React.FC = () => {
  const { 
    users, 
    visits, 
    households, 
    alerts, 
    incentiveRules, 
    updateIncentiveRules, 
    auditLogs, 
    resetDatabase 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'rules' | 'users' | 'audit' | 'seeder'>('rules');
  const [editingRules, setEditingRules] = useState<IncentiveRule[]>([...incentiveRules]);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleRuleChange = (index: number, field: keyof IncentiveRule, value: any) => {
    const updated = [...editingRules];
    updated[index] = { ...updated[index], [field]: value };
    setEditingRules(updated);
  };

  const handleSaveRules = () => {
    updateIncentiveRules(editingRules);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetData = () => {
    if (window.confirm('Reset database to realistic rural India demo dataset (10 Workers, 5 Villages, 30 Households, 100+ Visits)?')) {
      resetDatabase();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
                National Health Mission (NHM) Admin
              </span>
              <span className="text-xs text-purple-200">System Control Center</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Vaani Governance & Configuration Hub
            </h1>
            <p className="text-xs sm:text-sm text-purple-200 max-w-2xl">
              Configure incentive disbursement rules, monitor role-based access, inspect AI audit trails, and manage demo datasets.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleResetData}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Seed / Reset Demo Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Admin Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Users</span>
          <span className="text-2xl font-black text-slate-900">{users.length}</span>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">3 Defined Roles</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Visits</span>
          <span className="text-2xl font-black text-slate-900">{visits.length}</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Voice & GPS logged</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Households</span>
          <span className="text-2xl font-black text-slate-900">{households.length}</span>
          <span className="text-[10px] text-sky-600 font-semibold block mt-0.5">Across 5 Villages</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Alerts</span>
          <span className="text-2xl font-black text-slate-900">{alerts.length}</span>
          <span className="text-[10px] text-rose-600 font-semibold block mt-0.5">Clinical Triages</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Incentive Rules</span>
          <span className="text-2xl font-black text-slate-900">{incentiveRules.length}</span>
          <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">Configured Tasks</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Audit Logs</span>
          <span className="text-2xl font-black text-slate-900">{auditLogs.length}</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Security Trail</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-2">
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'rules'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <IndianRupee className="w-4 h-4" />
          <span>Incentive Engine Rules</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'users'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Directory ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'audit'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Audit Log Trail</span>
        </button>
      </div>

      {/* SUCCESS TOASTS */}
      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Incentive rules successfully updated in system!</span>
        </div>
      )}

      {resetSuccess && (
        <div className="p-3 bg-purple-50 border border-purple-300 rounded-xl text-purple-800 text-xs font-bold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>Database successfully reset and seeded with realistic rural India healthcare data!</span>
        </div>
      )}

      {/* TAB 1: INCENTIVE RULES ENGINE */}
      {activeTab === 'rules' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Configurable Incentive Rules Engine</h3>
              <p className="text-xs text-slate-500">
                Adjust base compensation and GPS verification bonus rates per completed healthcare activity.
              </p>
            </div>

            <button
              onClick={handleSaveRules}
              className="px-5 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 shadow-sm transition-all"
            >
              Save Rule Rates
            </button>
          </div>

          <div className="space-y-4">
            {editingRules.map((rule, idx) => (
              <div key={rule.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                <div className="md:col-span-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Task Title</span>
                  <input
                    type="text"
                    value={rule.title}
                    onChange={(e) => handleRuleChange(idx, 'title', e.target.value)}
                    className="w-full text-xs font-bold bg-white p-2 rounded-lg border border-slate-200 mt-1"
                  />
                </div>

                <div className="md:col-span-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Description / Scope</span>
                  <input
                    type="text"
                    value={rule.description}
                    onChange={(e) => handleRuleChange(idx, 'description', e.target.value)}
                    className="w-full text-xs text-slate-600 bg-white p-2 rounded-lg border border-slate-200 mt-1"
                  />
                </div>

                <div className="md:col-span-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Base Amount (₹)</span>
                  <input
                    type="number"
                    value={rule.baseAmount}
                    onChange={(e) => handleRuleChange(idx, 'baseAmount', parseInt(e.target.value, 10) || 0)}
                    className="w-full text-xs font-black text-slate-900 bg-white p-2 rounded-lg border border-slate-200 mt-1 font-mono"
                  />
                </div>

                <div className="md:col-span-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">GPS Bonus (₹)</span>
                  <input
                    type="number"
                    value={rule.bonusAmount}
                    onChange={(e) => handleRuleChange(idx, 'bonusAmount', parseInt(e.target.value, 10) || 0)}
                    className="w-full text-xs font-black text-emerald-600 bg-white p-2 rounded-lg border border-slate-200 mt-1 font-mono"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: USER DIRECTORY */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">User Directory & Role Permissions</h3>
            <p className="text-xs text-slate-500">ASHA workers, district supervisors, and administrators</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-[10px]">
                  <th className="p-4 font-bold">Name & Email</th>
                  <th className="p-4 font-bold">Role</th>
                  <th className="p-4 font-bold">Village / Region</th>
                  <th className="p-4 font-bold">District & State</th>
                  <th className="p-4 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.uid} className="hover:bg-slate-50/60">
                    <td className="p-4 font-bold text-slate-900">
                      <div>{u.name}</div>
                      <span className="text-[10px] text-slate-400 font-normal">{u.email}</span>
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        u.role === 'asha_worker' ? 'bg-emerald-100 text-emerald-800' :
                        u.role === 'supervisor' ? 'bg-sky-100 text-sky-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="p-4 text-slate-700">{u.village}</td>
                    <td className="p-4 text-slate-700">{u.district}, {u.state}</td>

                    <td className="p-4">
                      <span className="flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>Active</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Security & Clinical Audit Trail</h3>
            <p className="text-xs text-slate-500">Immutable log of AI clinical parsing, alert triages, and GPS validations</p>
          </div>

          <div className="divide-y divide-slate-100">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-50 text-xs flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                      {log.action}
                    </span>
                    <span className="font-bold text-slate-900">{log.userName}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Resource: <code className="font-mono text-slate-700">{log.resource}</code>
                    {log.details && (
                      <span className="ml-2 text-slate-400">
                        {JSON.stringify(log.details)}
                      </span>
                    )}
                  </div>
                </div>

                <span className="text-[10px] text-slate-400 shrink-0">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
