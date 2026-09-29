import React from 'react';
import { Stethoscope, AlertTriangle, ShieldCheck, HeartPulse, TrendingUp } from 'lucide-react';

interface SystemOverviewCardProps {
  totalVisits: number;
  highPriorityCount: number;
  verifiedPatientsCount: number;
  aiAccuracyPercent: number;
  onViewAnalytics?: () => void;
}

export const SystemOverviewCard: React.FC<SystemOverviewCardProps> = ({
  totalVisits,
  highPriorityCount,
  verifiedPatientsCount,
  aiAccuracyPercent,
  onViewAnalytics
}) => {
  return (
    <div className="vaani-glass rounded-2xl p-4 sm:p-5 border border-white/10 shadow-xl backdrop-blur-xl space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white tracking-wide">
          System Overview
        </h3>
        <button
          onClick={onViewAnalytics}
          className="text-xs font-semibold text-[#00D6C7] hover:text-[#16D8D0] transition-colors"
        >
          View Analytics
        </button>
      </div>

      {/* 2x2 Metric Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        
        {/* Metric 1: Total Visits */}
        <div className="p-3 rounded-xl bg-[#08131B]/80 border border-white/5 space-y-1.5 hover:border-teal-500/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Total Visits</span>
            <div className="w-6 h-6 rounded-full bg-teal-500/10 text-[#00D6C7] flex items-center justify-center">
              <Stethoscope className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            {totalVisits}
          </div>
          <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
            <span>↑ 18% from last week</span>
          </div>
        </div>

        {/* Metric 2: High Priority */}
        <div className="p-3 rounded-xl bg-[#08131B]/80 border border-white/5 space-y-1.5 hover:border-amber-500/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">High Priority</span>
            <div className="w-6 h-6 rounded-full bg-amber-500/10 text-[#F59E0B] flex items-center justify-center">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#F59E0B]">
            {highPriorityCount}
          </div>
          <div className="text-[10px] text-amber-400/90 font-semibold flex items-center gap-0.5">
            <span>↑ 12% from last week</span>
          </div>
        </div>

        {/* Metric 3: Verified Patients */}
        <div className="p-3 rounded-xl bg-[#08131B]/80 border border-white/5 space-y-1.5 hover:border-teal-500/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">Verified Patients</span>
            <div className="w-6 h-6 rounded-full bg-teal-500/10 text-[#00D6C7] flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            {verifiedPatientsCount.toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
            <span>↑ 22% from last week</span>
          </div>
        </div>

        {/* Metric 4: AI Accuracy */}
        <div className="p-3 rounded-xl bg-[#08131B]/80 border border-white/5 space-y-1.5 hover:border-teal-500/20 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-medium">AI Accuracy</span>
            <div className="w-6 h-6 rounded-full bg-teal-500/10 text-[#00D6C7] flex items-center justify-center">
              <HeartPulse className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            {aiAccuracyPercent}%
          </div>
          <div className="text-[10px] text-emerald-400 font-semibold flex items-center gap-0.5">
            <span>↑ 2.3% from last week</span>
          </div>
        </div>

      </div>
    </div>
  );
};
