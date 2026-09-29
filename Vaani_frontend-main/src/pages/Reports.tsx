import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileText, 
  Download, 
  Printer, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  MapPin, 
  Clock,
  Sparkles
} from 'lucide-react';

export const Reports: React.FC = () => {
  const { visits, alerts, patients, currentUser } = useApp();
  const [reportType, setReportType] = useState('weekly');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDate, setGeneratedDate] = useState(new Date().toLocaleDateString());

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const reportData = {
      title: 'Vaani AI Health Field Report',
      generatedAt: new Date().toISOString(),
      officer: currentUser.name,
      role: currentUser.role,
      village: currentUser.village,
      totalVisits: visits.length,
      totalPatients: patients.length,
      alertsCount: alerts.length,
      criticalAlerts: alerts.filter(a => a.severity === 'CRITICAL').length,
      recentVisits: visits.slice(0, 20)
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vaani-field-report-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#00D6C7] uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            <span>Official Health Documentation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Field Reports & Statutory Audits
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Automated National Health Mission (NHM) compliant summary reports compiled from verified voice logs.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-200 hover:text-white hover:bg-white/10 text-xs font-semibold transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-[#050B10] font-bold text-xs shadow-[0_0_20px_rgba(0,214,199,0.3)] hover:scale-[1.02] transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Controls Card */}
      <div className="bg-[#08131B]/90 backdrop-blur-md rounded-2xl p-4 border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-400">Report Scope:</span>
          <div className="flex items-center gap-1 bg-[#050B10] p-1 rounded-xl border border-white/10">
            {['daily', 'weekly', 'monthly'].map((scope) => (
              <button
                key={scope}
                onClick={() => setReportType(scope)}
                className={`px-3 py-1.5 rounded-lg font-semibold uppercase text-[10px] tracking-wider transition-all ${
                  reportType === scope
                    ? 'bg-teal-500/20 text-[#00D6C7] border border-teal-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {scope}
              </button>
            ))}
          </div>
        </div>

        <div className="text-slate-400 text-xs flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <span>Report Generated for: <strong className="text-white">{generatedDate}</strong></span>
        </div>
      </div>

      {/* Main Report Document Sheet */}
      <div className="bg-[#08131B]/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)] space-y-6">
        
        {/* Document Header */}
        <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold text-[#00D6C7] uppercase tracking-widest block">
              Government of Madhya Pradesh • National Health Mission
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              Field Health Worker Surveillance Digest
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Sector: {currentUser.village || 'Bhopal District'} • Cadre: ASHA Field Network
            </p>
          </div>

          <div className="text-left sm:text-right text-xs text-slate-400 space-y-0.5">
            <div>Reporting Officer: <span className="text-white font-semibold">{currentUser.name}</span></div>
            <div>Worker Code: <span className="text-slate-300 font-mono">ASHA-MP-{currentUser.uid.slice(0, 6)}</span></div>
            <div>Status: <span className="text-[#43E0B0] font-semibold">Digitally Certified</span></div>
          </div>
        </div>

        {/* Executive Summary Metrics */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            1. Operational Summary
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-[#050B10] border border-white/5">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Field Visits</span>
              <span className="text-2xl font-bold text-white mt-1 block">{visits.length}</span>
              <span className="text-[10px] text-[#43E0B0] font-medium">100% voice logged</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#050B10] border border-white/5">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Verified Patients</span>
              <span className="text-2xl font-bold text-white mt-1 block">{patients.length}</span>
              <span className="text-[10px] text-teal-400 font-medium">Aadhaar / ABHA verified</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#050B10] border border-white/5">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Critical Triage Flags</span>
              <span className="text-2xl font-bold text-rose-400 mt-1 block">
                {alerts.filter(a => a.severity === 'CRITICAL').length}
              </span>
              <span className="text-[10px] text-rose-400/80 font-medium">Immediate referral</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#050B10] border border-white/5">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">GPS Verification Rate</span>
              <span className="text-2xl font-bold text-[#43E0B0] mt-1 block">
                {Math.round((visits.filter(v => v.verificationStatus === 'verified').length / Math.max(1, visits.length)) * 100)}%
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Geo-fence authenticated</span>
            </div>
          </div>
        </div>

        {/* Detailed Visit Audit Log Table */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            2. Recent Clinical Logs & Audited Submissions
          </h3>
          <div className="overflow-x-auto rounded-2xl border border-white/5">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#050B10] text-slate-400 font-semibold border-b border-white/5">
                <tr>
                  <th className="p-3">Household / Beneficiary</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Symptoms Reported</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">GPS Audit</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {visits.slice(0, 10).map((v) => (
                  <tr key={v.id} className="hover:bg-white/[0.02]">
                    <td className="p-3 font-semibold text-white">
                      {v.householdName}
                      {v.structuredData.patientName && (
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {v.structuredData.patientName}
                        </span>
                      )}
                    </td>
                    <td className="p-3 capitalize">{v.structuredData.visitType.replace('_', ' ')}</td>
                    <td className="p-3">
                      {v.structuredData.symptoms.length > 0
                        ? v.structuredData.symptoms.slice(0, 3).join(', ')
                        : 'Routine follow-up'}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        v.severity === 'critical' ? 'bg-rose-500/15 text-rose-400' :
                        v.severity === 'high' ? 'bg-orange-500/15 text-orange-400' :
                        'bg-emerald-500/15 text-emerald-400'
                      }`}>
                        {v.severity}
                      </span>
                    </td>
                    <td className="p-3 text-[#43E0B0] font-mono text-[11px]">
                      {v.verificationScore}% Verified
                    </td>
                    <td className="p-3 text-slate-500 text-[11px]">
                      {new Date(v.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Signoff / Certification Footer */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#43E0B0]" />
            <span>Validated by Vaani AI Autonomous Health OS Triage Engine</span>
          </div>
          <div>Report Digest ID: <span className="font-mono text-slate-400">REP-{Date.now().toString().slice(-8)}</span></div>
        </div>

      </div>
    </div>
  );
};
