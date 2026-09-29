import React from 'react';
import { 
  HelpCircle, 
  PhoneCall, 
  Mic, 
  ShieldCheck, 
  BookOpen, 
  AlertTriangle, 
  Radio,
  ExternalLink
} from 'lucide-react';

export const HelpSupport: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-[#00D6C7] uppercase tracking-wider">
          <HelpCircle className="w-4 h-4" />
          <span>Operational Assistance</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
          Help, Guidelines & Emergency Helplines
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Field operational guidelines, voice assistant command directory, and government medical escalations.
        </p>
      </div>

      {/* Emergency Helpline Numbers Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <a
          href="tel:108"
          className="p-5 rounded-3xl bg-rose-950/20 border border-rose-500/30 hover:border-rose-500/50 transition-all flex items-center justify-between group"
        >
          <div>
            <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">Emergency Ambulance</span>
            <span className="text-3xl font-black text-rose-300 font-mono mt-0.5 block">108</span>
            <span className="text-xs text-rose-200/80 mt-1 block">Toll-free 24x7 Critical Medical Transport</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <PhoneCall className="w-5 h-5" />
          </div>
        </a>

        <a
          href="tel:104"
          className="p-5 rounded-3xl bg-teal-950/20 border border-teal-500/30 hover:border-teal-500/50 transition-all flex items-center justify-between group"
        >
          <div>
            <span className="text-[10px] font-bold text-[#00D6C7] uppercase tracking-wider block">Health Information Helpline</span>
            <span className="text-3xl font-black text-[#43E0B0] font-mono mt-0.5 block">104</span>
            <span className="text-xs text-teal-200/80 mt-1 block">Medical advice & physician consultation</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-[#00D6C7] flex items-center justify-center group-hover:scale-110 transition-transform">
            <PhoneCall className="w-5 h-5" />
          </div>
        </a>

        <a
          href="tel:181"
          className="p-5 rounded-3xl bg-sky-950/20 border border-sky-500/30 hover:border-sky-500/50 transition-all flex items-center justify-between group"
        >
          <div>
            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">Women Helpline</span>
            <span className="text-3xl font-black text-sky-300 font-mono mt-0.5 block">181</span>
            <span className="text-xs text-sky-200/80 mt-1 block">Safety, institutional delivery & counseling</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <PhoneCall className="w-5 h-5" />
          </div>
        </a>
      </div>

      {/* Voice Assistant Commands Reference */}
      <div className="bg-[#08131B]/90 backdrop-blur-md rounded-3xl p-6 border border-white/5 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Mic className="w-4 h-4 text-[#00D6C7]" />
          <span>Vaani Voice Commands Directory (Hindi & English)</span>
        </h3>
        <p className="text-xs text-slate-400">
          Tap the microphone or press the Voice Query button anywhere in the application and say any of the following natural commands:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-[#050B10] border border-white/5 space-y-1">
            <div className="font-bold text-[#00D6C7]">"Show today's visits" / "आज की विज़िट्स दिखाओ"</div>
            <p className="text-slate-400">Navigates to the visits directory and filters today's recorded households.</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#050B10] border border-white/5 space-y-1">
            <div className="font-bold text-rose-400">"List high priority patients" / "गंभीर मरीज़ दिखाओ"</div>
            <p className="text-slate-400">Filters all beneficiaries categorized as HIGH or CRITICAL risk.</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#050B10] border border-white/5 space-y-1">
            <div className="font-bold text-[#43E0B0]">"Generate health report" / "हेल्थ रिपोर्ट बनाओ"</div>
            <p className="text-slate-400">Compiles the statutory field summary for supervision audit.</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#050B10] border border-white/5 space-y-1">
            <div className="font-bold text-sky-400">"New visit" / "नई विज़िट दर्ज करो"</div>
            <p className="text-slate-400">Opens the voice-first visit logger with automatic GPS tagging.</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#050B10] border border-white/5 space-y-1">
            <div className="font-bold text-amber-400">"Show pending alerts" / "अलर्ट दिखाओ"</div>
            <p className="text-slate-400">Displays unresolved clinical escalation alerts flagged by AI triage.</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#050B10] border border-white/5 space-y-1">
            <div className="font-bold text-teal-300">"Sync data" / "डेटा सिंक करो"</div>
            <p className="text-slate-400">Flushes all offline cached records to the central cloud database.</p>
          </div>
        </div>
      </div>

      {/* Field Worker Protocol Guidelines */}
      <div className="bg-[#08131B]/90 backdrop-blur-md rounded-3xl p-6 border border-white/5 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#00D6C7]" />
          <span>ASHA Field Operation Protocol Checklist</span>
        </h3>

        <div className="space-y-2.5 text-xs text-slate-300">
          <div className="p-3 rounded-2xl bg-[#050B10] border border-white/5 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#43E0B0] shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Verify Patient Identity:</strong> Confirm full name and age before recording clinical observations to maintain longitudinal registry accuracy.
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#050B10] border border-white/5 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#43E0B0] shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Ensure GPS Accuracy:</strong> Allow phone location services 3–5 seconds to settle below ±15 meters precision before committing a visit log.
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#050B10] border border-white/5 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#43E0B0] shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Speak Clearly into Vaani:</strong> Mention patient symptoms, duration, temperature, or maternal danger signs clearly in Hindi or English.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
