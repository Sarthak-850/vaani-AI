import React from 'react';
import { StructuredClinicalData } from '../../types';
import { 
  Heart, 
  Activity, 
  AlertTriangle, 
  User, 
  Calendar, 
  Pill, 
  CheckCircle2, 
  ShieldAlert, 
  Stethoscope, 
  Sparkles 
} from 'lucide-react';

interface StructuredDataPreviewProps {
  data: StructuredClinicalData;
  onEditField?: (field: keyof StructuredClinicalData, value: any) => void;
  isEditable?: boolean;
}

export const StructuredDataPreview: React.FC<StructuredDataPreviewProps> = ({
  data,
  onEditField,
  isEditable = false
}) => {
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-rose-600 text-white border-rose-700 shadow-sm shadow-rose-600/30';
      case 'high':
        return 'bg-orange-500 text-white border-orange-600';
      case 'medium':
        return 'bg-amber-500 text-white border-amber-600';
      default:
        return 'bg-emerald-600 text-white border-emerald-700';
    }
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>AI Clinical Extraction</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-emerald-400 border border-emerald-500/30">
                {Math.round((data.confidence || 0.9) * 100)}% Confidence
              </span>
            </h3>
            <span className="text-[11px] text-slate-400">Gemini 2.5 Flash Clinical Parser</span>
          </div>
        </div>

        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getSeverityBadge(data.severity)}`}>
          {data.severity} Risk
        </span>
      </div>

      {/* Top Patient & Category Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-800/50 p-3 rounded-xl border border-slate-800">
        <div>
          <span className="block text-[10px] text-slate-400 uppercase font-semibold">Household</span>
          <span className="text-xs font-bold text-white truncate block">{data.householdName}</span>
        </div>

        <div>
          <span className="block text-[10px] text-slate-400 uppercase font-semibold">Patient Name</span>
          <span className="text-xs font-bold text-emerald-300 truncate block">
            {data.patientName || 'Not specified'}
          </span>
        </div>

        <div>
          <span className="block text-[10px] text-slate-400 uppercase font-semibold">Category</span>
          <span className="text-xs font-medium text-slate-200 capitalize truncate block">
            {data.patientCategory?.replace('_', ' ') || 'Adult'}
          </span>
        </div>

        <div>
          <span className="block text-[10px] text-slate-400 uppercase font-semibold">Age / Weight</span>
          <span className="text-xs font-medium text-slate-200 truncate block">
            {data.age ? `${data.age} yrs` : '—'} {data.weightKg ? `• ${data.weightKg} kg` : ''}
          </span>
        </div>
      </div>

      {/* Vitals & Clinical Metrics */}
      {(data.temperatureC || data.bloodPressure || data.pregnancyDetails) && (
        <div className="flex flex-wrap gap-2 pt-1">
          {data.temperatureC && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-xs text-amber-300 border border-slate-700">
              <Activity className="w-3.5 h-3.5" />
              <span>Temp: {data.temperatureC}°C ({(data.temperatureC * 9/5 + 32).toFixed(1)}°F)</span>
            </div>
          )}
          {data.bloodPressure && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-xs text-rose-300 border border-slate-700">
              <Heart className="w-3.5 h-3.5" />
              <span>BP: {data.bloodPressure} mmHg</span>
            </div>
          )}
          {data.pregnancyDetails?.gestationalWeek && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-xs text-purple-300 border border-slate-700">
              <span>Gestation: {data.pregnancyDetails.gestationalWeek} Weeks</span>
            </div>
          )}
        </div>
      )}

      {/* Symptoms List */}
      <div>
        <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
          Identified Symptoms
        </span>
        <div className="flex flex-wrap gap-1.5">
          {data.symptoms.length > 0 ? (
            data.symptoms.map((symptom, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/30 text-xs font-medium"
              >
                {symptom}
              </span>
            ))
          ) : (
            <span className="text-xs text-slate-500 italic">No acute symptoms reported</span>
          )}
        </div>
      </div>

      {/* Medications Mentioned */}
      {data.medicationsMentioned && data.medicationsMentioned.length > 0 && (
        <div>
          <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Medications & Supplies
          </span>
          <div className="flex flex-wrap gap-1.5">
            {data.medicationsMentioned.map((med, idx) => (
              <span
                key={idx}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-500/15 text-teal-300 border border-teal-500/30 text-xs"
              >
                <Pill className="w-3 h-3" />
                <span>{med}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Referral & Follow-up Notice */}
      <div className="pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
          <div className="flex items-center gap-1.5 font-bold text-amber-400 mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Referral Status</span>
          </div>
          <p className="text-slate-300 text-[11px]">
            {data.referralRequired 
              ? `Required: ${data.referralFacility || 'Primary Health Centre'}` 
              : 'Routine home management; no escalation indicated'}
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
          <div className="flex items-center gap-1.5 font-bold text-emerald-400 mb-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Follow-up Recommendation</span>
          </div>
          <p className="text-slate-300 text-[11px]">
            {data.followUpRequired 
              ? `Due by ${data.followUpDate || '48 hours'}: ${data.followUpInstructions || 'Recheck symptoms'}`
              : 'Standard monthly survey schedule'}
          </p>
        </div>
      </div>
    </div>
  );
};
