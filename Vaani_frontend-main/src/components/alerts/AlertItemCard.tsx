import React, { useState } from 'react';
import { HealthAlert, AlertSeverity, AlertStatus } from '../../types';
import { 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MapPin, 
  User, 
  Check, 
  MessageSquare, 
  ShieldAlert, 
  Stethoscope 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AlertItemCardProps {
  alert: HealthAlert;
  isSupervisor?: boolean;
}

export const AlertItemCard: React.FC<AlertItemCardProps> = ({ alert, isSupervisor = false }) => {
  const { updateAlert, currentUser } = useApp();
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [supervisorNote, setSupervisorNote] = useState(alert.supervisorNotes || '');

  const getSeverityStyle = (severity: AlertSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          border: 'border-rose-500/30 bg-rose-950/20',
          badge: 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse',
          icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
        };
      case 'HIGH':
        return {
          border: 'border-orange-500/30 bg-orange-950/20',
          badge: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
          icon: <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0" />
        };
      case 'MEDIUM':
        return {
          border: 'border-amber-500/30 bg-amber-950/20',
          badge: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
        };
      default:
        return {
          border: 'border-teal-500/30 bg-teal-950/20',
          badge: 'bg-teal-500/20 text-[#00D6C7] border border-teal-500/30',
          icon: <CheckCircle className="w-5 h-5 text-[#00D6C7] shrink-0" />
        };
    }
  };

  const handleStatusChange = (newStatus: AlertStatus) => {
    updateAlert(alert.id, { 
      status: newStatus,
      supervisorNotes: supervisorNote || alert.supervisorNotes 
    });
    setIsEditingNote(false);
  };

  const style = getSeverityStyle(alert.severity);

  return (
    <div className={`rounded-2xl border ${style.border} p-5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all bg-[#08131B]/90 backdrop-blur-md`}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        
        {/* Left Severity Icon & Title */}
        <div className="flex items-start gap-3">
          {style.icon}
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${style.badge}`}>
                {alert.severity} PRIORITY
              </span>
              <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                alert.status === 'RESOLVED' ? 'bg-emerald-500/15 text-[#43E0B0] border border-emerald-500/30' :
                alert.status === 'IN_REVIEW' ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30' :
                'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              }`}>
                {alert.status.replace('_', ' ')}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                {new Date(alert.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <h3 className="text-base font-bold text-white mt-1.5">
              {alert.title}
            </h3>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                {alert.householdName} • {alert.village}
              </span>
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-500" />
                ASHA: {alert.workerName}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls for Supervisor or Worker */}
        <div className="flex items-center gap-2 shrink-0">
          {alert.status === 'OPEN' && (
            <button
              onClick={() => handleStatusChange('IN_REVIEW')}
              className="px-3 py-1.5 rounded-xl bg-sky-500/15 text-sky-400 hover:bg-sky-500/25 border border-sky-500/30 text-xs font-semibold transition-all"
            >
              Start Review
            </button>
          )}

          {alert.status !== 'RESOLVED' && (
            <button
              onClick={() => handleStatusChange('RESOLVED')}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-[#050B10] font-bold text-xs shadow-[0_0_15px_rgba(67,224,176,0.2)] flex items-center gap-1 transition-all hover:scale-[1.02]"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark Resolved</span>
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed bg-[#050B10]/70 p-3 rounded-xl border border-white/5">
        {alert.description}
      </p>

      {/* Recommended Action Box */}
      <div className="mt-3 p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs">
        <span className="font-bold text-amber-400 flex items-center gap-1.5 mb-1">
          <Stethoscope className="w-3.5 h-3.5 text-amber-400" />
          <span>Recommended Clinical Action</span>
        </span>
        <p className="text-amber-200/90 font-medium">{alert.recommendedAction}</p>
      </div>

      {/* Supervisor Review Notes */}
      {alert.supervisorNotes && (
        <div className="mt-3 p-3 rounded-xl bg-sky-950/20 border border-sky-500/30 text-xs text-sky-300">
          <span className="font-bold block mb-0.5 text-sky-200">
            Supervisor Note ({alert.acknowledgedBy || 'Medical Officer'}):
          </span>
          <p className="text-slate-300">{alert.supervisorNotes}</p>
        </div>
      )}

      {/* Add / Edit Supervisor Note */}
      {isSupervisor && !isEditingNote && (
        <div className="mt-3 flex justify-end">
          <button
            onClick={() => setIsEditingNote(true)}
            className="text-xs font-semibold text-[#00D6C7] hover:text-[#43E0B0] flex items-center gap-1"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{alert.supervisorNotes ? 'Edit Supervisor Note' : '+ Add Supervisor Note'}</span>
          </button>
        </div>
      )}

      {isEditingNote && (
        <div className="mt-3 p-3 rounded-xl bg-[#050B10] border border-white/10 space-y-2">
          <label className="block text-xs font-bold text-slate-300">Supervisor Clinical Review Note:</label>
          <textarea
            value={supervisorNote}
            onChange={(e) => setSupervisorNote(e.target.value)}
            placeholder="Document contact with ASHA, ambulance dispatch, or NRC admission status..."
            rows={2}
            className="w-full text-xs p-2.5 rounded-lg border border-white/10 focus:border-teal-500 bg-slate-900/60 text-white outline-none"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsEditingNote(false)}
              className="px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              onClick={() => handleStatusChange(alert.status)}
              className="px-3 py-1 bg-sky-500/20 border border-sky-500/40 text-sky-300 rounded-lg text-xs font-semibold hover:bg-sky-500/30"
            >
              Save Note
            </button>
          </div>
        </div>
      )}

      {/* Medical Safety Disclaimer */}
      <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500">
        <span>AI Assistive Triage — Human Medical Officer verification required</span>
        <span>ID: {alert.id.slice(0, 14)}</span>
      </div>
    </div>
  );
};
