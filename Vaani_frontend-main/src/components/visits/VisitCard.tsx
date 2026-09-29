import React, { useState } from 'react';
import { Visit } from '../../types';
import { 
  MapPin, 
  Calendar, 
  User, 
  ShieldCheck, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Activity, 
  Sparkles,
  Stethoscope
} from 'lucide-react';
import { StructuredDataPreview } from './StructuredDataPreview';

interface VisitCardProps {
  visit: Visit;
  onSelect?: (visit: Visit) => void;
}

export const VisitCard: React.FC<VisitCardProps> = ({ visit, onSelect }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-rose-100 text-rose-800 border-rose-200 font-bold';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200 font-bold';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-200 font-medium';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 font-medium';
    }
  };

  const getVerificationBadge = (status: string, score: number) => {
    if (status === 'suspicious') {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[11px] font-semibold border border-rose-200">
          <AlertTriangle className="w-3 h-3" />
          <span>Needs Review ({score}%)</span>
        </span>
      );
    }
    if (status === 'warning') {
      return (
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[11px] font-semibold border border-amber-200">
          <AlertTriangle className="w-3 h-3" />
          <span>GPS Warning ({score}%)</span>
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
        <ShieldCheck className="w-3 h-3 text-emerald-600" />
        <span>Verified ({score}%)</span>
      </span>
    );
  };

  return (
    <div className="bg-[#08131B]/90 rounded-2xl border border-white/5 hover:border-teal-500/30 shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all overflow-hidden">
      <div className="p-4 sm:p-5">
        {/* Top Meta Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs uppercase tracking-wider border ${
              visit.severity === 'critical' ? 'bg-rose-500/15 text-rose-400 border-rose-500/30 font-bold' :
              visit.severity === 'high' ? 'bg-orange-500/15 text-orange-400 border-orange-500/30 font-bold' :
              visit.severity === 'medium' ? 'bg-amber-500/15 text-amber-400 border-amber-500/30 font-medium' :
              'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-medium'
            }`}>
              {visit.severity}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10 text-xs font-semibold capitalize">
              {visit.structuredData.visitType.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {visit.verificationStatus === 'suspicious' ? (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 text-[11px] font-semibold border border-rose-500/20">
                <AlertTriangle className="w-3 h-3" />
                <span>Needs Review ({visit.verificationScore}%)</span>
              </span>
            ) : visit.verificationStatus === 'warning' ? (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 text-[11px] font-semibold border border-amber-500/20">
                <AlertTriangle className="w-3 h-3" />
                <span>GPS Warning ({visit.verificationScore}%)</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-500/10 text-[#00D6C7] text-[11px] font-semibold border border-teal-500/20">
                <ShieldCheck className="w-3 h-3 text-[#00D6C7]" />
                <span>Verified ({visit.verificationScore}%)</span>
              </span>
            )}
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {new Date(visit.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Title & Household */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>{visit.householdName}</span>
              {visit.structuredData.patientName && (
                <span className="text-xs font-medium text-[#43E0B0] bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                  Patient: {visit.structuredData.patientName}
                </span>
              )}
            </h3>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                {visit.village} (±{visit.locationAccuracy}m GPS)
              </span>
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-500" />
                ASHA {visit.workerName}
              </span>
            </div>
          </div>
        </div>

        {/* Spoken Transcript Summary */}
        <div className="mt-3 p-3 rounded-xl bg-[#050B10]/80 border border-white/5 text-xs text-slate-300 italic">
          "{visit.transcript}"
        </div>

        {/* Extracted Symptoms Tag Chips */}
        {visit.structuredData.symptoms.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Symptoms:
            </span>
            {visit.structuredData.symptoms.map((s, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 text-xs font-medium border border-rose-500/20"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Bottom Expand Toggle */}
        <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {visit.followUpRequired ? (
              <span className="font-semibold text-amber-400">
                Follow-up due: {visit.followUpDate || 'Pending'}
              </span>
            ) : (
              <span className="text-slate-500">No urgent follow-up</span>
            )}
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs font-semibold text-[#00D6C7] hover:text-[#43E0B0] transition-colors"
          >
            <span>{isExpanded ? 'Hide AI Details' : 'View AI Breakdown'}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Clinical Breakdown Panel */}
      {isExpanded && (
        <div className="p-4 bg-[#050B10] border-t border-white/10 animate-in fade-in duration-200">
          <StructuredDataPreview data={visit.structuredData} />
          {visit.verificationReasons.length > 0 && (
            <div className="mt-3 p-3 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-300">
              <span className="font-bold text-slate-200 block mb-1">GPS & Verification Audit:</span>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-400">
                {visit.verificationReasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
